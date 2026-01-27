import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import {
  Terminal,
  Cpu,
  Eye,
  Shield,
  MessageSquare,
  Bitcoin,
  Search,
  Command,
  ArrowRight,
  Settings,
  Bug,
  Zap,
  User,
  Star,
  Crown,
  Globe,
  Bomb,
  Store,
  Wallet,
  Target,
  BarChart3,
} from 'lucide-react';

type ViewType = 
  | 'dashboard' 
  | 'labs' 
  | 'robin' 
  | 'security' 
  | 'forum' 
  | 'crypto' 
  | 'analytics' 
  | 'settings' 
  | 'tunneling' 
  | 'payload' 
  | 'missions' 
  | 'vendor-forge' 
  | 'script-market' 
  | 'wallet'
  | 'user-dashboard'
  | 'member-dashboard'
  | 'admin-dashboard';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
  category: 'navigation' | 'action' | 'system';
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewType) => void;
  onToggleDevMode: () => void;
}

export function CommandPalette({ isOpen, onClose, onNavigate, onToggleDevMode }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = useMemo(() => [
    // Dashboards
    { id: 'nav-user-dash', title: 'User Dashboard', subtitle: 'Basic user view', icon: <User className="w-4 h-4" />, action: () => { onNavigate('user-dashboard'); onClose(); }, shortcut: 'Ctrl+1', category: 'navigation' },
    { id: 'nav-member-dash', title: 'Member Dashboard', subtitle: 'Premium member view', icon: <Star className="w-4 h-4" />, action: () => { onNavigate('member-dashboard'); onClose(); }, shortcut: 'Ctrl+2', category: 'navigation' },
    { id: 'nav-admin-dash', title: 'Admin Dashboard', subtitle: 'Admin control center', icon: <Crown className="w-4 h-4" />, action: () => { onNavigate('admin-dashboard'); onClose(); }, shortcut: 'Ctrl+3', category: 'navigation' },
    
    // Terminal & Labs
    { id: 'nav-dashboard', title: 'Terminal Matrix', subtitle: 'Main terminal', icon: <Terminal className="w-4 h-4" />, action: () => { onNavigate('dashboard'); onClose(); }, shortcut: 'Ctrl+4', category: 'navigation' },
    { id: 'nav-labs', title: 'Lab Manager', subtitle: 'WSL2 labs', icon: <Cpu className="w-4 h-4" />, action: () => { onNavigate('labs'); onClose(); }, shortcut: 'Ctrl+5', category: 'navigation' },
    
    // Security Tools
    { id: 'nav-robin', title: 'Dark Web Monitor', subtitle: 'Robin integration', icon: <Eye className="w-4 h-4" />, action: () => { onNavigate('robin'); onClose(); }, shortcut: 'Ctrl+6', category: 'navigation' },
    { id: 'nav-tunneling', title: 'Stealth Tunneling', subtitle: 'VPN & Proxy', icon: <Globe className="w-4 h-4" />, action: () => { onNavigate('tunneling'); onClose(); }, category: 'navigation' },
    { id: 'nav-payload', title: 'Payload Factory', subtitle: 'Exploit builder', icon: <Bomb className="w-4 h-4" />, action: () => { onNavigate('payload'); onClose(); }, category: 'navigation' },
    { id: 'nav-security', title: 'System Security', subtitle: 'IPC & Auth', icon: <Shield className="w-4 h-4" />, action: () => { onNavigate('security'); onClose(); }, shortcut: 'Ctrl+7', category: 'navigation' },
    
    // Marketplace
    { id: 'nav-script-market', title: 'Script Market', subtitle: 'Browse scripts', icon: <Store className="w-4 h-4" />, action: () => { onNavigate('script-market'); onClose(); }, category: 'navigation' },
    { id: 'nav-vendor-forge', title: 'Vendor Forge', subtitle: 'Sell scripts', icon: <Zap className="w-4 h-4" />, action: () => { onNavigate('vendor-forge'); onClose(); }, category: 'navigation' },
    { id: 'nav-wallet', title: 'Vexis Wallet', subtitle: 'Crypto wallet', icon: <Wallet className="w-4 h-4" />, action: () => { onNavigate('wallet'); onClose(); }, category: 'navigation' },
    { id: 'nav-crypto', title: 'Crypto Store', subtitle: 'BTC/ETH marketplace', icon: <Bitcoin className="w-4 h-4" />, action: () => { onNavigate('crypto'); onClose(); }, category: 'navigation' },
    
    // Community
    { id: 'nav-missions', title: 'Missions', subtitle: 'Gamified tasks', icon: <Target className="w-4 h-4" />, action: () => { onNavigate('missions'); onClose(); }, category: 'navigation' },
    { id: 'nav-forum', title: 'Secret Forum', subtitle: 'Community', icon: <MessageSquare className="w-4 h-4" />, action: () => { onNavigate('forum'); onClose(); }, category: 'navigation' },
    { id: 'nav-analytics', title: 'Analytics', subtitle: 'Performance metrics', icon: <BarChart3 className="w-4 h-4" />, action: () => { onNavigate('analytics'); onClose(); }, category: 'navigation' },
    
    // Actions
    { id: 'action-new-lab', title: 'Create New Lab', subtitle: 'Start lab wizard', icon: <Zap className="w-4 h-4" />, action: () => { onNavigate('labs'); onClose(); }, category: 'action' },
    { id: 'action-scan', title: 'Run Dark Web Scan', subtitle: 'Check for breaches', icon: <Eye className="w-4 h-4" />, action: () => { onNavigate('robin'); onClose(); }, category: 'action' },
    
    // System
    { id: 'sys-devmode', title: 'Toggle Developer Mode', subtitle: 'IPC debugger', icon: <Bug className="w-4 h-4" />, action: () => { onToggleDevMode(); onClose(); }, shortcut: 'Ctrl+Shift+D', category: 'system' },
    { id: 'sys-settings', title: 'Settings', subtitle: 'Configuration', icon: <Settings className="w-4 h-4" />, action: () => { onNavigate('settings'); onClose(); }, category: 'system' },
  ], [onNavigate, onClose, onToggleDevMode]);

  const fuse = useMemo(() => new Fuse(commands, {
    keys: ['title', 'subtitle'],
    threshold: 0.3,
  }), [commands]);

  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    return fuse.search(query).map(result => result.item);
  }, [query, fuse, commands]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      navigation: [],
      action: [],
      system: [],
    };
    filteredCommands.forEach(cmd => {
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      e.preventDefault();
      filteredCommands[selectedIndex].action();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50"
          >
            <div className="glass-panel rounded-xl border border-primary/30 shadow-2xl overflow-hidden neon-border">
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-border/40">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Command className="w-4 h-4" />
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Type a command or search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none font-mono"
                />
                <kbd className="px-2 py-1 text-xs text-muted-foreground bg-muted rounded">ESC</kbd>
              </div>
              
              {/* Results */}
              <div className="max-h-80 overflow-y-auto p-2">
                {Object.entries(groupedCommands).map(([category, items]) => {
                  if (items.length === 0) return null;
                  return (
                    <div key={category} className="mb-4 last:mb-0">
                      <div className="px-2 py-1 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        {category}
                      </div>
                      {items.map((cmd) => {
                        const globalIndex = filteredCommands.indexOf(cmd);
                        return (
                          <button
                            key={cmd.id}
                            onClick={cmd.action}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                              globalIndex === selectedIndex
                                ? 'bg-primary/20 text-primary'
                                : 'text-foreground hover:bg-muted/50'
                            }`}
                          >
                            <span className={globalIndex === selectedIndex ? 'text-primary' : 'text-muted-foreground'}>
                              {cmd.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{cmd.title}</div>
                              {cmd.subtitle && (
                                <div className="text-xs text-muted-foreground truncate">{cmd.subtitle}</div>
                              )}
                            </div>
                            {cmd.shortcut && (
                              <kbd className="px-2 py-0.5 text-xs text-muted-foreground bg-muted rounded">
                                {cmd.shortcut}
                              </kbd>
                            )}
                            <ArrowRight className={`w-4 h-4 ${globalIndex === selectedIndex ? 'text-primary' : 'text-muted-foreground/50'}`} />
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
                
                {filteredCommands.length === 0 && (
                  <div className="px-3 py-8 text-center text-muted-foreground">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No commands found</p>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="flex items-center gap-4 px-4 py-2 border-t border-border/40 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded">↵</kbd> Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded">ESC</kbd> Close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
