import { openDB, DBSchema, IDBPDatabase } from 'idb';

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
}

let dbInstance: IDBPDatabase<VexisDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<VexisDB>> {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB<VexisDB>('vexis-db', 1, {
    upgrade(db) {
      // Terminal logs store
      const terminalStore = db.createObjectStore('terminalLogs', { keyPath: 'id' });
      terminalStore.createIndex('by-terminal', 'terminalId');
      terminalStore.createIndex('by-timestamp', 'timestamp');
      
      // Labs store
      db.createObjectStore('labs', { keyPath: 'id' });
      
      // IPC logs store
      const ipcStore = db.createObjectStore('ipcLogs', { keyPath: 'id' });
      ipcStore.createIndex('by-timestamp', 'timestamp');
      
      // Forum posts store
      const forumStore = db.createObjectStore('forumPosts', { keyPath: 'id' });
      forumStore.createIndex('by-timestamp', 'timestamp');
      forumStore.createIndex('by-points', 'points');
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
