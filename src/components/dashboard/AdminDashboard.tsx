import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Server, AlertTriangle, DollarSign, Database, Settings, Lock, BarChart3, Crown, Activity, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function AdminDashboard() {
  const { user, profile, role } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalScripts, setTotalScripts] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [profilesRes, scriptsRes, txRes, logsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('scripts').select('id', { count: 'exact', head: true }),
        supabase.from('transactions').select('id', { count: 'exact', head: true }),
        supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(10),
      ]);
      setTotalUsers(profilesRes.count || 0);
      setTotalScripts(scriptsRes.count || 0);
      setTotalTransactions(txRes.count || 0);
      setRecentLogs(logsRes.data || []);
      setIsLoading(false);
    };
    load();
  }, [user]);

  const statItems = [
    { label: 'إجمالي المستخدمين', value: totalUsers.toString(), icon: Users, color: 'text-primary' },
    { label: 'السكربتات', value: totalScripts.toString(), icon: Database, color: 'text-accent' },
    { label: 'المعاملات', value: totalTransactions.toString(), icon: DollarSign, color: 'text-green-500' },
    { label: 'التنبيهات الأمنية', value: '0', icon: AlertTriangle, color: 'text-destructive' },
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
          <h1 className="text-2xl font-bold text-foreground">مركز التحكم الإداري</h1>
          <p className="text-muted-foreground">وصول كامل للنظام • {profile?.display_name || 'Admin'}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/20 border border-destructive/30">
          <Crown className="w-4 h-4 text-destructive" />
          <span className="text-sm text-destructive font-medium">مدير النظام</span>
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
        <Card className="bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              صحة النظام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'قاعدة البيانات', status: 'healthy' as const },
              { name: 'نظام المصادقة', status: 'healthy' as const },
              { name: 'خدمات الخلفية', status: 'healthy' as const },
              { name: 'التخزين', status: 'healthy' as const },
            ].map((sys, i) => (
              <div key={sys.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${sys.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-sm">{sys.name}</span>
                </div>
                <span className="text-xs text-green-500">تشغيل</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              سجلات النظام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLogs.length > 0 ? recentLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-2 rounded-lg bg-muted/20">
                <p className="text-sm font-medium truncate">{log.action}</p>
                <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString('ar-EG')}</p>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>لا توجد سجلات</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              تحكم سريع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <Users className="w-6 h-6 text-primary" />
                <span className="text-xs font-medium">المستخدمون</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <Database className="w-6 h-6 text-accent" />
                <span className="text-xs font-medium">البيانات</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <Lock className="w-6 h-6 text-destructive" />
                <span className="text-xs font-medium">الأمان</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <BarChart3 className="w-6 h-6 text-green-500" />
                <span className="text-xs font-medium">التحليلات</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
