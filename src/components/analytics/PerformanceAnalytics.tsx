import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Cpu, HardDrive, Wifi, TrendingUp, TrendingDown } from 'lucide-react';
import { saveTelemetry, getTelemetry, type TelemetryData } from '@/lib/db';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: number;
  color: string;
}

function MetricCard({ icon, label, value, trend, color }: MetricCardProps) {
  const isPositive = trend >= 0;
  
  return (
    <div className="glass-panel p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${color}/20`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-success' : 'text-destructive'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{Math.abs(trend).toFixed(1)}%</span>
        </div>
      </div>
      <div className="text-2xl font-display font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export function PerformanceAnalytics() {
  const [telemetryData, setTelemetryData] = useState<TelemetryData[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState({
    cpu: 0,
    memory: 0,
    diskIO: 0,
    networkIn: 0,
    networkOut: 0,
  });

  // Generate simulated telemetry data
  const generateTelemetry = useCallback((): TelemetryData => {
    const baseLoad = Math.sin(Date.now() / 10000) * 20 + 30;
    return {
      timestamp: Date.now(),
      cpu: Math.max(5, Math.min(95, baseLoad + Math.random() * 25)),
      memory: Math.max(20, Math.min(85, 45 + Math.random() * 20)),
      diskIO: Math.max(0, Math.min(100, Math.random() * 40)),
      networkIn: Math.random() * 150,
      networkOut: Math.random() * 80,
    };
  }, []);

  // Load initial data and start simulation
  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout;

    const init = async () => {
      const stored = await getTelemetry(30);
      if (mounted && stored.length > 0) {
        setTelemetryData(stored);
        const latest = stored[stored.length - 1];
        setCurrentMetrics({
          cpu: latest.cpu,
          memory: latest.memory,
          diskIO: latest.diskIO,
          networkIn: latest.networkIn,
          networkOut: latest.networkOut,
        });
      }

      // Update every 2 seconds for performance
      intervalId = setInterval(async () => {
        if (!mounted) return;
        
        const newData = generateTelemetry();
        await saveTelemetry(newData);
        
        setCurrentMetrics({
          cpu: newData.cpu,
          memory: newData.memory,
          diskIO: newData.diskIO,
          networkIn: newData.networkIn,
          networkOut: newData.networkOut,
        });
        
        setTelemetryData(prev => {
          const updated = [...prev, newData];
          return updated.slice(-30); // Keep last 30 data points
        });
      }, 2000);
    };

    init();
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [generateTelemetry]);

  // Calculate trends
  const trends = useMemo(() => {
    if (telemetryData.length < 2) return { cpu: 0, memory: 0, diskIO: 0, network: 0 };
    const recent = telemetryData.slice(-5);
    const older = telemetryData.slice(-10, -5);
    
    const avgRecent = (key: keyof TelemetryData) => 
      recent.reduce((sum, d) => sum + (d[key] as number), 0) / recent.length;
    const avgOlder = (key: keyof TelemetryData) => 
      older.length ? older.reduce((sum, d) => sum + (d[key] as number), 0) / older.length : avgRecent(key);
    
    return {
      cpu: avgRecent('cpu') - avgOlder('cpu'),
      memory: avgRecent('memory') - avgOlder('memory'),
      diskIO: avgRecent('diskIO') - avgOlder('diskIO'),
      network: (avgRecent('networkIn') + avgRecent('networkOut')) - (avgOlder('networkIn') + avgOlder('networkOut')),
    };
  }, [telemetryData]);

  // Format data for charts
  const chartData = useMemo(() => 
    telemetryData.map((d, i) => ({
      name: i.toString(),
      cpu: Math.round(d.cpu),
      memory: Math.round(d.memory),
      diskIO: Math.round(d.diskIO),
      network: Math.round(d.networkIn + d.networkOut),
    })),
    [telemetryData]
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="glass-panel p-2 text-xs">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-muted-foreground">{p.dataKey}:</span>
            <span className="text-foreground">{p.value}%</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full p-6 overflow-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold neon-text">Performance Analytics</h2>
          <p className="text-sm text-muted-foreground">Real-time Go Daemon telemetry</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/20 border border-success/30">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-success">Live Monitoring</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={<Cpu className="w-5 h-5 text-primary" />}
          label="CPU Usage"
          value={`${currentMetrics.cpu.toFixed(1)}%`}
          trend={trends.cpu}
          color="primary"
        />
        <MetricCard
          icon={<HardDrive className="w-5 h-5 text-secondary" />}
          label="Memory"
          value={`${currentMetrics.memory.toFixed(1)}%`}
          trend={trends.memory}
          color="secondary"
        />
        <MetricCard
          icon={<Activity className="w-5 h-5 text-accent" />}
          label="Disk I/O"
          value={`${currentMetrics.diskIO.toFixed(1)}%`}
          trend={trends.diskIO}
          color="accent"
        />
        <MetricCard
          icon={<Wifi className="w-5 h-5 text-warning" />}
          label="Network"
          value={`${(currentMetrics.networkIn + currentMetrics.networkOut).toFixed(0)} MB/s`}
          trend={trends.network}
          color="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="glass-panel p-4 rounded-lg">
          <h3 className="text-sm font-medium mb-4">CPU & Memory Usage</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(120, 100%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(120, 100%, 50%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(280, 80%, 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(280, 80%, 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 100%, 25%)" opacity={0.2} />
                <XAxis dataKey="name" stroke="hsl(160, 30%, 55%)" tick={{ fontSize: 10 }} />
                <YAxis stroke="hsl(160, 30%, 55%)" tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stroke="hsl(120, 100%, 50%)"
                  fill="url(#cpuGradient)"
                  strokeWidth={2}
                  animationDuration={300}
                />
                <Area
                  type="monotone"
                  dataKey="memory"
                  stroke="hsl(280, 80%, 60%)"
                  fill="url(#memGradient)"
                  strokeWidth={2}
                  animationDuration={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-lg">
          <h3 className="text-sm font-medium mb-4">Disk I/O & Network</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="diskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(190, 100%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(190, 100%, 50%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(45, 100%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(45, 100%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 100%, 25%)" opacity={0.2} />
                <XAxis dataKey="name" stroke="hsl(160, 30%, 55%)" tick={{ fontSize: 10 }} />
                <YAxis stroke="hsl(160, 30%, 55%)" tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="diskIO"
                  stroke="hsl(190, 100%, 50%)"
                  fill="url(#diskGradient)"
                  strokeWidth={2}
                  animationDuration={300}
                />
                <Area
                  type="monotone"
                  dataKey="network"
                  stroke="hsl(45, 100%, 55%)"
                  fill="url(#netGradient)"
                  strokeWidth={2}
                  animationDuration={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Process List */}
      <div className="mt-6 glass-panel rounded-lg">
        <div className="p-4 border-b border-border/40">
          <h3 className="text-sm font-medium">Active Daemon Processes</h3>
        </div>
        <div className="divide-y divide-border/40">
          {[
            { name: 'vexis-daemon', pid: 1337, cpu: 12.4, mem: 156 },
            { name: 'ipc-handler', pid: 1338, cpu: 3.2, mem: 48 },
            { name: 'wsl-bridge', pid: 1339, cpu: 8.7, mem: 92 },
            { name: 'telemetry-collector', pid: 1340, cpu: 1.1, mem: 24 },
          ].map((proc) => (
            <div key={proc.pid} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-sm font-mono text-foreground">{proc.name}</span>
                <span className="text-xs text-muted-foreground">PID: {proc.pid}</span>
              </div>
              <div className="flex items-center gap-6 text-xs">
                <span className="text-primary">{proc.cpu}% CPU</span>
                <span className="text-secondary">{proc.mem} MB</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}