import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Theme types
export type ThemeType = 'neon-night' | 'classic-hacker' | 'monochrome-stealth';

export interface UserSettings {
  theme: ThemeType;
  scanlinesEnabled: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

export interface Notification {
  id: string;
  type: 'security' | 'system' | 'robin' | 'general';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  critical: boolean;
}

export interface TelemetryData {
  timestamp: number;
  cpu: number;
  memory: number;
  diskIO: number;
  networkIn: number;
  networkOut: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  xpReward: number;
  completed: boolean;
  unlocked: boolean;
  prerequisites: string[];
  category: 'reconnaissance' | 'exploitation' | 'post-exploitation' | 'defense';
}

interface VexisDB extends DBSchema {
  terminalLogs: {
    key: string;
    value: {
      id: string;
      terminalId: number;
      content: string;
      timestamp: number;
    };
    indexes: { 'by-terminal': number; 'by-timestamp': number };
  };
  labs: {
    key: string;
    value: {
      id: string;
      name: string;
      distro: string;
      status: 'running' | 'stopped' | 'error';
      ram: number;
      ramLimit: number;
      cpu: number;
      uptime: string;
      network: 'isolated' | 'bridged' | 'nat';
      airGap: boolean;
      vpnTunnel: boolean;
      createdAt: number;
    };
  };
  ipcLogs: {
    key: string;
    value: {
      id: string;
      method: string;
      params: unknown;
      token: string;
      timestamp: number;
      direction: 'outbound' | 'inbound';
      status: 'pending' | 'success' | 'error';
    };
    indexes: { 'by-timestamp': number };
  };
  forumPosts: {
    key: string;
    value: {
      id: string;
      title: string;
      author: string;
      content: string;
      points: number;
      comments: number;
      timestamp: number;
      tags: string[];
    };
    indexes: { 'by-timestamp': number; 'by-points': number };
  };
  settings: {
    key: string;
    value: UserSettings;
  };
  notifications: {
    key: string;
    value: Notification;
    indexes: { 'by-timestamp': number; 'by-type': string };
  };
  telemetry: {
    key: number;
    value: TelemetryData;
    indexes: { 'by-timestamp': number };
  };
  missions: {
    key: string;
    value: Mission;
    indexes: { 'by-category': string };
  };
}

let dbInstance: IDBPDatabase<VexisDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<VexisDB>> {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB<VexisDB>('vexis-db', 2, {
    upgrade(db, oldVersion) {
      // Terminal logs store
      if (!db.objectStoreNames.contains('terminalLogs')) {
        const terminalStore = db.createObjectStore('terminalLogs', { keyPath: 'id' });
        terminalStore.createIndex('by-terminal', 'terminalId');
        terminalStore.createIndex('by-timestamp', 'timestamp');
      }
      
      // Labs store
      if (!db.objectStoreNames.contains('labs')) {
        db.createObjectStore('labs', { keyPath: 'id' });
      }
      
      // IPC logs store
      if (!db.objectStoreNames.contains('ipcLogs')) {
        const ipcStore = db.createObjectStore('ipcLogs', { keyPath: 'id' });
        ipcStore.createIndex('by-timestamp', 'timestamp');
      }
      
      // Forum posts store
      if (!db.objectStoreNames.contains('forumPosts')) {
        const forumStore = db.createObjectStore('forumPosts', { keyPath: 'id' });
        forumStore.createIndex('by-timestamp', 'timestamp');
        forumStore.createIndex('by-points', 'points');
      }

      // Settings store (new in v2)
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'theme' });
      }

      // Notifications store (new in v2)
      if (!db.objectStoreNames.contains('notifications')) {
        const notifStore = db.createObjectStore('notifications', { keyPath: 'id' });
        notifStore.createIndex('by-timestamp', 'timestamp');
        notifStore.createIndex('by-type', 'type');
      }

      // Telemetry store (new in v2)
      if (!db.objectStoreNames.contains('telemetry')) {
        const telemetryStore = db.createObjectStore('telemetry', { keyPath: 'timestamp' });
        telemetryStore.createIndex('by-timestamp', 'timestamp');
      }

      // Missions store (new in v2)
      if (!db.objectStoreNames.contains('missions')) {
        const missionsStore = db.createObjectStore('missions', { keyPath: 'id' });
        missionsStore.createIndex('by-category', 'category');
      }
    },
  });
  
  return dbInstance;
}

// Terminal logs operations
export async function saveTerminalLog(terminalId: number, content: string): Promise<void> {
  const db = await getDB();
  await db.put('terminalLogs', {
    id: `${terminalId}-${Date.now()}`,
    terminalId,
    content,
    timestamp: Date.now(),
  });
}

export async function getTerminalLogs(terminalId: number): Promise<string[]> {
  const db = await getDB();
  const logs = await db.getAllFromIndex('terminalLogs', 'by-terminal', terminalId);
  return logs.map(log => log.content);
}

// Labs operations
export async function saveLab(lab: VexisDB['labs']['value']): Promise<void> {
  const db = await getDB();
  await db.put('labs', lab);
}

export async function getLabs(): Promise<VexisDB['labs']['value'][]> {
  const db = await getDB();
  return db.getAll('labs');
}

export async function deleteLab(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('labs', id);
}

// IPC logs operations
export async function saveIPCLog(log: Omit<VexisDB['ipcLogs']['value'], 'id'>): Promise<string> {
  const db = await getDB();
  const id = `ipc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  await db.put('ipcLogs', { ...log, id });
  return id;
}

export async function getIPCLogs(limit = 50): Promise<VexisDB['ipcLogs']['value'][]> {
  const db = await getDB();
  const logs = await db.getAllFromIndex('ipcLogs', 'by-timestamp');
  return logs.slice(-limit).reverse();
}

export async function clearIPCLogs(): Promise<void> {
  const db = await getDB();
  await db.clear('ipcLogs');
}

// Forum posts operations
export async function saveForumPost(post: Omit<VexisDB['forumPosts']['value'], 'id'>): Promise<string> {
  const db = await getDB();
  const id = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  await db.put('forumPosts', { ...post, id });
  return id;
}

export async function getForumPosts(): Promise<VexisDB['forumPosts']['value'][]> {
  const db = await getDB();
  return db.getAll('forumPosts');
}

// Settings operations
const DEFAULT_SETTINGS: UserSettings = {
  theme: 'neon-night',
  scanlinesEnabled: true,
  notificationsEnabled: true,
  soundEnabled: false,
};

export async function getSettings(): Promise<UserSettings> {
  const db = await getDB();
  const settings = await db.get('settings', 'neon-night');
  if (!settings) {
    await db.put('settings', DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  return settings;
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', settings);
}

// Notifications operations
export async function saveNotification(notification: Omit<Notification, 'id'>): Promise<string> {
  const db = await getDB();
  const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  await db.put('notifications', { ...notification, id });
  return id;
}

export async function getNotifications(): Promise<Notification[]> {
  const db = await getDB();
  const notifications = await db.getAllFromIndex('notifications', 'by-timestamp');
  return notifications.reverse();
}

export async function markNotificationRead(id: string): Promise<void> {
  const db = await getDB();
  const notification = await db.get('notifications', id);
  if (notification) {
    await db.put('notifications', { ...notification, read: true });
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  const db = await getDB();
  const notifications = await db.getAll('notifications');
  for (const notif of notifications) {
    await db.put('notifications', { ...notif, read: true });
  }
}

export async function getUnreadCount(): Promise<number> {
  const db = await getDB();
  const notifications = await db.getAll('notifications');
  return notifications.filter(n => !n.read).length;
}

// Telemetry operations
export async function saveTelemetry(data: TelemetryData): Promise<void> {
  const db = await getDB();
  await db.put('telemetry', data);
  
  // Keep only last 100 entries for performance
  const all = await db.getAllFromIndex('telemetry', 'by-timestamp');
  if (all.length > 100) {
    const toDelete = all.slice(0, all.length - 100);
    for (const item of toDelete) {
      await db.delete('telemetry', item.timestamp);
    }
  }
}

export async function getTelemetry(limit = 30): Promise<TelemetryData[]> {
  const db = await getDB();
  const data = await db.getAllFromIndex('telemetry', 'by-timestamp');
  return data.slice(-limit);
}

// Missions operations
export async function getMissions(): Promise<Mission[]> {
  const db = await getDB();
  return db.getAll('missions');
}

export async function saveMission(mission: Mission): Promise<void> {
  const db = await getDB();
  await db.put('missions', mission);
}

export async function completeMission(id: string): Promise<void> {
  const db = await getDB();
  const mission = await db.get('missions', id);
  if (mission) {
    await db.put('missions', { ...mission, completed: true });
  }
}
