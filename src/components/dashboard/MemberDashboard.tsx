import { motion } from 'framer-motion';
import { 
  Terminal, 
  Eye, 
  Shield, 
  Activity,
  TrendingUp,
  Clock,
  Zap,
  Download,
  Server,
  Globe,
  Key,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export function MemberDashboard() {
  const stats = [
    { label: 'Active Sessions', value: '15', icon: Terminal, color: 'text-primary' },
    { label: 'Scans Today', value: '87', icon: Eye, color: 'text-orange-500' },
    { label: 'Security Score', value: '94%', icon: Shield, color: 'text-green-500' },
    { label: 'Uptime', value: '99.9%', icon: Activity, color: 'text-blue-500' },
  ];

  const activeTools = [
    { name: 'Network Scanner', status: 'running', progress: 67 },
    { name: 'Vulnerability Assessment', status: 'running', progress: 45 },
    { name: 'Traffic Analyzer', status: 'completed', progress: 100 },
  ];

  const downloads = [
    { name: 'Custom Exploit Pack v2.1', size: '24 MB', date: 'Today' },
    { name: 'OSINT Toolkit', size: '156 MB', date: 'Yesterday' },
    { name: 'Network Utils Bundle', size: '89 MB', date: '3 days ago' },
  ];

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
        {/* Active Tools */}
        <Card className="lg:col-span-2 bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Active Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeTools.map((tool, index) => (
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
            ))}
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
        </CardContent>
      </Card>
    </div>
  );
}
