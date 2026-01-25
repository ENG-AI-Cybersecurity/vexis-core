import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Shield, AlertTriangle, Eye, Server, Check, Trash2 } from 'lucide-react';
import { 
  getNotifications, 
  markNotificationRead, 
  markAllNotificationsRead,
  saveNotification,
  type Notification 
} from '@/lib/db';
import { cn } from '@/lib/utils';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterType = 'all' | 'security' | 'system' | 'robin';

const filterIcons: Record<FilterType, React.ReactNode> = {
  all: <Bell className="w-4 h-4" />,
  security: <Shield className="w-4 h-4" />,
  system: <Server className="w-4 h-4" />,
  robin: <Eye className="w-4 h-4" />,
};

const typeColors: Record<string, string> = {
  security: 'text-destructive',
  system: 'text-accent',
  robin: 'text-secondary',
  general: 'text-muted-foreground',
};

const typeIcons: Record<string, React.ReactNode> = {
  security: <Shield className="w-4 h-4" />,
  system: <Server className="w-4 h-4" />,
  robin: <Eye className="w-4 h-4" />,
  general: <Bell className="w-4 h-4" />,
};

// Seed some initial notifications
async function seedNotifications() {
  const existing = await getNotifications();
  if (existing.length > 0) return;

  const initialNotifs = [
    {
      type: 'robin' as const,
      title: 'New Breach Detected',
      message: 'Email admin@company.com found in leaked database',
      timestamp: Date.now() - 1000 * 60 * 5,
      read: false,
      critical: true,
    },
    {
      type: 'security' as const,
      title: 'Unauthorized IPC Access Blocked',
      message: 'Invalid HMAC token rejected from process 4521',
      timestamp: Date.now() - 1000 * 60 * 15,
      read: false,
      critical: true,
    },
    {
      type: 'system' as const,
      title: 'Lab 1.0 Started Successfully',
      message: 'Kali Linux lab is now running with 2GB RAM allocated',
      timestamp: Date.now() - 1000 * 60 * 30,
      read: true,
      critical: false,
    },
    {
      type: 'system' as const,
      title: 'WSL2 Kernel Updated',
      message: 'Updated to version 5.15.90.1',
      timestamp: Date.now() - 1000 * 60 * 60,
      read: true,
      critical: false,
    },
    {
      type: 'security' as const,
      title: 'Firewall Rules Applied',
      message: 'New isolation rules active for Lab 2',
      timestamp: Date.now() - 1000 * 60 * 120,
      read: true,
      critical: false,
    },
  ];

  for (const notif of initialNotifs) {
    await saveNotification(notif);
  }
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    await seedNotifications();
    const notifs = await getNotifications();
    setNotifications(notifs);
    setLoading(false);
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || n.type === filter
  );

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalUnread = notifications.filter(n => !n.read && n.critical).length;

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
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
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-96 glass-panel border-l border-border/40 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="w-5 h-5 text-primary" />
                  {criticalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-[10px] flex items-center justify-center text-white font-bold">
                      {criticalUnread}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-display font-semibold">Notifications</h3>
                  <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAllRead}
                  className="p-1.5 rounded hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                  title="Mark all as read"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-1 p-2 border-b border-border/40">
              {(['all', 'security', 'system', 'robin'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    filter === f
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {filterIcons[f]}
                  <span className="capitalize">{f}</span>
                </button>
              ))}
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Bell className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {filteredNotifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        'p-4 hover:bg-muted/30 transition-colors cursor-pointer',
                        !notif.read && 'bg-muted/20'
                      )}
                      onClick={() => handleMarkRead(notif.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn('mt-0.5', typeColors[notif.type])}>
                          {typeIcons[notif.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'font-medium text-sm',
                              !notif.read ? 'text-foreground' : 'text-muted-foreground'
                            )}>
                              {notif.title}
                            </span>
                            {notif.critical && !notif.read && (
                              <AlertTriangle className="w-3 h-3 text-destructive" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {formatTime(notif.timestamp)}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}