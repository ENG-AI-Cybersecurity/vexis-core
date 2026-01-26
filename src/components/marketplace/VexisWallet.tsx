import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Bitcoin,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Lock,
  Unlock,
  QrCode,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import {
  VexisWallet as WalletType,
  WalletTransaction,
  getWallet,
  getTransactions,
  saveTransaction,
} from '@/lib/marketplace-db';

const mockTransactions: WalletTransaction[] = [
  {
    id: 'tx-001',
    type: 'sale',
    assetId: 'asset-001',
    assetTitle: 'Advanced Port Scanner',
    amount: 0.002,
    currency: 'BTC',
    status: 'completed',
    txHash: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7',
    timestamp: Date.now() - 86400000,
  },
  {
    id: 'tx-002',
    type: 'escrow_lock',
    assetId: 'asset-002',
    assetTitle: 'Network Sniffer Pro',
    amount: 0.5,
    currency: 'ETH',
    status: 'pending',
    timestamp: Date.now() - 3600000,
  },
  {
    id: 'tx-003',
    type: 'withdrawal',
    amount: 500,
    currency: 'USDT',
    status: 'confirming',
    toAddress: 'TN9RRaXkCFtTXRso2GdTZxSxxwufNfw3pa',
    timestamp: Date.now() - 7200000,
  },
  {
    id: 'tx-004',
    type: 'purchase',
    assetId: 'asset-003',
    assetTitle: 'Privilege Escalation Kit',
    amount: 150,
    currency: 'USDT',
    status: 'completed',
    timestamp: Date.now() - 172800000,
  },
];

export function VexisWalletUI() {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<'BTC' | 'ETH' | 'USDT'>('BTC');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    setIsLoading(true);
    try {
      const walletData = await getWallet();
      setWallet(walletData);
      
      let txs = await getTransactions();
      if (txs.length === 0) {
        // Initialize with mock data
        for (const tx of mockTransactions) {
          await saveTransaction(tx);
        }
        txs = mockTransactions;
      }
      setTransactions(txs);
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  const getBalance = (currency: 'BTC' | 'ETH' | 'USDT') => {
    if (!wallet) return 0;
    switch (currency) {
      case 'BTC': return wallet.btcBalance;
      case 'ETH': return wallet.ethBalance;
      case 'USDT': return wallet.usdtBalance;
    }
  };

  const getEscrow = (currency: 'BTC' | 'ETH' | 'USDT') => {
    if (!wallet) return 0;
    switch (currency) {
      case 'BTC': return wallet.btcPendingEscrow;
      case 'ETH': return wallet.ethPendingEscrow;
      case 'USDT': return wallet.usdtPendingEscrow;
    }
  };

  const getAddress = (currency: 'BTC' | 'ETH' | 'USDT') => {
    if (!wallet) return '';
    switch (currency) {
      case 'BTC': return wallet.btcAddress;
      case 'ETH': return wallet.ethAddress;
      case 'USDT': return wallet.usdtAddress;
    }
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'BTC': return <Bitcoin className="w-5 h-5 text-[#F7931A]" />;
      case 'ETH': return <span className="text-[#627EEA] font-bold text-lg">Ξ</span>;
      case 'USDT': return <span className="text-[#26A17B] font-bold text-lg">₮</span>;
      default: return null;
    }
  };

  const getCurrencyColor = (currency: string) => {
    switch (currency) {
      case 'BTC': return 'text-[#F7931A]';
      case 'ETH': return 'text-[#627EEA]';
      case 'USDT': return 'text-[#26A17B]';
      default: return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'pending': return <Clock className="w-4 h-4 text-warning" />;
      case 'confirming': return <RefreshCw className="w-4 h-4 text-accent animate-spin" />;
      case 'failed': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sale':
      case 'escrow_release': return <ArrowDownLeft className="w-4 h-4 text-primary" />;
      case 'purchase':
      case 'withdrawal': return <ArrowUpRight className="w-4 h-4 text-destructive" />;
      case 'escrow_lock': return <Lock className="w-4 h-4 text-warning" />;
      default: return null;
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawAddress) {
      toast.error('Please fill all fields');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount > getBalance(selectedCurrency)) {
      toast.error('Insufficient balance');
      return;
    }

    const tx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'withdrawal',
      amount,
      currency: selectedCurrency,
      status: 'pending',
      toAddress: withdrawAddress,
      timestamp: Date.now(),
    };

    await saveTransaction(tx);
    setTransactions([tx, ...transactions]);
    setWithdrawAmount('');
    setWithdrawAddress('');
    toast.success('Withdrawal initiated');
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold neon-text flex items-center gap-3">
            <Wallet className="w-7 h-7" />
            Vexis Wallet
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your crypto earnings and escrow funds
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadWalletData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Balance Cards */}
        <div className="lg:col-span-2 space-y-4">
          {/* Currency Tabs */}
          <Tabs value={selectedCurrency} onValueChange={(v) => setSelectedCurrency(v as 'BTC' | 'ETH' | 'USDT')}>
            <TabsList className="grid grid-cols-3 bg-muted/30">
              <TabsTrigger value="BTC" className="data-[state=active]:text-[#F7931A]">
                <Bitcoin className="w-4 h-4 mr-2" />
                Bitcoin
              </TabsTrigger>
              <TabsTrigger value="ETH" className="data-[state=active]:text-[#627EEA]">
                <span className="mr-2 font-bold">Ξ</span>
                Ethereum
              </TabsTrigger>
              <TabsTrigger value="USDT" className="data-[state=active]:text-[#26A17B]">
                <span className="mr-2 font-bold">₮</span>
                Tether
              </TabsTrigger>
            </TabsList>

            {(['BTC', 'ETH', 'USDT'] as const).map((currency) => (
              <TabsContent key={currency} value={currency} className="mt-4 space-y-4">
                {/* Balance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="glass-panel border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground uppercase">Available</span>
                        <TrendingUp className="w-4 h-4 text-primary" />
                      </div>
                      <div className={cn("text-2xl font-bold", getCurrencyColor(currency))}>
                        {currency === 'USDT' ? '$' : ''}{getBalance(currency).toFixed(currency === 'USDT' ? 2 : 4)}
                        <span className="text-sm ml-1 text-muted-foreground">{currency}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-panel border-warning/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground uppercase">Pending Escrow</span>
                        <Lock className="w-4 h-4 text-warning" />
                      </div>
                      <div className="text-2xl font-bold text-warning">
                        {currency === 'USDT' ? '$' : ''}{getEscrow(currency).toFixed(currency === 'USDT' ? 2 : 4)}
                        <span className="text-sm ml-1 text-muted-foreground">{currency}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-panel border-secondary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground uppercase">Total</span>
                        <Wallet className="w-4 h-4 text-secondary" />
                      </div>
                      <div className="text-2xl font-bold text-secondary">
                        {currency === 'USDT' ? '$' : ''}{(getBalance(currency) + getEscrow(currency)).toFixed(currency === 'USDT' ? 2 : 4)}
                        <span className="text-sm ml-1 text-muted-foreground">{currency}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Deposit Address */}
                <Card className="glass-panel border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ArrowDownLeft className="w-4 h-4 text-primary" />
                      Deposit Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-background/50 rounded-lg p-3 font-mono text-xs break-all">
                        {getAddress(currency)}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyAddress(getAddress(currency))}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Dialog open={showQR} onOpenChange={setShowQR}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <QrCode className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-sm glass-panel">
                          <DialogHeader>
                            <DialogTitle className="text-center">
                              {currency} Deposit Address
                            </DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col items-center gap-4 py-4">
                            <div className="p-4 bg-white rounded-lg">
                              <QRCodeSVG
                                value={getAddress(currency)}
                                size={200}
                                level="H"
                                includeMargin
                              />
                            </div>
                            <div className="text-xs font-mono text-center break-all text-muted-foreground px-4">
                              {getAddress(currency)}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>

                {/* Withdraw */}
                <Card className="glass-panel border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4 text-destructive" />
                      Withdraw {currency}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground uppercase">Amount</label>
                        <Input
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="0.00"
                          className="bg-background/50 mt-1"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          Max: {getBalance(currency).toFixed(currency === 'USDT' ? 2 : 4)} {currency}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground uppercase">
                          Destination Address
                        </label>
                        <Input
                          value={withdrawAddress}
                          onChange={(e) => setWithdrawAddress(e.target.value)}
                          placeholder={`${currency} address`}
                          className="bg-background/50 mt-1"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" />
                        Network fee: ~0.0001 {currency}
                      </div>
                      <Button
                        onClick={handleWithdraw}
                        disabled={!withdrawAmount || !withdrawAddress}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <ArrowUpRight className="w-4 h-4 mr-2" />
                        Withdraw
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Transaction History */}
        <Card className="glass-panel border-primary/20 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <AnimatePresence mode="popLayout">
                {transactions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 pr-4">
                    {transactions.map((tx) => (
                      <motion.div
                        key={tx.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(tx.type)}
                            <div>
                              <div className="text-sm font-medium capitalize">
                                {tx.type.replace('_', ' ')}
                              </div>
                              {tx.assetTitle && (
                                <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                                  {tx.assetTitle}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={cn(
                              "text-sm font-medium",
                              tx.type === 'sale' || tx.type === 'escrow_release' 
                                ? 'text-primary' : 'text-foreground'
                            )}>
                              {tx.type === 'sale' || tx.type === 'escrow_release' ? '+' : '-'}
                              {tx.amount} {tx.currency}
                            </div>
                            <div className="flex items-center gap-1 justify-end">
                              {getStatusIcon(tx.status)}
                              <span className="text-xs text-muted-foreground capitalize">
                                {tx.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(tx.timestamp).toLocaleString()}
                          </span>
                          {tx.txHash && (
                            <Button variant="ghost" size="sm" className="h-6 text-[10px]">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View TX
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
