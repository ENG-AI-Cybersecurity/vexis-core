import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Terminal, Eye, Shield, Activity, TrendingUp, Clock,
  AlertTriangle, CheckCircle2, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function UserDashboard() {
  const { user, profile, role } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ sessions: 0, scans: 0, score: 0 });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: logs } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      setActivityLogs(logs || []);
      setStats({ sessions: 1, scans: (logs || []).length, score: 85 });
      setIsLoading(false);
    };
    load();
  }, [user]);

  const statItems = [
    { label: 'الجلسات النشطة', value: stats.sessions.toString(), icon: Terminal, color: 'text-primary' },
    { label: 'عمليات الفحص', value: stats.scans.toString(), icon: Eye, color: 'text-accent' },
    { label: 'درجة الأمان', value: `${stats.score}%`, icon: Shield, color: 'text-green-500' },
    { label: 'حالة النظام', value: 'جيد', icon: Activity, color: 'text-blue-500' },
  ];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">مرحباً، {profile?.display_name || 'Operator'}</h1>
          <p className="text-muted-foreground">لوحة تحكم المستخدم • الدور: <span className="text-primary capitalize">{role}</span></p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-primary font-medium capitalize">{role}</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              إحصائيات الاستخدام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">عمليات الفحص اليومية</span>
                <span>{stats.scans} / 50</span>
              </div>
              <Progress value={(stats.scans / 50) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">جلسات الطرفية</span>
                <span>{stats.sessions} / 5</span>
              </div>
              <Progress value={(stats.sessions / 5) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              النشاط الأخير
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityLogs.length > 0 ? (
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    {log.status === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" /> :
                     log.status === 'warning' ? <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" /> :
                     <Activity className="w-4 h-4 text-blue-500 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{log.action}</p>
                      <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString('ar-EG')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>لا يوجد نشاط حديث</p>
                <p className="text-xs mt-1">سيظهر نشاطك هنا</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
