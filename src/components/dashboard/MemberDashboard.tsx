import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Terminal, 
  Eye, 
  Shield, 
  Activity,
  Zap,
  Download,
  Server,
  Globe,
  Key,
  Star,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface MemberStats {
  activeSessions: number;
  scansToday: number;
  securityScore: number;
  uptime: string;
}

interface ActiveTool {
  name: string;
  status: 'running' | 'completed' | 'queued';
  progress: number;
}

interface DownloadItem {
  name: string;
  size: string;
  date: string;
}

// Data will be fetched from backend when connected
async function fetchMemberData(): Promise<{
  stats: MemberStats;
  activeTools: ActiveTool[];
  downloads: DownloadItem[];
}> {
  // Placeholder: Replace with actual API call
  return {
    stats: {
      activeSessions: 0,
      scansToday: 0,
      securityScore: 0,
      uptime: '0%'
    },
    activeTools: [],
    downloads: []
  };
}

export function MemberDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [activeTools, setActiveTools] = useState<ActiveTool[]>([]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMemberData();
        setStats(data.stats);
        setActiveTools(data.activeTools);
        setDownloads(data.downloads);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const statItems = stats ? [
    { label: 'Active Sessions', value: stats.activeSessions.toString(), icon: Terminal, color: 'text-primary' },
    { label: 'Scans Today', value: stats.scansToday.toString(), icon: Eye, color: 'text-orange-500' },
    { label: 'Security Score', value: `${stats.securityScore}%`, icon: Shield, color: 'text-green-500' },
    { label: 'Uptime', value: stats.uptime, icon: Activity, color: 'text-blue-500' },
  ] : [];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading member dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Member Dashboard</h1>
          <p className="text-muted-foreground">Premium features unlocked. Full access enabled.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30">
          <Star className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-medium">Premium Member</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card/50 border-border/40 hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-muted/50 ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tools */}
        <Card className="lg:col-span-2 bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Active Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeTools.length > 0 ? (
              activeTools.map((tool, index) => (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-lg bg-muted/30 border border-border/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{tool.name}</span>
                    <Badge variant={tool.status === 'running' ? 'default' : 'secondary'}>
                      {tool.status}
                    </Badge>
                  </div>
                  <Progress value={tool.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{tool.progress}% complete</p>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No active tools running</p>
                <p className="text-xs mt-1">Launch a tool to see it here</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left">
              <Server className="w-5 h-5 text-primary" />
              <span>Launch New Lab</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left">
              <Globe className="w-5 h-5 text-orange-500" />
              <span>Start VPN Tunnel</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left">
              <Eye className="w-5 h-5 text-blue-500" />
              <span>Dark Web Scan</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left">
              <Shield className="w-5 h-5 text-green-500" />
              <span>Security Audit</span>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Downloads Section */}
      <Card className="bg-card/50 border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Recent Downloads
          </CardTitle>
        </CardHeader>
        <CardContent>
          {downloads.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {downloads.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-muted/30 border border-border/30 hover:border-primary/30 transition-colors"
                >
                  <Download className="w-8 h-8 text-primary mb-2" />
                  <h4 className="font-medium truncate">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">{item.size} • {item.date}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Download className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent downloads</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
