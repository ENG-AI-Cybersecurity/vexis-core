import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Terminal,
  Wallet,
  ArrowRight,
  Bitcoin,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  SecurityAsset,
  WalletTransaction,
  saveTransaction,
  getWallet,
  updateWallet,
} from '@/lib/marketplace-db';

interface TransactionStepperProps {
  asset: SecurityAsset | null;
  currency: 'BTC' | 'ETH' | 'USDT';
  isOpen: boolean;
  onClose: () => void;
  onComplete: (success: boolean) => void;
}

type TransactionStep = 'confirm' | 'escrow-lock' | 'sandbox-verify' | 'release' | 'complete';

const stepInfo: Record<TransactionStep, { title: string; description: string }> = {
  confirm: { 
    title: 'Confirm Purchase', 
    description: 'Review asset details and confirm transaction' 
  },
  'escrow-lock': { 
    title: 'Escrow Lock', 
    description: 'Funds are locked in smart escrow until verification' 
  },
  'sandbox-verify': { 
    title: 'Sandbox Verification', 
    description: 'Run script in isolated environment to verify functionality' 
  },
  release: { 
    title: 'Release Funds', 
    description: 'Confirm script works and release payment to seller' 
  },
  complete: { 
    title: 'Transaction Complete', 
    description: 'Script delivered to your Vexis Lab' 
  },
};

export function TransactionStepper({ asset, currency, isOpen, onClose, onComplete }: TransactionStepperProps) {
  const [currentStep, setCurrentStep] = useState<TransactionStep>('confirm');
  const [isProcessing, setIsProcessing] = useState(false);
  const [escrowTxId, setEscrowTxId] = useState<string>('');
  const [sandboxPassed, setSandboxPassed] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);
  const [transactionId, setTransactionId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      resetStepper();
    }
  }, [isOpen]);

  const resetStepper = () => {
    setCurrentStep('confirm');
    setIsProcessing(false);
    setEscrowTxId('');
    setSandboxPassed(null);
    setProgress(0);
    setTransactionId(`tx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`);
  };

  const getPrice = () => {
    if (!asset) return 0;
    switch (currency) {
      case 'BTC': return asset.priceBTC;
      case 'ETH': return asset.priceETH;
      case 'USDT': return asset.priceUSDT;
    }
  };

  const getCurrencySymbol = () => {
    switch (currency) {
      case 'BTC': return '₿';
      case 'ETH': return 'Ξ';
      case 'USDT': return '$';
    }
  };

  const getCurrencyColor = () => {
    switch (currency) {
      case 'BTC': return 'text-[#F7931A]';
      case 'ETH': return 'text-[#627EEA]';
      case 'USDT': return 'text-[#26A17B]';
    }
  };

  const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const lockInEscrow = async () => {
    if (!asset) return;
    
    setIsProcessing(true);
    setProgress(10);
    
    await simulateDelay(800);
    setProgress(30);
    
    // Create escrow lock transaction
    const escrowTx: WalletTransaction = {
      id: `escrow-${transactionId}`,
      type: 'escrow_lock',
      assetId: asset.id,
      assetTitle: asset.title,
      amount: getPrice(),
      currency,
      status: 'pending',
      timestamp: Date.now(),
    };
    
    await saveTransaction(escrowTx);
    setProgress(60);
    await simulateDelay(600);
    
    // Generate mock tx hash
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    setEscrowTxId(txHash);
    
    // Update transaction to confirming
    await saveTransaction({ ...escrowTx, status: 'confirming', txHash });
    setProgress(100);
    await simulateDelay(500);
    
    setIsProcessing(false);
    setCurrentStep('sandbox-verify');
    setProgress(0);
  };

  const runSandboxVerification = async () => {
    setIsProcessing(true);
    setProgress(0);
    
    // Simulate sandbox execution
    for (let i = 0; i <= 100; i += 10) {
      await simulateDelay(300);
      setProgress(i);
    }
    
    // Check if asset has verification badge
    const passed = asset?.vexisSecureBadge || (asset?.logicDensityScore || 0) >= 50;
    setSandboxPassed(passed);
    
    setIsProcessing(false);
    setCurrentStep('release');
    setProgress(0);
  };

  const releaseFunds = async () => {
    if (!asset) return;
    
    setIsProcessing(true);
    setProgress(25);
    
    await simulateDelay(600);
    setProgress(50);
    
    // Create release transaction
    const releaseTx: WalletTransaction = {
      id: `release-${transactionId}`,
      type: 'escrow_release',
      assetId: asset.id,
      assetTitle: asset.title,
      amount: getPrice(),
      currency,
      status: 'completed',
      toAddress: asset.vendorId,
      timestamp: Date.now(),
    };
    
    await saveTransaction(releaseTx);
    setProgress(75);
    await simulateDelay(500);
    
    // Update original escrow to completed
    const escrowComplete: WalletTransaction = {
      id: `escrow-${transactionId}`,
      type: 'escrow_lock',
      assetId: asset.id,
      assetTitle: asset.title,
      amount: getPrice(),
      currency,
      status: 'completed',
      txHash: escrowTxId,
      timestamp: Date.now() - 5000,
    };
    await saveTransaction(escrowComplete);
    
    setProgress(100);
    await simulateDelay(400);
    
    setIsProcessing(false);
    setCurrentStep('complete');
    toast.success('Transaction completed successfully!');
  };

  const disputeTransaction = async () => {
    if (!asset) return;
    
    const disputeTx: WalletTransaction = {
      id: `dispute-${transactionId}`,
      type: 'escrow_lock',
      assetId: asset.id,
      assetTitle: asset.title,
      amount: getPrice(),
      currency,
      status: 'disputed',
      timestamp: Date.now(),
    };
    
    await saveTransaction(disputeTx);
    toast.error('Transaction disputed - Funds remain in escrow');
    onClose();
  };

  const getStepNumber = (step: TransactionStep) => {
    const steps: TransactionStep[] = ['confirm', 'escrow-lock', 'sandbox-verify', 'release', 'complete'];
    return steps.indexOf(step);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'confirm':
        return (
          <div className="space-y-4">
            {asset && (
              <Card className="bg-card/50 border-border/50">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold">{asset.title}</h3>
                      <p className="text-xs text-muted-foreground">by {asset.vendorName}</p>
                    </div>
                    {asset.vexisSecureBadge && (
                      <Badge className="bg-primary/20 text-primary">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge variant="outline">{asset.category}</Badge>
                    <Badge variant="outline">{asset.language}</Badge>
                  </div>
                  
                  <div className="pt-3 border-t border-border/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <span className={cn("text-2xl font-bold", getCurrencyColor())}>
                        {getCurrencySymbol()}{getPrice()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card className="bg-secondary/10 border-secondary/30">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-secondary mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Crypto-Escrow Protection</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your funds will be locked in escrow until you confirm the script works in your isolated lab environment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Button
              onClick={() => {
                setCurrentStep('escrow-lock');
                lockInEscrow();
              }}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Lock className="w-4 h-4 mr-2" />
              Lock Funds in Escrow
            </Button>
          </div>
        );

      case 'escrow-lock':
        return (
          <div className="space-y-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lock className="w-5 h-5 text-warning" />
                  Locking Funds in Escrow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progress} className="h-2" />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className={cn("font-mono", getCurrencyColor())}>
                      {getCurrencySymbol()}{getPrice()} {currency}
                    </span>
                  </div>
                  
                  {escrowTxId && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Transaction</span>
                      <span className="font-mono text-xs text-primary truncate max-w-[200px]">
                        {escrowTxId.slice(0, 16)}...
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="outline" className="border-warning text-warning">
                      <Clock className="w-3 h-3 mr-1" />
                      {progress < 100 ? 'Processing...' : 'Locked'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'sandbox-verify':
        return (
          <div className="space-y-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-primary" />
                  Sandbox Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isProcessing ? (
                  <>
                    <Progress value={progress} className="h-2" />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Running script in isolated environment...
                    </div>
                  </>
                ) : sandboxPassed !== null ? (
                  <div className={cn(
                    "p-4 rounded-lg text-center",
                    sandboxPassed ? "bg-primary/10" : "bg-destructive/10"
                  )}>
                    {sandboxPassed ? (
                      <>
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <div className="font-medium">Verification Passed</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Script executed successfully in sandbox
                        </p>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-8 h-8 mx-auto mb-2 text-destructive" />
                        <div className="font-medium">Verification Failed</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Script did not pass sandbox checks
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Run the purchased script in your isolated lab to verify it works as expected
                    </p>
                    <Button
                      onClick={runSandboxVerification}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Terminal className="w-4 h-4 mr-2" />
                      Run Sandbox Test
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'release':
        return (
          <div className="space-y-4">
            <Card className={cn(
              "border-2",
              sandboxPassed ? "bg-primary/5 border-primary/50" : "bg-destructive/5 border-destructive/50"
            )}>
              <CardContent className="pt-4">
                <div className="text-center mb-4">
                  {sandboxPassed ? (
                    <>
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-primary" />
                      <h3 className="font-bold">Ready to Release</h3>
                      <p className="text-xs text-muted-foreground">
                        Script verified successfully - release payment to seller?
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-warning" />
                      <h3 className="font-bold">Verification Issues Detected</h3>
                      <p className="text-xs text-muted-foreground">
                        You can dispute this transaction or release funds anyway
                      </p>
                    </>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={disputeTransaction}
                    className="border-destructive/50 text-destructive hover:bg-destructive/10"
                    disabled={isProcessing}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Dispute
                  </Button>
                  <Button
                    onClick={releaseFunds}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Unlock className="w-4 h-4 mr-2" />
                    )}
                    Release
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {isProcessing && (
              <Card className="bg-card/50 border-border/50">
                <CardContent className="pt-4">
                  <Progress value={progress} className="h-2 mb-2" />
                  <div className="text-xs text-center text-muted-foreground">
                    Releasing funds to seller...
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-4 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Transaction Complete!</h2>
            <p className="text-sm text-muted-foreground">
              {asset?.title} has been delivered to your Vexis Lab
            </p>
            
            <Card className="bg-card/50 border-border/50 text-left">
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-xs">{transactionId}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className={cn("font-mono", getCurrencyColor())}>
                    {getCurrencySymbol()}{getPrice()} {currency}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="bg-primary/20 text-primary">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Button
              onClick={() => {
                onComplete(true);
                onClose();
              }}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Terminal className="w-4 h-4 mr-2" />
              Open in Vexis Lab
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md glass-panel border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            {stepInfo[currentStep].title}
          </DialogTitle>
          <DialogDescription>
            {stepInfo[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-4">
          {(['confirm', 'escrow-lock', 'sandbox-verify', 'release', 'complete'] as TransactionStep[]).map((step, i) => {
            const isActive = currentStep === step;
            const isPast = getStepNumber(currentStep) > i;
            
            return (
              <div key={step} className="flex items-center">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all",
                  isActive ? "bg-primary text-primary-foreground" :
                  isPast ? "bg-primary/20 text-primary" :
                  "bg-muted text-muted-foreground"
                )}>
                  {isPast ? <CheckCircle className="w-3 h-3" /> : i + 1}
                </div>
                {i < 4 && (
                  <div className={cn(
                    "w-8 h-0.5 mx-0.5",
                    isPast ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
