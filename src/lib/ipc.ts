import { saveIPCLog } from './db';

// HMAC-SHA256 mock implementation
async function generateHMACToken(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Simulated secret key (in real app, this would be securely stored)
const IPC_SECRET = 'vexis-linux-daemon-secret-key-2024';

export interface RPCRequest {
  jsonrpc: '2.0';
  method: string;
  params: unknown;
  id: string;
}

export interface RPCResponse {
  jsonrpc: '2.0';
  result?: unknown;
  error?: { code: number; message: string };
  id: string;
}

type IPCListener = (log: {
  id: string;
  method: string;
  params: unknown;
  token: string;
  timestamp: number;
  direction: 'outbound' | 'inbound';
  status: 'pending' | 'success' | 'error';
  response?: RPCResponse;
}) => void;

const listeners: Set<IPCListener> = new Set();

export function subscribeToIPC(listener: IPCListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners(log: Parameters<IPCListener>[0]) {
  listeners.forEach(listener => listener(log));
}

export async function sendRPCRequest(method: string, params: unknown): Promise<RPCResponse> {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = Date.now();
  
  // Generate HMAC token for authentication
  const message = JSON.stringify({ method, params, timestamp });
  const token = await generateHMACToken(message, IPC_SECRET);
  
  const request: RPCRequest = {
    jsonrpc: '2.0',
    method,
    params,
    id: requestId,
  };
  
  // Log outbound request
  const logEntry = {
    id: requestId,
    method,
    params,
    token,
    timestamp,
    direction: 'outbound' as const,
    status: 'pending' as const,
  };
  
  await saveIPCLog(logEntry);
  notifyListeners(logEntry);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  
  // Mock response based on method
  const response = mockDaemonResponse(request);
  
  // Log inbound response
  const responseLog = {
    ...logEntry,
    direction: 'inbound' as const,
    status: response.error ? 'error' as const : 'success' as const,
    response,
  };
  
  notifyListeners(responseLog);
  
  return response;
}

function mockDaemonResponse(request: RPCRequest): RPCResponse {
  const responses: Record<string, () => unknown> = {
    'lab.create': () => ({ id: `lab-${Date.now()}`, status: 'created' }),
    'lab.start': () => ({ status: 'running', pid: Math.floor(Math.random() * 10000) }),
    'lab.stop': () => ({ status: 'stopped' }),
    'lab.list': () => ([]),
    'system.status': () => ({ cpu: 23, ram: 1240, wsl2: 'active' }),
    'robin.scan': () => ({ breaches: Math.floor(Math.random() * 5), sources: ['darkweb', 'pastebin'] }),
    'marketplace.install': () => ({ installed: true, path: '/opt/vexis/packs/' }),
    'security.verify': () => ({ verified: true, signature: 'valid' }),
  };
  
  const handler = responses[request.method];
  
  if (handler) {
    return {
      jsonrpc: '2.0',
      result: handler(),
      id: request.id,
    };
  }
  
  return {
    jsonrpc: '2.0',
    error: { code: -32601, message: 'Method not found' },
    id: request.id,
  };
}

// File path sanitization for Zip Slip protection
export function sanitizeFilePath(path: string, baseDir: string): string | null {
  // Remove any null bytes
  const cleanPath = path.replace(/\0/g, '');
  
  // Normalize and resolve the path
  const normalizedPath = cleanPath
    .replace(/\\/g, '/') // Normalize separators
    .replace(/\.{2,}/g, '') // Remove multiple dots
    .replace(/\/+/g, '/') // Remove multiple slashes
    .replace(/^\/+/, ''); // Remove leading slashes
  
  // Check for path traversal attempts
  if (normalizedPath.includes('..') || normalizedPath.startsWith('/')) {
    console.warn('[SECURITY] Zip Slip attack detected:', path);
    return null;
  }
  
  // Construct full path
  const fullPath = `${baseDir}/${normalizedPath}`;
  
  // Verify path stays within base directory
  if (!fullPath.startsWith(baseDir)) {
    console.warn('[SECURITY] Path traversal blocked:', path);
    return null;
  }
  
  return fullPath;
}
