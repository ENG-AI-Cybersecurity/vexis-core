import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Square, 
  Trash2, 
  Plus, 
  Cpu, 
  HardDrive, 
  Clock, 
  Network,
  Shield,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface Lab {
  id: string;
  name: string;
  distro: string;
  status: 'running' | 'stopped' | 'error';
  ram: number;
  ramLimit: number;
  cpu: number;
  uptime: string;
  network: 'isolated' | 'bridged' | 'nat';
}

const mockLabs: Lab[] = [
  {
    id: 'lab-001',
    name: 'Kali Attack Lab',
    distro: 'Kali Linux 2024.1',
    status: 'running',
    ram: 1024,
    ramLimit: 2048,
    cpu: 34,
    uptime: '2h 45m',
    network: 'isolated',
  },
  {
    id: 'lab-002',
    name: 'OSINT Workstation',
    distro: 'Ubuntu 22.04 LTS',
    status: 'running',
    ram: 512,
    ramLimit: 1024,
    cpu: 12,
    uptime: '45m',
    network: 'nat',
  },
  {
    id: 'lab-003',
    name: 'Malware Analysis',
    distro: 'REMnux 7.0',
    status: 'stopped',
    ram: 0,
    ramLimit: 4096,
    cpu: 0,
    uptime: '--',
    network: 'isolated',
  },
  {
    id: 'lab-004',
    name: 'CTF Practice',
    distro: 'Parrot OS 5.3',
    status: 'error',
    ram: 0,
    ramLimit: 2048,
    cpu: 0,
    uptime: '--',
    network: 'bridged',
  },
];

interface LabManagerProps {
  onCreateLab?: () => void;
}

export function LabManager({ onCreateLab }: LabManagerProps) {
  const [labs, setLabs] = useState<Lab[]>(mockLabs);
  const [selectedLab, setSelectedLab] = useState<string | null>(null);

  const runningLabs = labs.filter(l => l.status === 'running');
  const totalRam = runningLabs.reduce((acc, l) => acc + l.ram, 0);
  const avgCpu = runningLabs.length > 0 
    ? Math.round(runningLabs.reduce((acc, l) => acc + l.cpu, 0) / runningLabs.length) 
    : 0;

  const toggleLabStatus = (labId: string) => {
    setLabs(prev => prev.map(lab => {
      if (lab.id === labId) {
        if (lab.status === 'running') {
          return { ...lab, status: 'stopped' as const, ram: 0, cpu: 0, uptime: '--' };
        } else {
          return { 
            ...lab, 
            status: 'running' as const, 
            ram: Math.round(lab.ramLimit * 0.4),
            cpu: Math.round(Math.random() * 30 + 10),
            uptime: '0m'
          };
        }
      }
      return lab;
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full p-4 gap-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold neon-text">Lab Manager</h2>
          <p className="text-sm text-muted-foreground mt-1">WSL2 Security Lab Orchestrator</p>
        </div>
        <button 
          onClick={onCreateLab}
          className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors neon-border"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">Create Lab</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<Cpu className="w-5 h-5" />}
          label="Active Labs"
          value={runningLabs.length.toString()}
          subValue={`of ${labs.length} total`}
          color="green"
        />
        <StatCard
          icon={<HardDrive className="w-5 h-5" />}
          label="RAM Usage"
          value={`${(totalRam / 1024).toFixed(1)}GB`}
          subValue="allocated"
          color="purple"
        />
        <StatCard
          icon={<Cpu className="w-5 h-5" />}
          label="Avg CPU"
          value={`${avgCpu}%`}
          subValue="utilization"
          color="cyan"
        />
        <StatCard
          icon={<Shield className="w-5 h-5" />}
          label="Security"
          value="Verified"
          subValue="HMAC active"
          color="green"
        />
      </div>

      {/* Labs Grid */}
      <div className="flex-1 grid grid-cols-2 gap-4 overflow-auto">
        {labs.map((lab, index) => (
          <motion.div
            key={lab.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedLab(lab.id)}
            className={`glass-panel rounded-xl p-4 cursor-pointer transition-all ${
              selectedLab === lab.id ? 'neon-border' : 'hover:border-primary/30'
            }`}
          >
            {/* Lab Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  lab.status === 'running' ? 'bg-primary/20' :
                  lab.status === 'error' ? 'bg-destructive/20' : 'bg-muted'
                }`}>
                  {lab.status === 'running' ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : lab.status === 'error' ? (
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  ) : (
                    <Square className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{lab.name}</h3>
                  <p className="text-xs text-muted-foreground">{lab.distro}</p>
                </div>
              </div>
              <StatusBadge status={lab.status} />
            </div>

            {/* Lab Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <HardDrive className="w-4 h-4 text-secondary" />
                <span className="text-muted-foreground">RAM:</span>
                <span className="text-foreground">{lab.ram}MB / {lab.ramLimit}MB</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Cpu className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">CPU:</span>
                <span className="text-foreground">{lab.cpu}%</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Uptime:</span>
                <span className="text-foreground">{lab.uptime}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Network className="w-4 h-4 text-warning" />
                <span className="text-muted-foreground">Network:</span>
                <span className="text-foreground capitalize">{lab.network}</span>
              </div>
            </div>

            {/* RAM Progress Bar */}
            <div className="mb-4">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(lab.ram / lab.ramLimit) * 100}%` }}
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLabStatus(lab.id);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
                  lab.status === 'running'
                    ? 'bg-destructive/20 text-destructive hover:bg-destructive/30'
                    : 'bg-primary/20 text-primary hover:bg-primary/30'
                }`}
              >
                {lab.status === 'running' ? (
                  <>
                    <Square className="w-4 h-4" />
                    <span className="text-sm font-medium">Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span className="text-sm font-medium">Start</span>
                  </>
                )}
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-2 bg-muted/50 text-muted-foreground rounded-lg hover:bg-muted hover:text-foreground transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  subValue, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subValue: string;
  color: 'green' | 'purple' | 'cyan';
}) {
  const colorClasses = {
    green: 'text-primary bg-primary/10 border-primary/30',
    purple: 'text-secondary bg-secondary/10 border-secondary/30',
    cyan: 'text-accent bg-accent/10 border-accent/30',
  };

  return (
    <div className="glass-panel rounded-xl p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color]}`}>
        {icon}
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-display font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{subValue}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: 'running' | 'stopped' | 'error' }) {
  const config = {
    running: { label: 'Running', className: 'bg-primary/20 text-primary border-primary/30' },
    stopped: { label: 'Stopped', className: 'bg-muted text-muted-foreground border-border' },
    error: { label: 'Error', className: 'bg-destructive/20 text-destructive border-destructive/30' },
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${config[status].className}`}>
      {config[status].label}
    </span>
  );
}