import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Terminal, Eye, Shield, Activity, Zap, Download, Server, Globe, Key, Star, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function MemberDashboard() {
  const { user, profile, role } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [scripts, setScripts] = useState<any[]>([]);
  const [txCount, setTxCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [scriptsRes, txRes] = await Promise.all([
        supabase.from('scripts').select('*').eq('status', 'verified').limit(5),
        supabase.from('transactions').select('id', { count: 'exact', head: true }).or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`),
      ]);
      setScripts(scriptsRes.data || []);
      setTxCount(txRes.count || 0);
      setIsLoading(false);
    };
    load();
  }, [user]);

  const statItems = [
    { label: 'الجلسات النشطة', value: '1', icon: Terminal, color: 'text-primary' },
    { label: 'السكربتات المتاحة', value: scripts.length.toString(), icon: Eye, color: 'text-accent' },
    { label: 'المعاملات', value: txCount.toString(), icon: Shield, color: 'text-green-500' },
    { label: 'حالة العضوية', value: 'نشط', icon: Activity, color: 'text-blue-500' },
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
          <h1 className="text-2xl font-bold text-foreground">لوحة العضو المميز</h1>
          <p className="text-muted-foreground">مرحباً {profile?.display_name || 'Member'} • جميع الأدوات مفعّلة</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30">
          <Star className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-medium">عضو مميز</span>
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
              <Zap className="w-5 h-5 text-primary" />
              الأدوات المتاحة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { name: 'مصفوفة الطرفية', icon: Terminal, status: 'متاح' },
              { name: 'مراقب الويب المظلم', icon: Eye, status: 'متاح' },
              { name: 'الأنفاق المخفية', icon: Globe, status: 'متاح' },
              { name: 'فحص الأمان', icon: Shield, status: 'متاح' },
            ].map((tool, i) => (
              <motion.div key={tool.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-center gap-3">
                  <tool.icon className="w-5 h-5 text-primary" />
                  <span className="font-medium">{tool.name}</span>
                </div>
                <Badge variant="default">{tool.status}</Badge>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              إجراءات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left">
              <Server className="w-5 h-5 text-primary" />
              <span>إنشاء مختبر جديد</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left">
              <Globe className="w-5 h-5 text-accent" />
              <span>تشغيل VPN</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left">
              <Eye className="w-5 h-5 text-blue-500" />
              <span>فحص الويب المظلم</span>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
