import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Server, 
  AlertTriangle,
  DollarSign,
  Database,
  Settings,
  Lock,
  BarChart3,
  Crown,
  Activity,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AdminStats {
  totalUsers: number;
  activeSessions: number;
  revenueBTC: number;
  securityAlerts: number;
  userChange: string;
  sessionChange: string;
  revenueChange: string;
  alertChange: string;
}

interface SystemNode {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
}

interface RecentUser {
  name: string;
  role: 'user' | 'member' | 'admin';
  joined: string;
  status: 'online' | 'offline';
}

interface SecurityAlert {
  type: string;
  ip: string;
  time: string;
  severity: 'low' | 'medium' | 'high';
}

// Data will be fetched from backend when connected
async function fetchAdminData(): Promise<{
  stats: AdminStats;
  systemHealth: SystemNode[];
  recentUsers: RecentUser[];
  securityAlerts: SecurityAlert[];
}> {
  // Placeholder: Replace with actual API call
  return {
    stats: {
      totalUsers: 0,
      activeSessions: 0,
      revenueBTC: 0,
      securityAlerts: 0,
      userChange: '0%',
      sessionChange: '0%',
      revenueChange: '0%',
      alertChange: '0%'
    },
    systemHealth: [],
    recentUsers: [],
    securityAlerts: []
  };
}

export function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemNode[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAdminData();
        setStats(data.stats);
        setSystemHealth(data.systemHealth);
        setRecentUsers(data.recentUsers);
        setSecurityAlerts(data.securityAlerts);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const statItems = stats ? [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'text-primary', change: stats.userChange },
    { label: 'Active Sessions', value: stats.activeSessions.toString(), icon: Activity, color: 'text-orange-500', change: stats.sessionChange },
    { label: 'Revenue (BTC)', value: stats.revenueBTC.toFixed(2), icon: DollarSign, color: 'text-green-500', change: stats.revenueChange },
    { label: 'Security Alerts', value: stats.securityAlerts.toString(), icon: AlertTriangle, color: 'text-red-500', change: stats.alertChange },
  ] : [];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
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
          <h1 className="text-2xl font-bold text-foreground">Admin Control Center</h1>
          <p className="text-muted-foreground">Full system access. Monitor and manage everything.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30">
          <Crown className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-500 font-medium">Administrator</span>
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
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <span className={`text-xs ${stat.change.startsWith('+') ? 'text-green-500' : stat.change.startsWith('-') ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {stat.change}
                      </span>
                    </div>
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
        {/* System Health */}
        <Card className="bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemHealth.length > 0 ? (
              systemHealth.map((system, index) => (
                <motion.div
                  key={system.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/20"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      system.status === 'healthy' ? 'bg-green-500' : 
                      system.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm">{system.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{system.uptime}</span>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Server className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No systems connected</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Alerts */}
        <Card className="bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Security Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {securityAlerts.length > 0 ? (
              securityAlerts.map((alert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-lg bg-muted/20 border-l-2 border-red-500"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{alert.type}</span>
                    <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">IP: {alert.ip} • {alert.time}</p>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No security alerts</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentUsers.length > 0 ? (
              recentUsers.map((user, index) => (
                <motion.div
                  key={user.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/20"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`} />
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.joined}</p>
                    </div>
                  </div>
                  <Badge variant={user.role === 'member' ? 'default' : user.role === 'admin' ? 'destructive' : 'secondary'}>
                    {user.role}
                  </Badge>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent users</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admin Quick Actions */}
      <Card className="bg-card/50 border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Admin Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <Users className="w-8 h-8 text-primary" />
              <span className="text-sm font-medium">Manage Users</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <Database className="w-8 h-8 text-orange-500" />
              <span className="text-sm font-medium">Database</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <Lock className="w-8 h-8 text-red-500" />
              <span className="text-sm font-medium">Security</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <BarChart3 className="w-8 h-8 text-green-500" />
              <span className="text-sm font-medium">Analytics</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
