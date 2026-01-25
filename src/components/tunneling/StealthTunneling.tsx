import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Globe, 
  Zap, 
  Activity, 
  Server, 
  Lock, 
  Unlock,
  Power,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface TunnelNode {
  id: string;
  name: string;
  location: string;
  latency: number;
  load: number;
  status: 'online' | 'offline' | 'busy';
}

const tunnelNodes: TunnelNode[] = [
  { id: '1', name: 'TOR-EXIT-01', location: 'Frankfurt, DE', latency: 45, load: 32, status: 'online' },
  { id: '2', name: 'PROXY-NL', location: 'Amsterdam, NL', latency: 28, load: 67, status: 'online' },
  { id: '3', name: 'VPN-CH', location: 'Zurich, CH', latency: 52, load: 45, status: 'online' },
  { id: '4', name: 'SOCKS5-RO', location: 'Bucharest, RO', latency: 89, load: 12, status: 'online' },
  { id: '5', name: 'TOR-EXIT-02', location: 'Iceland, IS', latency: 0, load: 0, status: 'offline' },
];

export function StealthTunneling() {
  const [killSwitchEnabled, setKillSwitchEnabled] = useState(false);
  const [vpnConnected, setVpnConnected] = useState(false);
  const [torEnabled, setTorEnabled] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [latencies, setLatencies] = useState<Record<string, number>>({});
  const [connecting, setConnecting] = useState(false);

  // Simulate latency updates
  useEffect(() => {
    const updateLatencies = () => {
      const newLatencies: Record<string, number> = {};
      tunnelNodes.forEach(node => {
        if (node.status === 'online') {
          newLatencies[node.id] = node.latency + Math.floor(Math.random() * 20 - 10);
        }
      });
      setLatencies(newLatencies);
    };

    updateLatencies();
    const interval = setInterval(updateLatencies, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async (nodeId: string) => {
    if (connecting) return;
    
    setConnecting(true);
    setSelectedNode(nodeId);
    
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setVpnConnected(true);
    setConnecting(false);
    
    const node = tunnelNodes.find(n => n.id === nodeId);
    toast.success(`Connected to ${node?.name}`, {
      icon: '🔐',
      style: { background: '#0a0f1a', color: '#00ff41', border: '1px solid #00ff41' },
    });
  };

  const handleDisconnect = () => {
    setVpnConnected(false);
    setSelectedNode(null);
    toast.success('Tunnel disconnected', {
      icon: '🔓',
      style: { background: '#0a0f1a', color: '#ff4444', border: '1px solid #ff4444' },
    });
  };

  const handleKillSwitch = (enabled: boolean) => {
    setKillSwitchEnabled(enabled);
    if (enabled) {
      toast.success('Kill Switch activated - All traffic blocked if tunnel drops', {
        icon: '⚡',
        style: { background: '#0a0f1a', color: '#00ff41', border: '1px solid #00ff41' },
      });
    }
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 50) return 'text-success';
    if (latency < 100) return 'text-warning';
    return 'text-destructive';
  };

  const getLoadColor = (load: number) => {
    if (load < 50) return 'bg-success';
    if (load < 80) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full p-6 overflow-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold neon-text">Stealth Tunneling</h2>
          <p className="text-sm text-muted-foreground">Proxy & VPN management</p>
        </div>
        <div className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border',
          vpnConnected 
            ? 'bg-success/20 border-success/30 text-success' 
            : 'bg-muted/30 border-border text-muted-foreground'
        )}>
          {vpnConnected ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          <span className="text-xs font-medium">
            {vpnConnected ? 'TUNNEL ACTIVE' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Connection Status */}
        <div className="col-span-2 space-y-6">
          {/* Current Connection */}
          <div className="glass-panel rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Connection Status
              </h3>
              {vpnConnected && (
                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-2 px-3 py-1.5 bg-destructive/20 text-destructive rounded-lg hover:bg-destructive/30 transition-colors"
                >
                  <Power className="w-4 h-4" />
                  Disconnect
                </button>
              )}
            </div>

            {vpnConnected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center neon-border">
                    <Lock className="w-8 h-8 text-success" />
                  </div>
                  <div>
                    <div className="text-lg font-display font-bold text-success">
                      {tunnelNodes.find(n => n.id === selectedNode)?.name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {tunnelNodes.find(n => n.id === selectedNode)?.location}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/40">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Latency</div>
                    <div className={cn(
                      'text-xl font-display font-bold',
                      getLatencyColor(latencies[selectedNode!] || 0)
                    )}>
                      {latencies[selectedNode!] || 0}ms
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Encryption</div>
                    <div className="text-xl font-display font-bold text-primary">AES-256</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Protocol</div>
                    <div className="text-xl font-display font-bold text-secondary">WireGuard</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                  <Unlock className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No active tunnel connection</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Select a node below to connect</p>
              </div>
            )}
          </div>

          {/* Node Selection */}
          <div className="glass-panel rounded-lg">
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                Available Nodes
              </h3>
              <button className="p-1.5 rounded hover:bg-muted/50 transition-colors">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="divide-y divide-border/40">
              {tunnelNodes.map((node) => (
                <button
                  key={node.id}
                  onClick={() => node.status === 'online' && handleConnect(node.id)}
                  disabled={node.status !== 'online' || connecting}
                  className={cn(
                    'w-full flex items-center justify-between p-4 transition-colors',
                    node.status === 'online' 
                      ? 'hover:bg-muted/30 cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed',
                    selectedNode === node.id && vpnConnected && 'bg-primary/10'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      node.status === 'online' ? 'bg-success' : 'bg-destructive'
                    )} />
                    <div className="text-left">
                      <div className="font-mono text-sm text-foreground">{node.name}</div>
                      <div className="text-xs text-muted-foreground">{node.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className={cn(
                        'text-sm font-mono',
                        getLatencyColor(latencies[node.id] || node.latency)
                      )}>
                        {latencies[node.id] || node.latency}ms
                      </div>
                      <div className="text-xs text-muted-foreground">ping</div>
                    </div>
                    <div className="w-20">
                      <div className="text-xs text-muted-foreground mb-1">{node.load}% load</div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn('h-full rounded-full transition-all', getLoadColor(node.load))}
                          style={{ width: `${node.load}%` }}
                        />
                      </div>
                    </div>
                    {connecting && selectedNode === node.id && (
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Controls */}
        <div className="space-y-6">
          {/* Kill Switch */}
          <div className="glass-panel rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className={cn('w-5 h-5', killSwitchEnabled ? 'text-destructive' : 'text-muted-foreground')} />
                <h3 className="font-display font-semibold">Kill Switch</h3>
              </div>
              <Switch
                checked={killSwitchEnabled}
                onCheckedChange={handleKillSwitch}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Automatically block all internet traffic if the VPN connection drops unexpectedly.
            </p>
            {killSwitchEnabled && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <div className="flex items-center gap-2 text-destructive text-xs">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Kill Switch Active</span>
                </div>
              </div>
            )}
          </div>

          {/* TOR Integration */}
          <div className="glass-panel rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className={cn('w-5 h-5', torEnabled ? 'text-secondary' : 'text-muted-foreground')} />
                <h3 className="font-display font-semibold">TOR Routing</h3>
              </div>
              <Switch
                checked={torEnabled}
                onCheckedChange={setTorEnabled}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Route traffic through the TOR network for additional anonymity. Increases latency.
            </p>
          </div>

          {/* Connection Stats */}
          <div className="glass-panel rounded-lg p-6">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Session Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Data Up</span>
                <span className="text-foreground font-mono">
                  {vpnConnected ? '124.5 MB' : '0 MB'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Data Down</span>
                <span className="text-foreground font-mono">
                  {vpnConnected ? '892.3 MB' : '0 MB'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uptime</span>
                <span className="text-foreground font-mono">
                  {vpnConnected ? '02:34:12' : '--:--:--'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IP Address</span>
                <span className="text-success font-mono text-xs">
                  {vpnConnected ? '185.xxx.xxx.xxx' : 'Exposed'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}