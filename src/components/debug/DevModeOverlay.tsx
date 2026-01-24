import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Bug, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Check, 
  AlertTriangle,
  Trash2,
  Copy,
  Key,
} from 'lucide-react';
import { subscribeToIPC, sendRPCRequest } from '@/lib/ipc';
import { getIPCLogs, clearIPCLogs } from '@/lib/db';

interface IPCLog {
  id: string;
  method: string;
  params: unknown;
  token: string;
  timestamp: number;
  direction: 'outbound' | 'inbound';
  status: 'pending' | 'success' | 'error';
  response?: unknown;
}

interface DevModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DevModeOverlay({ isOpen, onClose }: DevModeOverlayProps) {
  const [logs, setLogs] = useState<IPCLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<IPCLog | null>(null);
  const [filter, setFilter] = useState<'all' | 'outbound' | 'inbound'>('all');

  // Load persisted logs and subscribe to new ones
  useEffect(() => {
    if (!isOpen) return;
    
    // Load existing logs
    getIPCLogs(100).then(setLogs);
    
    // Subscribe to new logs
    const unsubscribe = subscribeToIPC((log) => {
      setLogs(prev => [log as IPCLog, ...prev].slice(0, 100));
    });
    
    return unsubscribe;
  }, [isOpen]);

  const filteredLogs = logs.filter(log => 
    filter === 'all' || log.direction === filter
  );

  const handleClearLogs = async () => {
    await clearIPCLogs();
    setLogs([]);
    setSelectedLog(null);
  };

  const handleTestRequest = async () => {
    await sendRPCRequest('system.status', { timestamp: Date.now() });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 w-[600px] max-h-[500px] z-50"
        >
          <div className="glass-panel-purple rounded-xl border border-secondary/40 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-secondary/30 bg-secondary/10">
              <div className="flex items-center gap-3">
                <Bug className="w-5 h-5 text-secondary" />
                <span className="font-display font-bold text-secondary neon-text-purple">Developer Mode</span>
                <span className="px-2 py-0.5 text-xs bg-secondary/20 text-secondary rounded-full">IPC Debugger</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestRequest}
                  className="px-3 py-1 text-xs bg-secondary/20 text-secondary rounded hover:bg-secondary/30 transition-colors"
                >
                  Test RPC
                </button>
                <button
                  onClick={handleClearLogs}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border/40">
              {(['all', 'outbound', 'inbound'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    filter === f
                      ? 'bg-secondary/20 text-secondary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
              <div className="flex-1" />
              <span className="text-xs text-muted-foreground">{filteredLogs.length} entries</span>
            </div>
            
            {/* Content */}
            <div className="flex h-[350px]">
              {/* Log List */}
              <div className="flex-1 overflow-y-auto border-r border-border/40">
                {filteredLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Bug className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">No IPC traffic yet</p>
                    <p className="text-xs">Click "Test RPC" to generate traffic</p>
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <button
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm border-b border-border/20 transition-colors ${
                        selectedLog?.id === log.id
                          ? 'bg-secondary/10'
                          : 'hover:bg-muted/30'
                      }`}
                    >
                      {log.direction === 'outbound' ? (
                        <ArrowUpRight className="w-4 h-4 text-primary flex-shrink-0" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4 text-accent flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-xs truncate">{log.method}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      {log.status === 'success' && <Check className="w-4 h-4 text-primary" />}
                      {log.status === 'error' && <AlertTriangle className="w-4 h-4 text-destructive" />}
                      {log.status === 'pending' && (
                        <div className="w-3 h-3 rounded-full bg-warning animate-pulse" />
                      )}
                    </button>
                  ))
                )}
              </div>
              
              {/* Detail Panel */}
              <div className="w-[250px] overflow-y-auto p-3">
                {selectedLog ? (
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Method</div>
                      <div className="font-mono text-sm text-foreground">{selectedLog.method}</div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">HMAC Token</span>
                        <button
                          onClick={() => copyToClipboard(selectedLog.token)}
                          className="p-1 text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Key className="w-3 h-3 text-warning flex-shrink-0" />
                        <code className="text-[10px] font-mono text-warning break-all bg-muted/50 px-1 py-0.5 rounded">
                          {selectedLog.token.slice(0, 32)}...
                        </code>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Params</div>
                      <pre className="text-[10px] font-mono bg-muted/50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(selectedLog.params, null, 2)}
                      </pre>
                    </div>
                    
                    {selectedLog.response && (
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Response</div>
                        <pre className="text-[10px] font-mono bg-muted/50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(selectedLog.response, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p className="text-xs">Select a log entry</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
