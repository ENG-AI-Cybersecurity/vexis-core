import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Terminal,
  Shield,
  Eye,
  Package,
  Settings,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

import { MessageSquare, Bitcoin, BarChart3, Globe, Target, Bomb, Store, Wallet, Code } from 'lucide-react';

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Terminal Matrix', icon: <Terminal className="w-5 h-5" /> },
  { id: 'labs', label: 'Lab Manager', icon: <Cpu className="w-5 h-5" /> },
  { id: 'robin', label: 'Dark Web Monitor', icon: <Eye className="w-5 h-5" /> },
  { id: 'tunneling', label: 'Stealth Tunneling', icon: <Globe className="w-5 h-5" /> },
  { id: 'payload', label: 'Payload Factory', icon: <Bomb className="w-5 h-5" /> },
  { id: 'missions', label: 'Missions', icon: <Target className="w-5 h-5" /> },
  { id: 'script-market', label: 'Script Market', icon: <Store className="w-5 h-5" /> },
  { id: 'vendor-forge', label: 'Vendor Forge', icon: <Code className="w-5 h-5" /> },
  { id: 'wallet', label: 'Vexis Wallet', icon: <Wallet className="w-5 h-5" /> },
  { id: 'security', label: 'System Security', icon: <Shield className="w-5 h-5" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'forum', label: 'Secret Forum', icon: <MessageSquare className="w-5 h-5" /> },
  { id: 'crypto', label: 'Crypto Store', icon: <Bitcoin className="w-5 h-5" /> },
];

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onOpenNotifications?: () => void;
}

export function Sidebar({ activeView, onViewChange, onOpenNotifications }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "relative flex flex-col h-screen glass-panel border-r border-border/40 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-border/40">
        <div className="relative">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center neon-border">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full status-online" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col"
          >
            <span className="font-display font-bold text-lg neon-text tracking-wider">VEXIS</span>
            <span className="text-xs text-muted-foreground">Linux v2.4.1</span>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
              activeView === item.id
                ? "bg-primary/20 text-primary neon-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <span className={cn(
              "transition-colors",
              activeView === item.id && "text-primary"
            )}>
              {item.icon}
            </span>
            {!collapsed && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
            {activeView === item.id && !collapsed && (
              <motion.div
                layoutId="activeIndicator"
                className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
              />
            )}
          </motion.button>
        ))}
      </nav>

      {/* System Stats */}
      <div className={cn(
        "p-3 border-t border-border/40 space-y-2",
        collapsed && "hidden"
      )}>
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">System</div>
        <SystemStat icon={<Cpu className="w-4 h-4" />} label="CPU" value="23%" color="green" />
        <SystemStat icon={<HardDrive className="w-4 h-4" />} label="RAM" value="1.2GB" color="purple" />
        <SystemStat icon={<Activity className="w-4 h-4" />} label="WSL2" value="Active" color="cyan" />
        <SystemStat icon={<Wifi className="w-4 h-4" />} label="Network" value="Secured" color="green" />
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Settings */}
      <div className="p-3 border-t border-border/40">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
          <Settings className="w-5 h-5" />
          {!collapsed && <span className="text-sm">Settings</span>}
        </button>
      </div>
    </motion.aside>
  );
}

function SystemStat({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: 'green' | 'purple' | 'cyan';
}) {
  const colorClasses = {
    green: 'text-primary',
    purple: 'text-secondary',
    cyan: 'text-accent',
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={colorClasses[color]}>{icon}</span>
      <span className="text-muted-foreground flex-1">{label}</span>
      <span className={colorClasses[color]}>{value}</span>
    </div>
  );
}