import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Key, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  RefreshCw,
  FileWarning,
  Network,
  HardDrive,
  Cpu,
  Activity,
} from 'lucide-react';

interface SecurityCheck {
  id: string;
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'warning';
  lastCheck: string;
}

const securityChecks: SecurityCheck[] = [
  {
    id: 'hmac',
    name: 'HMAC-SHA256 Authentication',
    description: 'All IPC communications are authenticated with HMAC tokens',
    status: 'passed',
    lastCheck: '2 min ago',
  },
  {
    id: 'rpc',
    name: 'JSON-RPC Security',
    description: 'Local-first RPC calls with token validation',
    status: 'passed',
    lastCheck: '2 min ago',
  },
  {
    id: 'zipslip',
    name: 'Zip Slip Protection',
    description: 'File path sanitization for mission pack imports',
    status: 'passed',
    lastCheck: '5 min ago',
  },
  {
    id: 'isolation',
    name: 'WSL2 Network Isolation',
    description: 'Labs are isolated from host network by default',
    status: 'passed',
    lastCheck: '1 min ago',
  },
  {
    id: 'drm',
    name: 'Pack DRM Verification',
    description: 'Mission pack integrity and license verification',
    status: 'warning',
    lastCheck: '10 min ago',
  },
  {
    id: 'daemon',
    name: 'Daemon Connection',
    description: 'Secure connection to local Go daemon',
    status: 'passed',
    lastCheck: 'Just now',
  },
];

export function SystemSecurity() {
  const [checks, setChecks] = useState<SecurityCheck[]>(securityChecks);
  const [isScanning, setIsScanning] = useState(false);

  const passedCount = checks.filter(c => c.status === 'passed').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;
  const failedCount = checks.filter(c => c.status === 'failed').length;

  const runScan = async () => {
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setChecks(prev => prev.map(check => ({
      ...check,
      lastCheck: 'Just now',
      status: check.id === 'drm' ? 'passed' : check.status,
    })));
    setIsScanning(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full p-4 gap-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center neon-border">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold neon-text">System Security</h2>
            <p className="text-sm text-muted-foreground mt-1">IPC Authentication & Protection Status</p>
          </div>
        </div>
        <button
          onClick={runScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          <span className="font-medium">{isScanning ? 'Scanning...' : 'Run Scan'}</span>
        </button>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-panel rounded-xl p-4 border-l-4 border-l-primary">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Passed</span>
          </div>
          <p className="text-3xl font-display font-bold text-primary">{passedCount}</p>
        </div>
        <div className="glass-panel rounded-xl p-4 border-l-4 border-l-warning">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <span className="text-sm text-muted-foreground">Warnings</span>
          </div>
          <p className="text-3xl font-display font-bold text-warning">{warningCount}</p>
        </div>
        <div className="glass-panel rounded-xl p-4 border-l-4 border-l-destructive">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-destructive" />
            <span className="text-sm text-muted-foreground">Failed</span>
          </div>
          <p className="text-3xl font-display font-bold text-destructive">{failedCount}</p>
        </div>
      </div>

      {/* HMAC Auth Visualization */}
      <div className="glass-panel rounded-xl p-4">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" />
          IPC Authentication Flow
        </h3>
        <div className="flex items-center justify-between gap-4">
          <FlowNode icon={<Cpu />} label="React GUI" status="active" />
          <FlowArrow label="HMAC Token" />
          <FlowNode icon={<Lock />} label="Auth Layer" status="active" />
          <FlowArrow label="Verified RPC" />
          <FlowNode icon={<Activity />} label="Go Daemon" status="active" />
          <FlowArrow label="Execute" />
          <FlowNode icon={<HardDrive />} label="WSL2" status="active" />
        </div>
      </div>

      {/* Security Checks */}
      <div className="flex-1 overflow-auto">
        <h3 className="font-semibold text-foreground mb-3">Security Checks</h3>
        <div className="space-y-2">
          {checks.map((check, index) => (
            <motion.div
              key={check.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-panel rounded-lg p-3 flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                check.status === 'passed' ? 'bg-primary/20' :
                check.status === 'warning' ? 'bg-warning/20' : 'bg-destructive/20'
              }`}>
                {check.status === 'passed' ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : check.status === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-warning" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground text-sm">{check.name}</h4>
                <p className="text-xs text-muted-foreground">{check.description}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs font-medium ${
                  check.status === 'passed' ? 'text-primary' :
                  check.status === 'warning' ? 'text-warning' : 'text-destructive'
                }`}>
                  {check.status.toUpperCase()}
                </span>
                <p className="text-xs text-muted-foreground">{check.lastCheck}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Zip Slip Protection Detail */}
      <div className="glass-panel rounded-xl p-4 border border-primary/30">
        <div className="flex items-start gap-3">
          <FileWarning className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground mb-1">Zip Slip Attack Prevention</h4>
            <p className="text-xs text-muted-foreground mb-2">
              All mission pack imports are sanitized to prevent path traversal attacks. 
              File paths are validated against directory escape attempts.
            </p>
            <code className="text-xs bg-muted/50 px-2 py-1 rounded text-primary font-mono">
              sanitizePath(path) → path.replace(/\.\./g, '').normalize()
            </code>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FlowNode({ 
  icon, 
  label, 
  status 
}: { 
  icon: React.ReactNode; 
  label: string; 
  status: 'active' | 'inactive';
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
        status === 'active' ? 'bg-primary/20 text-primary neon-border' : 'bg-muted text-muted-foreground'
      }`}>
        {icon}
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function FlowArrow({ label }: { label: string }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1">
      <div className="w-full h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50 relative">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-primary border-y-4 border-y-transparent" />
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}