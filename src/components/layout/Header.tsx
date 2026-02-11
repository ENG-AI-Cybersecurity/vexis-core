import { motion } from 'framer-motion';
import { Bell, Search, Shield, Zap, Clock, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export function Header() {
  const { user, profile, role, signOut } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast.success('تم تسجيل الخروج');
  };

  return (
    <header className="h-14 glass-panel border-b border-border/40 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full status-online animate-glow-pulse" />
          <span className="text-xs text-muted-foreground">DAEMON ACTIVE</span>
        </motion.div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2 text-xs">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">HMAC-SHA256</span>
          <span className="text-primary">Verified</span>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="بحث في المختبرات، الأوامر..." className="w-full bg-muted/50 border border-border/40 rounded-lg pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all" />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] bg-muted rounded text-muted-foreground border border-border">⌘K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="font-mono tabular-nums">{time.toLocaleTimeString('en-US', { hour12: false })}</span>
        </div>
        <div className="h-4 w-px bg-border" />
        
        {profile && (
          <span className="text-xs text-muted-foreground hidden md:block">{profile.display_name}</span>
        )}

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-xs text-primary font-medium uppercase">{role}</span>
        </div>

        <button onClick={handleSignOut} className="p-2 rounded-lg hover:bg-destructive/20 transition-colors group" title="تسجيل الخروج">
          <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
        </button>
      </div>
    </header>
  );
}
