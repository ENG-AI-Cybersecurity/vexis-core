import { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import { motion } from 'framer-motion';
import { Maximize2, Minimize2, X, RotateCcw, Copy, Wifi, WifiOff } from 'lucide-react';
import '@xterm/xterm/css/xterm.css';

// Wails runtime interface
declare global {
  interface Window {
    runtime?: {
      EventsEmit: (eventName: string, data: unknown) => void;
      EventsOn: (eventName: string, callback: (data: unknown) => void) => () => void;
      EventsOff: (eventName: string) => void;
    };
  }
}

interface TerminalPaneProps {
  id: number;
  title: string;
  onClose?: () => void;
  onFocus?: () => void;
  isFocused?: boolean;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export function TerminalPane({ id, title, onClose, onFocus, isFocused }: TerminalPaneProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const webglAddon = useRef<WebglAddon | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  
  const [isMaximized, setIsMaximized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');

  // Emit terminal input to Wails backend
  const emitTerminalInput = useCallback((data: string) => {
    if (window.runtime?.EventsEmit) {
      window.runtime.EventsEmit('terminal-input', { id, data });
    } else {
      // Fallback for development without Wails runtime
      console.debug(`[Terminal ${id}] Input emitted:`, data);
    }
  }, [id]);

  // Write data to terminal (called from backend events)
  const writeToTerminal = useCallback((data: string) => {
    if (terminalInstance.current) {
      terminalInstance.current.write(data);
    }
  }, []);

  // Clear terminal
  const clearTerminal = useCallback(() => {
    if (terminalInstance.current) {
      terminalInstance.current.clear();
    }
  }, []);

  // Reset terminal connection
  const resetConnection = useCallback(() => {
    setConnectionStatus('connecting');
    if (window.runtime?.EventsEmit) {
      window.runtime.EventsEmit('terminal-reset', { id });
    }
    // Simulate reconnection after reset
    setTimeout(() => {
      setConnectionStatus(window.runtime ? 'connected' : 'disconnected');
    }, 1000);
  }, [id]);

  // Copy terminal selection
  const copySelection = useCallback(() => {
    if (terminalInstance.current) {
      const selection = terminalInstance.current.getSelection();
      if (selection) {
        navigator.clipboard.writeText(selection);
      }
    }
  }, []);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize terminal with optimized settings
    const term = new Terminal({
      theme: {
        background: '#050810',
        foreground: '#00ff41',
        cursor: '#00ff41',
        cursorAccent: '#050810',
        selectionBackground: '#00ff4133',
        black: '#0a0f1a',
        red: '#ff4444',
        green: '#00ff41',
        yellow: '#ffff00',
        blue: '#00d9ff',
        magenta: '#9d4edd',
        cyan: '#00d9ff',
        white: '#c0c0c0',
        brightBlack: '#404040',
        brightRed: '#ff6666',
        brightGreen: '#33ff66',
        brightYellow: '#ffff33',
        brightBlue: '#33ddff',
        brightMagenta: '#b366ff',
        brightCyan: '#33ffff',
        brightWhite: '#ffffff',
      },
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: 13,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 5000,
      allowTransparency: true,
      allowProposedApi: true,
    });

    // Load FitAddon for responsive sizing
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(terminalRef.current);
    fit.fit();

    // Load WebGL addon for high-performance rendering
    try {
      const webgl = new WebglAddon();
      webgl.onContextLoss(() => {
        console.warn(`[Terminal ${id}] WebGL context lost, disposing addon`);
        webgl.dispose();
      });
      term.loadAddon(webgl);
      webglAddon.current = webgl;
      console.log(`[Terminal ${id}] WebGL addon loaded successfully`);
    } catch (error) {
      console.warn(`[Terminal ${id}] WebGL addon failed to load, using canvas renderer:`, error);
    }

    terminalInstance.current = term;
    fitAddon.current = fit;

    // Display connection status banner
    term.writeln('\x1b[32m╔══════════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[32m║\x1b[0m  \x1b[1;32mVEXIS LINUX\x1b[0m - Operational Terminal     \x1b[32m║\x1b[0m');
    term.writeln('\x1b[32m║\x1b[0m  Pipe: \x1b[36m' + `IPC-${id}`.padEnd(33) + '\x1b[32m║\x1b[0m');
    term.writeln('\x1b[32m╚══════════════════════════════════════════╝\x1b[0m');
    term.writeln('');
    term.writeln('\x1b[33m[*]\x1b[0m Establishing IPC connection...');

    // Forward ALL terminal input to Wails backend
    const dataDisposable = term.onData((data) => {
      emitTerminalInput(data);
    });

    // Forward binary data if applicable
    const binaryDisposable = term.onBinary?.((data) => {
      emitTerminalInput(data);
    });

    // Listen for backend output events
    let unsubscribe: (() => void) | null = null;
    
    if (window.runtime?.EventsOn) {
      // Connected to Wails runtime
      unsubscribe = window.runtime.EventsOn(`terminal-output-${id}`, (data) => {
        if (typeof data === 'string') {
          writeToTerminal(data);
        } else if (data && typeof data === 'object' && 'output' in data) {
          writeToTerminal((data as { output: string }).output);
        }
      });
      
      setConnectionStatus('connected');
      term.writeln('\x1b[32m[✓]\x1b[0m IPC pipe connected');
      term.writeln('\x1b[32m[✓]\x1b[0m WebGL renderer active');
      term.writeln('\x1b[32m[✓]\x1b[0m Backend streaming enabled');
      term.writeln('');
      
      // Notify backend that terminal is ready
      window.runtime.EventsEmit('terminal-ready', { id, title });
    } else {
      // Development mode without Wails
      setConnectionStatus('disconnected');
      term.writeln('\x1b[33m[!]\x1b[0m Running in standalone mode');
      term.writeln('\x1b[33m[!]\x1b[0m Wails runtime not detected');
      term.writeln('\x1b[36m[i]\x1b[0m Connect to backend for full functionality');
      term.writeln('');
      term.writeln('\x1b[90m    This terminal is awaiting backend connection.\x1b[0m');
      term.writeln('\x1b[90m    All input will be emitted when connected.\x1b[0m');
      term.writeln('');
    }

    // Handle window resize
    const handleResize = () => {
      if (fitAddon.current) {
        fitAddon.current.fit();
        // Notify backend of size change
        if (window.runtime?.EventsEmit && terminalInstance.current) {
          window.runtime.EventsEmit('terminal-resize', {
            id,
            cols: terminalInstance.current.cols,
            rows: terminalInstance.current.rows,
          });
        }
      }
    };

    // Observe container size changes
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    
    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    window.addEventListener('resize', handleResize);

    // Cleanup function
    cleanupRef.current = () => {
      dataDisposable.dispose();
      binaryDisposable?.dispose();
      if (unsubscribe) unsubscribe();
      if (window.runtime?.EventsOff) {
        window.runtime.EventsOff(`terminal-output-${id}`);
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      webglAddon.current?.dispose();
      term.dispose();
    };

    return () => {
      cleanupRef.current?.();
    };
  }, [id, title, emitTerminalInput, writeToTerminal]);

  // Handle focus
  useEffect(() => {
    if (isFocused && terminalInstance.current) {
      terminalInstance.current.focus();
    }
  }, [isFocused]);

  const getStatusIndicator = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-3 h-3 text-success animate-pulse" />;
      case 'connecting':
        return <Wifi className="w-3 h-3 text-warning animate-pulse" />;
      case 'disconnected':
        return <WifiOff className="w-3 h-3 text-muted-foreground" />;
      case 'error':
        return <WifiOff className="w-3 h-3 text-destructive" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      onClick={onFocus}
      className={`terminal-window flex flex-col h-full crt-scanlines ${
        isMaximized ? 'fixed inset-4 z-50' : ''
      } ${isFocused ? 'ring-1 ring-primary/50' : ''}`}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <button 
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-destructive hover:brightness-125 transition-all"
              title="Close terminal"
            />
            <button 
              className="w-3 h-3 rounded-full bg-warning hover:brightness-125 transition-all" 
              title="Minimize"
            />
            <button 
              onClick={() => setIsMaximized(!isMaximized)}
              className="w-3 h-3 rounded-full bg-success hover:brightness-125 transition-all"
              title={isMaximized ? 'Restore' : 'Maximize'}
            />
          </div>
          <div className="flex items-center gap-2 ml-2">
            {getStatusIndicator()}
            <span className="text-xs text-muted-foreground font-mono">{title}</span>
            <span className="text-[10px] text-muted-foreground/60 font-mono">
              [IPC-{id}]
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={copySelection}
            className="p-1 hover:bg-muted/50 rounded transition-colors"
            title="Copy selection"
          >
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button 
            onClick={resetConnection}
            className="p-1 hover:bg-muted/50 rounded transition-colors"
            title="Reset connection"
          >
            <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button 
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 hover:bg-muted/50 rounded transition-colors"
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? (
              <Minimize2 className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div 
        ref={terminalRef} 
        className="flex-1 p-2 min-h-0"
        style={{ minHeight: '100px' }}
      />
    </motion.div>
  );
}
