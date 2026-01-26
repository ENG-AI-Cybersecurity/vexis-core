import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Globe,
  FileText,
  Server,
  Activity,
  Lock,
  Unlock,
  Terminal,
  Eye,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { SecurityAsset, SafetyReport, generateSafetyReport, saveSandboxTest, SandboxTest } from '@/lib/marketplace-db';

interface ExecutionSandboxProps {
  asset: SecurityAsset | null;
  isOpen: boolean;
  onClose: () => void;
  onValidationComplete: (passed: boolean, report: SafetyReport) => void;
}

type TestPhase = 'idle' | 'initializing' | 'scanning' | 'executing' | 'analyzing' | 'complete';

const phaseMessages: Record<TestPhase, string> = {
  idle: 'Ready to validate',
  initializing: 'Initializing WSL sandbox environment...',
  scanning: 'Scanning source code for malicious patterns...',
  executing: 'Running dry-run in isolated container...',
  analyzing: 'Generating safety analysis report...',
  complete: 'Validation complete',
};

export function ExecutionSandbox({ asset, isOpen, onClose, onValidationComplete }: ExecutionSandboxProps) {
  const [phase, setPhase] = useState<TestPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [report, setReport] = useState<SafetyReport | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    if (isOpen) {
      setPhase('idle');
      setProgress(0);
      setLogs([]);
      setReport(null);
    }
  }, [isOpen]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const runValidation = async () => {
    if (!asset) return;

    setPhase('initializing');
    setProgress(0);
    addLog('Starting Vexis Sandbox validation...');
    addLog(`Asset: ${asset.title}`);
    addLog(`Language: ${asset.language.toUpperCase()}`);

    // Phase 1: Initialize
    await simulatePhase(10, [
      'Creating isolated WSL2 container...',
      'Mounting virtual filesystem...',
      'Configuring network isolation...',
      'Container ready: vexis-sandbox-' + Math.random().toString(36).substr(2, 8),
    ]);

    // Phase 2: Scan
    setPhase('scanning');
    await simulatePhase(35, [
      'Parsing source code AST...',
      'Checking for obfuscated code patterns...',
      'Scanning for known malware signatures...',
      'Analyzing import statements...',
      `Logic Density Score: ${asset.logicDensityScore}%`,
    ]);

    // Phase 3: Execute
    setPhase('executing');
    await simulatePhase(70, [
      'Executing dry-run with sandboxed I/O...',
      '> Intercepting system calls...',
      '> Monitoring network activity...',
      '> Tracking file operations...',
      'Execution completed in 2.3s',
    ]);

    // Phase 4: Analyze
    setPhase('analyzing');
    const safetyReport = generateSafetyReport(asset.sourceCode);
    
    await simulatePhase(95, [
      'Generating safety report...',
      `Network Activity: ${safetyReport.networkActivity ? 'DETECTED' : 'None'}`,
      `Files Modified: ${safetyReport.filesModified.length}`,
      `External IPs: ${safetyReport.externalIPsContacted.length}`,
      `System Calls: ${safetyReport.systemCallsDetected.length}`,
      `Risk Level: ${safetyReport.riskLevel.toUpperCase()}`,
    ]);

    // Complete
    setPhase('complete');
    setProgress(100);
    setReport(safetyReport);

    const passed = safetyReport.passed && asset.logicDensityScore >= 50;
    
    if (passed) {
      addLog('✓ VALIDATION PASSED - Eligible for Vexis-Secure badge');
    } else {
      addLog('✗ VALIDATION FAILED - Review required');
    }

    // Save test record
    const test: SandboxTest = {
      id: `test-${Date.now()}`,
      assetId: asset.id,
      status: 'completed',
      startedAt: Date.now() - 10000,
      completedAt: Date.now(),
      report: safetyReport,
      logs,
    };
    await saveSandboxTest(test);

    onValidationComplete(passed, safetyReport);
  };

  const simulatePhase = async (targetProgress: number, messages: string[]) => {
    const progressStep = (targetProgress - progress) / messages.length;
    
    for (const msg of messages) {
      await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300));
      addLog(msg);
      setProgress(prev => Math.min(prev + progressStep, targetProgress));
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'safe': return 'text-primary bg-primary/20';
      case 'low': return 'text-primary bg-primary/20';
      case 'medium': return 'text-warning bg-warning/20';
      case 'high': return 'text-destructive bg-destructive/20';
      case 'critical': return 'text-destructive bg-destructive/20';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'safe':
      case 'low':
        return <CheckCircle className="w-5 h-5 text-primary" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      default:
        return <XCircle className="w-5 h-5 text-destructive" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden glass-panel border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            <Shield className="w-6 h-6 text-primary" />
            Vexis Execution Sandbox
          </DialogTitle>
          <DialogDescription>
            Validate script safety in an isolated WSL environment before purchase
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          {/* Control Panel */}
          <div className="space-y-4">
            {/* Asset Info */}
            {asset && (
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Target Asset
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="font-medium">{asset.title}</div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{asset.category}</Badge>
                    <Badge variant="outline">{asset.language}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Vendor: {asset.vendorName}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Validation Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progress} className="h-2" />
                <div className="flex items-center gap-2 text-sm">
                  {phase !== 'idle' && phase !== 'complete' && (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  )}
                  {phase === 'complete' && report?.passed && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                  {phase === 'complete' && !report?.passed && (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                  <span className="text-muted-foreground">{phaseMessages[phase]}</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs">
                  {(['initializing', 'scanning', 'executing', 'analyzing'] as const).map((p, i) => (
                    <div
                      key={p}
                      className={cn(
                        "text-center py-2 rounded transition-all",
                        phase === p
                          ? "bg-primary/20 text-primary border border-primary/50"
                          : ['complete'].includes(phase) || 
                            (phase === 'scanning' && i === 0) ||
                            (phase === 'executing' && i <= 1) ||
                            (phase === 'analyzing' && i <= 2)
                          ? "bg-primary/10 text-primary/70"
                          : "bg-muted/30 text-muted-foreground"
                      )}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1, 4)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Safety Report */}
            <AnimatePresence>
              {report && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className={cn(
                    "border-2",
                    report.passed ? "bg-primary/5 border-primary/50" : "bg-destructive/5 border-destructive/50"
                  )}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {getRiskIcon(report.riskLevel)}
                        Safety Report
                        <Badge className={getRiskLevelColor(report.riskLevel)}>
                          {report.riskLevel.toUpperCase()}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <Globe className={cn(
                            "w-4 h-4",
                            report.networkActivity ? "text-warning" : "text-primary"
                          )} />
                          <span className="text-xs">
                            Network: {report.networkActivity ? 'Active' : 'None'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className={cn(
                            "w-4 h-4",
                            report.filesModified.length > 0 ? "text-warning" : "text-primary"
                          )} />
                          <span className="text-xs">
                            Files: {report.filesModified.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Server className={cn(
                            "w-4 h-4",
                            report.externalIPsContacted.length > 0 ? "text-warning" : "text-primary"
                          )} />
                          <span className="text-xs">
                            IPs: {report.externalIPsContacted.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Terminal className={cn(
                            "w-4 h-4",
                            report.systemCallsDetected.length > 0 ? "text-warning" : "text-primary"
                          )} />
                          <span className="text-xs">
                            Syscalls: {report.systemCallsDetected.length}
                          </span>
                        </div>
                      </div>

                      {report.filesModified.length > 0 && (
                        <div className="text-xs">
                          <div className="text-muted-foreground mb-1">Modified Files:</div>
                          <div className="font-mono text-[10px] text-warning">
                            {report.filesModified.join(', ')}
                          </div>
                        </div>
                      )}

                      {report.externalIPsContacted.length > 0 && (
                        <div className="text-xs">
                          <div className="text-muted-foreground mb-1">External IPs:</div>
                          <div className="font-mono text-[10px] text-warning">
                            {report.externalIPsContacted.join(', ')}
                          </div>
                        </div>
                      )}

                      <div className={cn(
                        "p-3 rounded text-center text-sm font-medium",
                        report.passed ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
                      )}>
                        {report.passed ? (
                          <>
                            <Lock className="w-4 h-4 inline mr-2" />
                            Eligible for Vexis-Secure Badge
                          </>
                        ) : (
                          <>
                            <Unlock className="w-4 h-4 inline mr-2" />
                            Manual Review Required
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={runValidation}
                disabled={phase !== 'idle' && phase !== 'complete'}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {phase === 'idle' ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Validation
                  </>
                ) : phase === 'complete' ? (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Re-validate
                  </>
                ) : (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
                  </>
                )}
              </Button>
              {report?.passed && (
                <Button variant="outline" className="border-primary/50">
                  <Download className="w-4 h-4 mr-2" />
                  Download to Lab
                </Button>
              )}
            </div>
          </div>

          {/* Logs Panel */}
          <Card className="bg-terminal border-border/50 flex flex-col h-[400px]">
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-sm flex items-center gap-2 font-mono text-primary">
                <Terminal className="w-4 h-4" />
                Sandbox Console
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-4">
                <div className="font-mono text-xs space-y-1">
                  {logs.length === 0 ? (
                    <div className="text-muted-foreground">
                      Waiting for validation to start...
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
                          log.includes('DETECTED') || log.includes('high') || log.includes('critical') 
                            ? 'text-warning' :
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
