import { motion } from 'framer-motion';
import { 
  Users, 
  Server, 
  Shield, 
  Activity,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Database,
  Settings,
  Lock,
  Eye,
  BarChart3,
  Crown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: '2,847', icon: Users, color: 'text-primary', change: '+12%' },
    { label: 'Active Sessions', value: '342', icon: Activity, color: 'text-orange-500', change: '+5%' },
    { label: 'Revenue (BTC)', value: '4.28', icon: DollarSign, color: 'text-green-500', change: '+23%' },
    { label: 'Security Alerts', value: '7', icon: AlertTriangle, color: 'text-red-500', change: '-15%' },
  ];

  const systemHealth = [
    { name: 'API Server', status: 'healthy', uptime: '99.99%' },
    { name: 'Database Cluster', status: 'healthy', uptime: '99.95%' },
    { name: 'Edge Functions', status: 'healthy', uptime: '99.97%' },
    { name: 'Storage Nodes', status: 'warning', uptime: '98.50%' },
  ];

  const recentUsers = [
    { name: 'user_x42', role: 'member', joined: '5 min ago', status: 'online' },
    { name: 'hackmaster_01', role: 'member', joined: '23 min ago', status: 'online' },
    { name: 'netrunner', role: 'user', joined: '1 hour ago', status: 'offline' },
    { name: 'cyberph4nt0m', role: 'member', joined: '2 hours ago', status: 'online' },
  ];

  const securityAlerts = [
    { type: 'Brute Force Attempt', ip: '192.168.1.45', time: '10 min ago', severity: 'high' },
    { type: 'Suspicious Login', ip: '10.0.0.23', time: '1 hour ago', severity: 'medium' },
    { type: 'Rate Limit Exceeded', ip: '172.16.0.88', time: '3 hours ago', severity: 'low' },
  ];

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
        {stats.map((stat, index) => (
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
                      <span className={`text-xs ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
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
            {systemHealth.map((system, index) => (
              <motion.div
                key={system.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/20"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${system.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-sm">{system.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{system.uptime}</span>
              </motion.div>
            ))}
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
            {securityAlerts.map((alert, index) => (
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
            ))}
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
            {recentUsers.map((user, index) => (
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
                <Badge variant={user.role === 'member' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
              </motion.div>
            ))}
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
