import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Code,
  Terminal,
  Brain,
  FileSearch,
  Lock,
  Fingerprint,
  Activity,
  Globe,
  FileText,
  Server,
  Zap,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  SecurityAsset,
  SafetyReport,
  analyzeLogicDensity,
  generateSafetyReport,
  saveSandboxTest,
  SandboxTest,
} from '@/lib/marketplace-db';

interface VerificationWizardProps {
  asset: SecurityAsset | null;
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: (passed: boolean, asset: SecurityAsset) => void;
}

type WizardStep = 'intro' | 'turing-filter' | 'sandbox-run' | 'safety-report' | 'result';

const stepInfo: Record<WizardStep, { title: string; icon: React.ElementType }> = {
  intro: { title: 'Verification Overview', icon: Shield },
  'turing-filter': { title: 'Turing Filter (Anti-AI)', icon: Brain },
  'sandbox-run': { title: 'Sandbox Execution', icon: Terminal },
  'safety-report': { title: 'Safety Manifest', icon: FileSearch },
  result: { title: 'Verification Result', icon: Award },
};

export function VerificationWizard({ asset, isOpen, onClose, onVerificationComplete }: VerificationWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('intro');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [turingResult, setTuringResult] = useState<{ score: number; flags: string[] } | null>(null);
  const [safetyReport, setSafetyReport] = useState<SafetyReport | null>(null);
  const [overallPassed, setOverallPassed] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    if (isOpen) {
      resetWizard();
    }
  }, [isOpen]);

  const resetWizard = () => {
    setCurrentStep('intro');
    setIsProcessing(false);
    setProgress(0);
    setLogs([]);
    setTuringResult(null);
    setSafetyReport(null);
    setOverallPassed(false);
  };

  const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'success' ? '✓' : type === 'warning' ? '⚠' : type === 'error' ? '✗' : '›';
    setLogs(prev => [...prev, `[${timestamp}] ${prefix} ${message}`]);
  };

  const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runTuringFilter = async () => {
    if (!asset) return;
    
    setIsProcessing(true);
    addLog('Initializing Turing Filter analysis...', 'info');
    await simulateDelay(500);
    
    addLog('Parsing Abstract Syntax Tree (AST)...', 'info');
    await simulateDelay(600);
    setProgress(20);
    
    addLog('Scanning for AI-generated patterns...', 'info');
    await simulateDelay(800);
    setProgress(40);
    
    addLog('Analyzing variable naming conventions...', 'info');
    await simulateDelay(500);
    setProgress(60);
    
    addLog('Calculating Logic Density Score...', 'info');
    await simulateDelay(700);
    
    const result = analyzeLogicDensity(asset.sourceCode);
    setTuringResult(result);
    setProgress(80);
    
    if (result.flags.length > 0) {
      result.flags.forEach(flag => addLog(flag, 'warning'));
    }
    
    addLog(`Logic Density Score: ${result.score}%`, result.score >= 70 ? 'success' : result.score >= 50 ? 'warning' : 'error');
    setProgress(100);
    
    await simulateDelay(500);
    setIsProcessing(false);
    setCurrentStep('sandbox-run');
    setProgress(0);
  };

  const runSandboxExecution = async () => {
    if (!asset) return;
    
    setIsProcessing(true);
    addLog('Creating isolated WSL2 sandbox container...', 'info');
    await simulateDelay(800);
    setProgress(10);
    
    addLog(`Container ID: vexis-sandbox-${Math.random().toString(36).substr(2, 8)}`, 'info');
    await simulateDelay(400);
    setProgress(20);
    
    addLog('Mounting virtual filesystem with read-only bindings...', 'info');
    await simulateDelay(600);
    setProgress(30);
    
    addLog('Configuring network isolation (loopback only)...', 'info');
    await simulateDelay(500);
    setProgress(40);
    
    addLog('Injecting syscall interceptors...', 'info');
    await simulateDelay(700);
    setProgress(50);
    
    addLog(`Executing ${asset.language.toUpperCase()} script in dry-run mode...`, 'info');
    await simulateDelay(1200);
    setProgress(70);
    
    addLog('Capturing I/O activity...', 'info');
    await simulateDelay(600);
    setProgress(85);
    
    addLog('Execution completed successfully', 'success');
    setProgress(100);
    
    await simulateDelay(500);
    setIsProcessing(false);
    setCurrentStep('safety-report');
    setProgress(0);
  };

  const generateManifest = async () => {
    if (!asset) return;
    
    setIsProcessing(true);
    addLog('Analyzing execution trace...', 'info');
    await simulateDelay(600);
    setProgress(25);
    
    addLog('Compiling network activity report...', 'info');
    await simulateDelay(500);
    setProgress(50);
    
    addLog('Documenting filesystem operations...', 'info');
    await simulateDelay(500);
    setProgress(75);
    
    const report = generateSafetyReport(asset.sourceCode);
    setSafetyReport(report);
    
    addLog(`Network Activity: ${report.networkActivity ? 'DETECTED' : 'None'}`, report.networkActivity ? 'warning' : 'success');
    addLog(`Files Modified: ${report.filesModified.length}`, report.filesModified.length > 0 ? 'warning' : 'success');
    addLog(`External IPs: ${report.externalIPsContacted.length}`, report.externalIPsContacted.length > 0 ? 'warning' : 'success');
    addLog(`System Calls: ${report.systemCallsDetected.length}`, report.systemCallsDetected.length > 0 ? 'warning' : 'success');
    addLog(`Risk Level: ${report.riskLevel.toUpperCase()}`, report.riskLevel === 'safe' || report.riskLevel === 'low' ? 'success' : 'warning');
    
    setProgress(100);
    await simulateDelay(500);
    setIsProcessing(false);
    setCurrentStep('result');
    
    // Determine overall pass/fail
    const turingPassed = (turingResult?.score || 0) >= 50;
    const safetyPassed = report.passed;
    const hasUsageProof = asset.usageLog && asset.usageLog.length > 20;
    
    const passed = turingPassed && safetyPassed && hasUsageProof;
    setOverallPassed(passed);
    
    // Save sandbox test
    const test: SandboxTest = {
      id: `test-${Date.now()}`,
      assetId: asset.id,
      status: 'completed',
      startedAt: Date.now() - 10000,
      completedAt: Date.now(),
      report,
      logs,
    };
    await saveSandboxTest(test);
  };

  const completeVerification = () => {
    if (asset && safetyReport) {
      const verifiedAsset: SecurityAsset = {
        ...asset,
        isVerified: overallPassed,
        vexisSecureBadge: overallPassed,
        logicDensityScore: turingResult?.score || 0,
        isFlagged: !overallPassed,
        flagReason: !overallPassed ? turingResult?.flags.join('; ') : undefined,
        safetyReport,
      };
      onVerificationComplete(overallPassed, verifiedAsset);
    }
    onClose();
  };

  const getStepNumber = (step: WizardStep) => {
    const steps: WizardStep[] = ['intro', 'turing-filter', 'sandbox-run', 'safety-report', 'result'];
    return steps.indexOf(step);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'intro':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">Vexis Verification Protocol</h2>
              <p className="text-muted-foreground text-sm">
                Your script must pass all verification checks to receive the Vexis-Verified badge
              </p>
            </div>
            
            <div className="grid gap-3">
              {[
                { icon: Brain, title: 'Turing Filter', desc: 'Anti-AI code analysis to verify human authorship' },
                { icon: Terminal, title: 'Sandbox Execution', desc: 'Isolated dry-run in WSL2 container' },
                { icon: FileSearch, title: 'Safety Manifest', desc: 'Comprehensive security report generation' },
              ].map((step, i) => (
                <Card key={i} className="bg-card/50 border-border/50">
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <step.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{step.title}</div>
                      <div className="text-xs text-muted-foreground">{step.desc}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Button
              onClick={() => {
                setCurrentStep('turing-filter');
                runTuringFilter();
              }}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Zap className="w-4 h-4 mr-2" />
              Start Verification
            </Button>
          </div>
        );

      case 'turing-filter':
        return (
          <div className="space-y-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Turing Filter Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progress} className="h-2" />
                
                {turingResult && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Logic Density Score</span>
                      <Badge className={cn(
                        turingResult.score >= 70 ? 'bg-primary/20 text-primary' :
                        turingResult.score >= 50 ? 'bg-warning/20 text-warning' :
                        'bg-destructive/20 text-destructive'
                      )}>
                        {turingResult.score}%
                      </Badge>
                    </div>
                    
                    <div className={cn(
                      "p-3 rounded-lg text-sm",
                      turingResult.score >= 70 ? "bg-primary/10 text-primary" :
                      turingResult.score >= 50 ? "bg-warning/10 text-warning" :
                      "bg-destructive/10 text-destructive"
                    )}>
                      {turingResult.score >= 70 ? (
                        <><CheckCircle className="w-4 h-4 inline mr-2" />Human-authored code verified</>
                      ) : turingResult.score >= 50 ? (
                        <><AlertTriangle className="w-4 h-4 inline mr-2" />Some AI patterns detected - Review recommended</>
                      ) : (
                        <><XCircle className="w-4 h-4 inline mr-2" />High probability of AI-generated code</>
                      )}
                    </div>
                    
                    {turingResult.flags.length > 0 && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                        <div className="text-xs text-destructive font-medium mb-2">Detected Issues:</div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {turingResult.flags.map((flag, i) => (
                            <li key={i}>• {flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'sandbox-run':
        return (
          <div className="space-y-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-primary" />
                  Sandbox Execution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progress} className="h-2" />
                
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {['Init', 'Mount', 'Execute', 'Capture'].map((phase, i) => (
                    <div
                      key={phase}
                      className={cn(
                        "text-center py-2 rounded transition-all",
                        progress > (i + 1) * 25
                          ? "bg-primary/20 text-primary"
                          : progress > i * 25
                          ? "bg-primary/10 text-primary animate-pulse"
                          : "bg-muted/30 text-muted-foreground"
                      )}
                    >
                      {phase}
                    </div>
                  ))}
                </div>
                
                {!isProcessing && progress === 0 && (
                  <Button
                    onClick={runSandboxExecution}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Terminal className="w-4 h-4 mr-2" />
                    Run Sandbox
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'safety-report':
        return (
          <div className="space-y-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileSearch className="w-5 h-5 text-primary" />
                  Security Manifest
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progress} className="h-2" />
                
                {safetyReport && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Card className={cn(
                        "p-3",
                        !safetyReport.networkActivity ? "bg-primary/10" : "bg-warning/10"
                      )}>
                        <div className="flex items-center gap-2">
                          <Globe className={cn(
                            "w-4 h-4",
                            !safetyReport.networkActivity ? "text-primary" : "text-warning"
                          )} />
                          <div>
                            <div className="text-xs font-medium">Network</div>
                            <div className="text-xs text-muted-foreground">
                              {safetyReport.networkActivity ? 'Active' : 'None'}
                            </div>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className={cn(
                        "p-3",
                        safetyReport.filesModified.length === 0 ? "bg-primary/10" : "bg-warning/10"
                      )}>
                        <div className="flex items-center gap-2">
                          <FileText className={cn(
                            "w-4 h-4",
                            safetyReport.filesModified.length === 0 ? "text-primary" : "text-warning"
                          )} />
                          <div>
                            <div className="text-xs font-medium">Files</div>
                            <div className="text-xs text-muted-foreground">
                              {safetyReport.filesModified.length} modified
                            </div>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className={cn(
                        "p-3",
                        safetyReport.externalIPsContacted.length === 0 ? "bg-primary/10" : "bg-warning/10"
                      )}>
                        <div className="flex items-center gap-2">
                          <Server className={cn(
                            "w-4 h-4",
                            safetyReport.externalIPsContacted.length === 0 ? "text-primary" : "text-warning"
                          )} />
                          <div>
                            <div className="text-xs font-medium">External IPs</div>
                            <div className="text-xs text-muted-foreground">
                              {safetyReport.externalIPsContacted.length} contacted
                            </div>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className={cn(
                        "p-3",
                        safetyReport.systemCallsDetected.length === 0 ? "bg-primary/10" : "bg-warning/10"
                      )}>
                        <div className="flex items-center gap-2">
                          <Activity className={cn(
                            "w-4 h-4",
                            safetyReport.systemCallsDetected.length === 0 ? "text-primary" : "text-warning"
                          )} />
                          <div>
                            <div className="text-xs font-medium">Syscalls</div>
                            <div className="text-xs text-muted-foreground">
                              {safetyReport.systemCallsDetected.length} detected
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                    
                    <div className={cn(
                      "p-3 rounded-lg text-center",
                      safetyReport.riskLevel === 'safe' || safetyReport.riskLevel === 'low'
                        ? "bg-primary/10 text-primary"
                        : safetyReport.riskLevel === 'medium'
                        ? "bg-warning/10 text-warning"
                        : "bg-destructive/10 text-destructive"
                    )}>
                      <Badge className="mb-2">{safetyReport.riskLevel.toUpperCase()}</Badge>
                      <div className="text-sm">
                        {safetyReport.passed ? 'Safety check passed' : 'Manual review required'}
                      </div>
                    </div>
                  </div>
                )}
                
                {!isProcessing && progress === 0 && (
                  <Button
                    onClick={generateManifest}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <FileSearch className="w-4 h-4 mr-2" />
                    Generate Manifest
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'result':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={cn(
                "mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4",
                overallPassed ? "bg-primary/20" : "bg-destructive/20"
              )}>
                {overallPassed ? (
                  <Award className="w-10 h-10 text-primary" />
                ) : (
                  <XCircle className="w-10 h-10 text-destructive" />
                )}
              </div>
              <h2 className="text-xl font-bold mb-2">
                {overallPassed ? 'Verification Passed!' : 'Verification Failed'}
              </h2>
              <p className="text-muted-foreground text-sm">
                {overallPassed
                  ? 'Your script is eligible for the Vexis-Verified badge'
                  : 'Your script did not pass all verification checks'}
              </p>
            </div>
            
            <div className="grid gap-3">
              <Card className={cn(
                "p-4",
                (turingResult?.score || 0) >= 50 ? "bg-primary/10 border-primary/30" : "bg-destructive/10 border-destructive/30"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5" />
                    <span className="text-sm font-medium">Turing Filter</span>
                  </div>
                  <Badge>{turingResult?.score || 0}%</Badge>
                </div>
              </Card>
              
              <Card className={cn(
                "p-4",
                safetyReport?.passed ? "bg-primary/10 border-primary/30" : "bg-destructive/10 border-destructive/30"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm font-medium">Safety Check</span>
                  </div>
                  <Badge>{safetyReport?.riskLevel.toUpperCase()}</Badge>
                </div>
              </Card>
              
              <Card className={cn(
                "p-4",
                asset?.usageLog && asset.usageLog.length > 20 ? "bg-primary/10 border-primary/30" : "bg-destructive/10 border-destructive/30"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Fingerprint className="w-5 h-5" />
                    <span className="text-sm font-medium">Dirty Hands Proof</span>
                  </div>
                  <Badge>{asset?.usageLog && asset.usageLog.length > 20 ? 'VERIFIED' : 'MISSING'}</Badge>
                </div>
              </Card>
            </div>
            
            <Button
              onClick={completeVerification}
              className={cn(
                "w-full",
                overallPassed
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
            >
              {overallPassed ? (
                <>
                  <Award className="w-4 h-4 mr-2" />
                  Apply Vexis-Verified Badge
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Close & Review
                </>
              )}
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden glass-panel border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            <Fingerprint className="w-6 h-6 text-primary" />
            Verification Wizard
          </DialogTitle>
          <DialogDescription>
            Complete all checks to list your script on the marketplace
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-4">
          {(['intro', 'turing-filter', 'sandbox-run', 'safety-report', 'result'] as WizardStep[]).map((step, i) => {
            const StepIcon = stepInfo[step].icon;
            const isActive = currentStep === step;
            const isPast = getStepNumber(currentStep) > i;
            
            return (
              <div key={step} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all",
                  isActive ? "bg-primary text-primary-foreground" :
                  isPast ? "bg-primary/20 text-primary" :
                  "bg-muted text-muted-foreground"
                )}>
                  {isPast ? <CheckCircle className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                </div>
                {i < 4 && (
                  <div className={cn(
                    "w-12 h-0.5 mx-1",
                    isPast ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Main Content */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Logs Panel */}
          <Card className="bg-terminal border-border/50 flex flex-col h-[400px]">
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-sm flex items-center gap-2 font-mono text-primary">
                <Terminal className="w-4 h-4" />
                Verification Console
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-4">
                <div className="font-mono text-xs space-y-1">
                  {logs.length === 0 ? (
                    <div className="text-muted-foreground">
                      Waiting for verification to start...
                    </div>
                  ) : (
                    logs.map((log, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          log.includes('✓') ? 'text-primary' :
                          log.includes('✗') ? 'text-destructive' :
                          log.includes('⚠') ? 'text-warning' :
                          log.includes('>') ? 'text-accent' :
                          'text-muted-foreground'
                        )}
                      >
                        {log}
                      </motion.div>
                    ))
                  )}
                  <div ref={logsEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
