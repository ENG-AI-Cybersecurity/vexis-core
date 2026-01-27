import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  Shield,
  Eye,
  Settings,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Bitcoin,
  BarChart3,
  Globe,
  Target,
  Bomb,
  Store,
  Wallet,
  Code,
  LayoutDashboard,
  Users,
  Crown,
  Star,
  User,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

const navGroups: NavGroup[] = [
  {
    title: 'Dashboards',
    defaultOpen: true,
    items: [
      { id: 'user-dashboard', label: 'User Dashboard', icon: <User className="w-4 h-4" /> },
      { id: 'member-dashboard', label: 'Member Dashboard', icon: <Star className="w-4 h-4" /> },
      { id: 'admin-dashboard', label: 'Admin Dashboard', icon: <Crown className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Terminal & Labs',
    defaultOpen: true,
    items: [
      { id: 'dashboard', label: 'Terminal Matrix', icon: <Terminal className="w-4 h-4" /> },
      { id: 'labs', label: 'Lab Manager', icon: <Cpu className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Security Tools',
    defaultOpen: false,
    items: [
      { id: 'robin', label: 'Dark Web Monitor', icon: <Eye className="w-4 h-4" /> },
      { id: 'tunneling', label: 'Stealth Tunneling', icon: <Globe className="w-4 h-4" /> },
      { id: 'payload', label: 'Payload Factory', icon: <Bomb className="w-4 h-4" /> },
      { id: 'security', label: 'System Security', icon: <Shield className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Marketplace',
    defaultOpen: false,
    items: [
      { id: 'script-market', label: 'Script Market', icon: <Store className="w-4 h-4" /> },
      { id: 'vendor-forge', label: 'Vendor Forge', icon: <Code className="w-4 h-4" /> },
      { id: 'wallet', label: 'Vexis Wallet', icon: <Wallet className="w-4 h-4" /> },
      { id: 'crypto', label: 'Crypto Store', icon: <Bitcoin className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Community',
    defaultOpen: false,
    items: [
      { id: 'missions', label: 'Missions', icon: <Target className="w-4 h-4" /> },
      { id: 'forum', label: 'Secret Forum', icon: <MessageSquare className="w-4 h-4" /> },
      { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    ]
  }
];

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onOpenNotifications?: () => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    navGroups.reduce((acc, group) => ({ ...acc, [group.title]: group.defaultOpen ?? false }), {})
  );

  const toggleGroup = (title: string) => {
    if (collapsed) return;
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "relative flex flex-col h-screen bg-card/95 backdrop-blur-xl border-r border-border/50 transition-all duration-300 shadow-2xl",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-border/40">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-primary/20 flex items-center justify-center overflow-hidden ring-2 ring-orange-500/30">
            <img src={logo} alt="Vexis" className="w-8 h-8 object-contain" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-card" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col overflow-hidden"
            >
              <span className="font-bold text-lg bg-gradient-to-r from-orange-500 to-primary bg-clip-text text-transparent tracking-wider">VEXIS</span>
              <span className="text-[10px] text-muted-foreground font-medium">Linux v2.4.1</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-1 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-2">
            {!collapsed && (
              <button
                onClick={() => toggleGroup(group.title)}
                className="w-full flex items-center justify-between px-3 py-2 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>{group.title}</span>
                <motion.div
                  animate={{ rotate: openGroups[group.title] ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-3 h-3" />
                </motion.div>
              </button>
            )}
            <AnimatePresence initial={false}>
              {(collapsed || openGroups[group.title]) && (
                <motion.div
                  initial={collapsed ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {group.items.map((item) => (
                    <motion.button
                      key={item.id}
                      whileHover={{ x: collapsed ? 0 : 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onViewChange(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                        activeView === item.id
                          ? "bg-gradient-to-r from-orange-500/20 to-primary/20 text-primary border border-primary/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className={cn(
                        "transition-colors flex-shrink-0",
                        activeView === item.id ? "text-primary" : "group-hover:text-orange-500"
                      )}>
                        {item.icon}
                      </span>
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-sm font-medium truncate"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {activeView === item.id && !collapsed && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary"
                        />
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* System Stats */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 py-3 border-t border-border/40 space-y-2"
          >
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">System</div>
            <SystemStat icon={<Cpu className="w-3.5 h-3.5" />} label="CPU" value="23%" color="green" />
            <SystemStat icon={<HardDrive className="w-3.5 h-3.5" />} label="RAM" value="1.2GB" color="orange" />
            <SystemStat icon={<Activity className="w-3.5 h-3.5" />} label="WSL2" value="Active" color="blue" />
            <SystemStat icon={<Wifi className="w-3.5 h-3.5" />} label="Network" value="Secured" color="green" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all hover:scale-110"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Settings */}
      <div className="p-2 border-t border-border/40">
        <motion.button
          whileHover={{ x: collapsed ? 0 : 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onViewChange('settings')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
            activeView === 'settings'
              ? "bg-gradient-to-r from-orange-500/20 to-primary/20 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
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
  color: 'green' | 'orange' | 'blue';
}) {
  const colorClasses = {
    green: 'text-green-500',
    orange: 'text-orange-500',
    blue: 'text-blue-500',
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={colorClasses[color]}>{icon}</span>
      <span className="text-muted-foreground flex-1">{label}</span>
      <span className={cn("font-medium", colorClasses[color])}>{value}</span>
    </div>
  );
}
