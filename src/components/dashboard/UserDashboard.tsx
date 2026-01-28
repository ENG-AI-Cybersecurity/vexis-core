import { motion } from 'framer-motion';
import { 
  Terminal, 
  Eye, 
  Shield, 
  Activity,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';

interface DashboardStats {
  activeSessions: number;
  scansToday: number;
  securityScore: number;
  systemHealth: 'Good' | 'Warning' | 'Critical';
}

interface ActivityItem {
  action: string;
  time: string;
  status: 'success' | 'warning' | 'info';
}

interface UsageLimits {
  dailyScans: { used: number; max: number };
  terminalSessions: { used: number; max: number };
  storageGB: { used: number; max: number };
}

// Data will be fetched from backend when connected
async function fetchDashboardData(): Promise<{
  stats: DashboardStats;
  activity: ActivityItem[];
  usage: UsageLimits;
}> {
  // Placeholder: Replace with actual API call
  return {
    stats: {
      activeSessions: 0,
      scansToday: 0,
      securityScore: 0,
      systemHealth: 'Good'
    },
    activity: [],
    usage: {
      dailyScans: { used: 0, max: 50 },
      terminalSessions: { used: 0, max: 5 },
      storageGB: { used: 0, max: 10 }
    }
  };
}

export function UserDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [usage, setUsage] = useState<UsageLimits | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDashboardData();
        setStats(data.stats);
        setActivity(data.activity);
        setUsage(data.usage);
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
    { label: 'System Health', value: stats.systemHealth, icon: Activity, color: 'text-blue-500' },
  ] : [];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
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
          <h1 className="text-2xl font-bold text-foreground">User Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-sm text-orange-500 font-medium">Free User</span>
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
        {/* Usage Stats */}
        <Card className="lg:col-span-2 bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Usage Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {usage && (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Daily Scans</span>
                    <span>{usage.dailyScans.used} / {usage.dailyScans.max}</span>
                  </div>
                  <Progress value={(usage.dailyScans.used / usage.dailyScans.max) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Terminal Sessions</span>
                    <span>{usage.terminalSessions.used} / {usage.terminalSessions.max}</span>
                  </div>
                  <Progress value={(usage.terminalSessions.used / usage.terminalSessions.max) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Storage Used</span>
                    <span>{usage.storageGB.used} GB / {usage.storageGB.max} GB</span>
                  </div>
                  <Progress value={(usage.storageGB.used / usage.storageGB.max) * 100} className="h-2" />
                </div>
              </>
            )}
            {!usage && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No usage data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length > 0 ? (
              <div className="space-y-3">
                {activity.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    {item.status === 'success' && (
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                    )}
                    {item.status === 'warning' && (
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                    )}
                    {item.status === 'info' && (
                      <Activity className="w-4 h-4 text-blue-500 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-gradient-to-r from-orange-500/20 via-primary/20 to-orange-500/20 border border-orange-500/30"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Upgrade to Member</h3>
            <p className="text-sm text-muted-foreground">Unlock unlimited scans, more sessions, and advanced features.</p>
          </div>
          <button className="px-4 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors">
            Upgrade Now
          </button>
        </div>
      </motion.div>
    </div>
  );
}
