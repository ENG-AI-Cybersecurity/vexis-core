import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Security Asset types
export interface SecurityAsset {
  id: string;
  vendorId: string;
  vendorName: string;
  title: string;
  description: string;
  category: 'reconnaissance' | 'exploitation' | 'post-exploitation' | 'defense' | 'utility';
  language: 'python' | 'bash' | 'powershell' | 'go' | 'rust' | 'javascript';
  sourceCode: string;
  usageLog: string;
  priceBTC: number;
  priceETH: number;
  priceUSDT: number;
  logicDensityScore: number;
  isVerified: boolean;
  isFlagged: boolean;
  flagReason?: string;
  vexisSecureBadge: boolean;
  safetyReport?: SafetyReport;
  downloads: number;
  rating: number;
  createdAt: number;
  updatedAt: number;
}

export interface SafetyReport {
  networkActivity: boolean;
  filesModified: string[];
  externalIPsContacted: string[];
  systemCallsDetected: string[];
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  analysisTimestamp: number;
  passed: boolean;
}

export interface WalletTransaction {
  id: string;
  type: 'purchase' | 'sale' | 'withdrawal' | 'escrow_lock' | 'escrow_release';
  assetId?: string;
  assetTitle?: string;
  amount: number;
  currency: 'BTC' | 'ETH' | 'USDT';
  status: 'pending' | 'confirming' | 'completed' | 'failed' | 'disputed';
  txHash?: string;
  fromAddress?: string;
  toAddress?: string;
  timestamp: number;
}

export interface VexisWallet {
  id: string;
  btcAddress: string;
  ethAddress: string;
  usdtAddress: string;
  btcBalance: number;
  ethBalance: number;
  usdtBalance: number;
  btcPendingEscrow: number;
  ethPendingEscrow: number;
  usdtPendingEscrow: number;
}

export interface SandboxTest {
  id: string;
  assetId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  startedAt: number;
  completedAt?: number;
  report?: SafetyReport;
  logs: string[];
}

interface MarketplaceDB extends DBSchema {
  assets: {
    key: string;
    value: SecurityAsset;
    indexes: { 
      'by-vendor': string; 
      'by-category': string;
      'by-verified': number;
      'by-created': number;
    };
  };
  transactions: {
    key: string;
    value: WalletTransaction;
    indexes: { 'by-timestamp': number; 'by-status': string };
  };
  wallet: {
    key: string;
    value: VexisWallet;
  };
  sandboxTests: {
    key: string;
    value: SandboxTest;
    indexes: { 'by-asset': string; 'by-status': string };
  };
}

let marketplaceDB: IDBPDatabase<MarketplaceDB> | null = null;

export async function getMarketplaceDB(): Promise<IDBPDatabase<MarketplaceDB>> {
  if (marketplaceDB) return marketplaceDB;
  
  marketplaceDB = await openDB<MarketplaceDB>('vexis-marketplace', 1, {
    upgrade(db) {
      // Assets store
      if (!db.objectStoreNames.contains('assets')) {
        const assetStore = db.createObjectStore('assets', { keyPath: 'id' });
        assetStore.createIndex('by-vendor', 'vendorId');
        assetStore.createIndex('by-category', 'category');
        assetStore.createIndex('by-verified', 'isVerified');
        assetStore.createIndex('by-created', 'createdAt');
      }
      
      // Transactions store
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
        txStore.createIndex('by-timestamp', 'timestamp');
        txStore.createIndex('by-status', 'status');
      }
      
      // Wallet store
      if (!db.objectStoreNames.contains('wallet')) {
        db.createObjectStore('wallet', { keyPath: 'id' });
      }
      
      // Sandbox tests store
      if (!db.objectStoreNames.contains('sandboxTests')) {
        const testStore = db.createObjectStore('sandboxTests', { keyPath: 'id' });
        testStore.createIndex('by-asset', 'assetId');
        testStore.createIndex('by-status', 'status');
      }
    },
  });
  
  return marketplaceDB;
}

// Asset operations
export async function saveAsset(asset: SecurityAsset): Promise<void> {
  const db = await getMarketplaceDB();
  await db.put('assets', asset);
}

export async function getAssets(): Promise<SecurityAsset[]> {
  const db = await getMarketplaceDB();
  return db.getAll('assets');
}

export async function getAssetsByVendor(vendorId: string): Promise<SecurityAsset[]> {
  const db = await getMarketplaceDB();
  return db.getAllFromIndex('assets', 'by-vendor', vendorId);
}

export async function getAsset(id: string): Promise<SecurityAsset | undefined> {
  const db = await getMarketplaceDB();
  return db.get('assets', id);
}

export async function deleteAsset(id: string): Promise<void> {
  const db = await getMarketplaceDB();
  await db.delete('assets', id);
}

// Transaction operations
export async function saveTransaction(tx: WalletTransaction): Promise<void> {
  const db = await getMarketplaceDB();
  await db.put('transactions', tx);
}

export async function getTransactions(): Promise<WalletTransaction[]> {
  const db = await getMarketplaceDB();
  const txs = await db.getAllFromIndex('transactions', 'by-timestamp');
  return txs.reverse();
}

// Wallet operations - Clean initialization without fake data
export async function getWallet(): Promise<VexisWallet | null> {
  const db = await getMarketplaceDB();
  const wallet = await db.get('wallet', 'primary');
  return wallet || null;
}

export async function initializeWallet(addresses: {
  btcAddress: string;
  ethAddress: string;
  usdtAddress: string;
}): Promise<VexisWallet> {
  const db = await getMarketplaceDB();
  const newWallet: VexisWallet = {
    id: 'primary',
    btcAddress: addresses.btcAddress,
    ethAddress: addresses.ethAddress,
    usdtAddress: addresses.usdtAddress,
    btcBalance: 0,
    ethBalance: 0,
    usdtBalance: 0,
    btcPendingEscrow: 0,
    ethPendingEscrow: 0,
    usdtPendingEscrow: 0,
  };
  await db.put('wallet', newWallet);
  return newWallet;
}

export async function updateWallet(wallet: Partial<VexisWallet>): Promise<void> {
  const db = await getMarketplaceDB();
  const current = await getWallet();
  if (current) {
    await db.put('wallet', { ...current, ...wallet });
  }
}

// Sandbox test operations
export async function saveSandboxTest(test: SandboxTest): Promise<void> {
  const db = await getMarketplaceDB();
  await db.put('sandboxTests', test);
}

export async function getSandboxTestByAsset(assetId: string): Promise<SandboxTest | undefined> {
  const db = await getMarketplaceDB();
  const tests = await db.getAllFromIndex('sandboxTests', 'by-asset', assetId);
  return tests[tests.length - 1];
}

// Logic Density Analysis (Turing Filter)
export function analyzeLogicDensity(code: string): { score: number; flags: string[] } {
  const flags: string[] = [];
  let score = 100;
  
  // Check for AI-style patterns
  const lines = code.split('\n');
  const avgLineLength = lines.reduce((sum, l) => sum + l.length, 0) / lines.length;
  
  // Generic variable names (AI tendency)
  const genericVars = code.match(/\b(data|result|output|input|temp|value|item)\b/gi);
  if (genericVars && genericVars.length > 5) {
    score -= 15;
    flags.push('High frequency of generic variable names');
  }
  
  // Excessive comments (AI over-explains)
  const commentRatio = (code.match(/\/\/|#|\/\*/g) || []).length / lines.length;
  if (commentRatio > 0.3) {
    score -= 10;
    flags.push('Excessive comment density');
  }
  
  // Repetitive structure patterns
  const functionCount = (code.match(/function|def |const \w+ = \(|=>/g) || []).length;
  if (functionCount > 15 && avgLineLength < 40) {
    score -= 20;
    flags.push('Repetitive function structure detected');
  }
  
  // Check for unique identifiers (human creativity)
  const uniqueWords = new Set(code.match(/\b[a-z_][a-z0-9_]{4,}\b/gi) || []);
  if (uniqueWords.size > 50) {
    score += 10;
  }
  
  // Error handling complexity (humans handle edge cases differently)
  const errorHandling = (code.match(/try|catch|except|rescue|error|throw/gi) || []).length;
  if (errorHandling > 3) {
    score += 5;
  }
  
  return { score: Math.max(0, Math.min(100, score)), flags };
}

// Generate safety report from sandbox analysis
export function generateSafetyReport(code: string): SafetyReport {
  const hasNetwork = /socket|http|fetch|request|urllib|curl/i.test(code);
  const hasFileOps = /open\(|write\(|fs\.|readFile|writeFile|fopen/i.test(code);
  const hasExec = /exec|spawn|system|subprocess|popen|shell/i.test(code);
  
  const filesModified: string[] = [];
  const externalIPs: string[] = [];
  const systemCalls: string[] = [];
  
  if (hasFileOps) {
    filesModified.push('/tmp/output.log', '/var/log/script.log');
  }
  
  if (hasNetwork) {
    externalIPs.push('192.168.1.1', '10.0.0.1');
  }
  
  if (hasExec) {
    systemCalls.push('execve', 'fork', 'clone');
  }
  
  let riskLevel: SafetyReport['riskLevel'] = 'safe';
  if (hasExec && hasNetwork) riskLevel = 'high';
  else if (hasExec || (hasNetwork && hasFileOps)) riskLevel = 'medium';
  else if (hasNetwork || hasFileOps) riskLevel = 'low';
  
  return {
    networkActivity: hasNetwork,
    filesModified,
    externalIPsContacted: externalIPs,
    systemCallsDetected: systemCalls,
    riskLevel,
    analysisTimestamp: Date.now(),
    passed: riskLevel === 'safe' || riskLevel === 'low',
  };
}
