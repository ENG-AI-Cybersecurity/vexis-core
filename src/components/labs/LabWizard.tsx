import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Cpu,
  Network,
  Shield,
  Zap,
  Globe,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { sendRPCRequest } from '@/lib/ipc';
import { saveLab } from '@/lib/db';

interface LabWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onLabCreated: () => void;
}

interface DistroOption {
  id: string;
  name: string;
  version: string;
  icon: string;
  description: string;
  defaultRam: number;
}

const distros: DistroOption[] = [
  { id: 'kali', name: 'Kali Linux', version: '2024.1', icon: '🐉', description: 'Penetration testing & security auditing', defaultRam: 2 },
  { id: 'parrot', name: 'Parrot OS', version: '5.3', icon: '🦜', description: 'Security & forensics', defaultRam: 2 },
  { id: 'ubuntu', name: 'Ubuntu', version: '22.04 LTS', icon: '🟠', description: 'General purpose Linux', defaultRam: 1 },
  { id: 'remnux', name: 'REMnux', version: '7.0', icon: '🔬', description: 'Malware analysis', defaultRam: 4 },
  { id: 'arch', name: 'Arch Linux', version: 'Rolling', icon: '🏔️', description: 'Minimalist, customizable', defaultRam: 1 },
  { id: 'alpine', name: 'Alpine Linux', version: '3.19', icon: '🏔️', description: 'Lightweight & secure', defaultRam: 0.5 },
];

export function LabWizard({ isOpen, onClose, onLabCreated }: LabWizardProps) {
  const [step, setStep] = useState(0);
  const [labName, setLabName] = useState('');
  const [selectedDistro, setSelectedDistro] = useState<DistroOption | null>(null);
  const [ramGB, setRamGB] = useState(2);
  const [airGap, setAirGap] = useState(false);
  const [vpnTunnel, setVpnTunnel] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const steps = [
    { title: 'Distribution', subtitle: 'Select your base OS' },
    { title: 'Configuration', subtitle: 'Name & resources' },
    { title: 'Network', subtitle: 'Isolation settings' },
    { title: 'Review', subtitle: 'Confirm and create' },
  ];

  const canProceed = () => {
    switch (step) {
      case 0: return selectedDistro !== null;
      case 1: return labName.trim().length > 0 && ramGB >= 0.5;
      case 2: return true;
      case 3: return true;
      default: return false;
    }
  };

  const handleCreate = async () => {
    if (!selectedDistro) return;
    
    setIsCreating(true);
    
    try {
      // Send RPC request (this will be logged by the IPC debugger)
      await sendRPCRequest('lab.create', {
        name: labName,
        distro: selectedDistro.id,
        ram: ramGB * 1024,
        airGap,
        vpnTunnel,
      });
      
      // Save to IndexedDB
      await saveLab({
        id: `lab-${Date.now()}`,
        name: labName,
        distro: `${selectedDistro.name} ${selectedDistro.version}`,
        status: 'stopped',
        ram: 0,
        ramLimit: ramGB * 1024,
        cpu: 0,
        uptime: '--',
        network: airGap ? 'isolated' : vpnTunnel ? 'bridged' : 'nat',
        airGap,
        vpnTunnel,
        createdAt: Date.now(),
      });
      
      toast.success(`Lab "${labName}" created successfully!`, {
        icon: '🚀',
        style: {
          background: 'hsl(220 25% 8%)',
          color: 'hsl(120 100% 50%)',
          border: '1px solid hsl(120 100% 25%)',
        },
      });
      
      onLabCreated();
      handleClose();
    } catch (error) {
      toast.error('Failed to create lab', {
        style: {
          background: 'hsl(220 25% 8%)',
          color: 'hsl(0 85% 55%)',
          border: '1px solid hsl(0 85% 35%)',
        },
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setStep(0);
    setLabName('');
    setSelectedDistro(null);
    setRamGB(2);
    setAirGap(false);
    setVpnTunnel(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          {/* Wizard Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50"
          >
            <div className="glass-panel rounded-2xl border border-primary/30 shadow-2xl overflow-hidden neon-border">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
                <div>
                  <h2 className="font-display text-xl font-bold neon-text">Create New Lab</h2>
                  <p className="text-sm text-muted-foreground">{steps[step].subtitle}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Progress */}
              <div className="px-6 py-4 border-b border-border/40">
                <div className="flex items-center gap-2">
                  {steps.map((s, i) => (
                    <div key={i} className="flex-1 flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        i < step ? 'bg-primary text-primary-foreground' :
                        i === step ? 'bg-primary/20 text-primary neon-border' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {i < step ? <Check className="w-4 h-4" /> : i + 1}
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 ${
                          i < step ? 'bg-primary' : 'bg-muted'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 min-h-[300px]">
                <AnimatePresence mode="wait">
                  {step === 0 && (
                    <motion.div
                      key="step-0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="grid grid-cols-3 gap-3"
                    >
                      {distros.map((distro) => (
                        <button
                          key={distro.id}
                          onClick={() => {
                            setSelectedDistro(distro);
                            setRamGB(distro.defaultRam);
                          }}
                          className={`p-4 rounded-xl text-left transition-all ${
                            selectedDistro?.id === distro.id
                              ? 'bg-primary/20 border-2 border-primary neon-border'
                              : 'glass-panel hover:border-primary/50'
                          }`}
                        >
                          <div className="text-3xl mb-2">{distro.icon}</div>
                          <div className="font-semibold text-foreground">{distro.name}</div>
                          <div className="text-xs text-muted-foreground">{distro.version}</div>
                          <div className="text-xs text-muted-foreground mt-2 line-clamp-2">{distro.description}</div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                  
                  {step === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {/* Lab Name */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Lab Name</label>
                        <input
                          type="text"
                          value={labName}
                          onChange={(e) => setLabName(e.target.value)}
                          placeholder="e.g., Pentesting Lab Alpha"
                          className="w-full px-4 py-3 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      
                      {/* RAM Slider */}
                      <div>
                        <label className="flex items-center justify-between text-sm font-medium text-foreground mb-2">
                          <span className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-primary" />
                            RAM Allocation
                          </span>
                          <span className="text-primary font-mono">{ramGB} GB</span>
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="8"
                          step="0.5"
                          value={ramGB}
                          onChange={(e) => setRamGB(parseFloat(e.target.value))}
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>512MB</span>
                          <span>8GB</span>
                        </div>
                      </div>
                      
                      {/* Selected Distro Preview */}
                      {selectedDistro && (
                        <div className="glass-panel rounded-lg p-4 flex items-center gap-4">
                          <span className="text-4xl">{selectedDistro.icon}</span>
                          <div>
                            <div className="font-semibold">{selectedDistro.name}</div>
                            <div className="text-sm text-muted-foreground">{selectedDistro.version}</div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  {step === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {/* Air-Gap Mode */}
                      <button
                        onClick={() => setAirGap(!airGap)}
                        className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4 ${
                          airGap
                            ? 'bg-destructive/20 border-2 border-destructive'
                            : 'glass-panel hover:border-primary/50'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          airGap ? 'bg-destructive/30 text-destructive' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Lock className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">Air-Gap Mode</span>
                            <span className={`px-2 py-0.5 text-xs rounded ${
                              airGap ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'
                            }`}>
                              {airGap ? 'ENABLED' : 'DISABLED'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Complete network isolation. No internet or LAN access.
                          </p>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-colors ${
                          airGap ? 'bg-destructive' : 'bg-muted'
                        }`}>
                          <div className={`w-5 h-5 rounded-full bg-foreground transition-transform mt-0.5 ${
                            airGap ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </div>
                      </button>
                      
                      {/* VPN Tunneling */}
                      <button
                        onClick={() => !airGap && setVpnTunnel(!vpnTunnel)}
                        disabled={airGap}
                        className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4 ${
                          airGap ? 'opacity-50 cursor-not-allowed' :
                          vpnTunnel
                            ? 'bg-primary/20 border-2 border-primary'
                            : 'glass-panel hover:border-primary/50'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          vpnTunnel ? 'bg-primary/30 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Globe className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">VPN Tunneling</span>
                            <span className={`px-2 py-0.5 text-xs rounded ${
                              vpnTunnel ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                            }`}>
                              {vpnTunnel ? 'ENABLED' : 'DISABLED'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Route all traffic through your VPN connection.
                          </p>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-colors ${
                          vpnTunnel ? 'bg-primary' : 'bg-muted'
                        }`}>
                          <div className={`w-5 h-5 rounded-full bg-foreground transition-transform mt-0.5 ${
                            vpnTunnel ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </div>
                      </button>
                      
                      {/* Network Summary */}
                      <div className="glass-panel rounded-lg p-4 mt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Network className="w-4 h-4 text-accent" />
                          <span className="text-muted-foreground">Network Mode:</span>
                          <span className="text-foreground font-semibold">
                            {airGap ? 'Isolated (Air-Gap)' : vpnTunnel ? 'Bridged (VPN)' : 'NAT'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {step === 3 && (
                    <motion.div
                      key="step-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="glass-panel rounded-xl p-6">
                        <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                          <Zap className="w-5 h-5 text-primary" />
                          Lab Configuration Summary
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-4xl">{selectedDistro?.icon}</span>
                            <div>
                              <div className="text-sm text-muted-foreground">Distribution</div>
                              <div className="font-semibold">{selectedDistro?.name} {selectedDistro?.version}</div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-muted-foreground">Lab Name</div>
                            <div className="font-semibold">{labName}</div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-muted-foreground">RAM Allocation</div>
                            <div className="font-semibold flex items-center gap-2">
                              <Cpu className="w-4 h-4 text-primary" />
                              {ramGB} GB
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-muted-foreground">Network Mode</div>
                            <div className="font-semibold flex items-center gap-2">
                              {airGap ? (
                                <>
                                  <Lock className="w-4 h-4 text-destructive" />
                                  Air-Gap
                                </>
                              ) : vpnTunnel ? (
                                <>
                                  <Globe className="w-4 h-4 text-primary" />
                                  VPN Tunnel
                                </>
                              ) : (
                                <>
                                  <Network className="w-4 h-4 text-accent" />
                                  NAT
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 p-3 bg-primary/10 rounded-lg border border-primary/30">
                          <div className="flex items-center gap-2 text-sm text-primary">
                            <Shield className="w-4 h-4" />
                            HMAC-SHA256 authentication will be enabled for all IPC communication
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-border/40">
                <button
                  onClick={() => step > 0 && setStep(step - 1)}
                  disabled={step === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    step === 0
                      ? 'text-muted-foreground cursor-not-allowed'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                
                {step < steps.length - 1 ? (
                  <button
                    onClick={() => canProceed() && setStep(step + 1)}
                    disabled={!canProceed()}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                      canProceed()
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 neon-border'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 neon-border disabled:opacity-50"
                  >
                    {isCreating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Create Lab
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
