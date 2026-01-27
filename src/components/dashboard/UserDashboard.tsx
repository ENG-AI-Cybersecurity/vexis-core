import { motion } from 'framer-motion';
import { 
  Terminal, 
  Eye, 
  Shield, 
  Activity,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function UserDashboard() {
  const stats = [
    { label: 'Active Sessions', value: '3', icon: Terminal, color: 'text-primary' },
    { label: 'Scans Today', value: '12', icon: Eye, color: 'text-orange-500' },
    { label: 'Security Score', value: '85%', icon: Shield, color: 'text-green-500' },
    { label: 'System Health', value: 'Good', icon: Activity, color: 'text-blue-500' },
  ];

  const recentActivity = [
    { action: 'Terminal session started', time: '2 min ago', status: 'success' },
    { action: 'Security scan completed', time: '15 min ago', status: 'success' },
    { action: 'Network analysis running', time: '1 hour ago', status: 'warning' },
    { action: 'System update available', time: '3 hours ago', status: 'info' },
  ];

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
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Daily Scans</span>
                <span>12 / 50</span>
              </div>
              <Progress value={24} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Terminal Sessions</span>
                <span>3 / 5</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Storage Used</span>
                <span>2.4 GB / 10 GB</span>
              </div>
              <Progress value={24} className="h-2" />
            </div>
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
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  {activity.status === 'success' && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                  )}
                  {activity.status === 'warning' && (
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  )}
                  {activity.status === 'info' && (
                    <Activity className="w-4 h-4 text-blue-500 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
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
