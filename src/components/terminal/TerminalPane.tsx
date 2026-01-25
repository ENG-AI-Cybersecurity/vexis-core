import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { motion } from 'framer-motion';
import { Maximize2, Minimize2, X, RotateCcw, Copy } from 'lucide-react';
import '@xterm/xterm/css/xterm.css';

interface TerminalPaneProps {
  id: number;
  title: string;
  onClose?: () => void;
  onFocus?: () => void;
  isFocused?: boolean;
}

export function TerminalPane({ id, title, onClose, onFocus, isFocused }: TerminalPaneProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (!terminalRef.current) return;

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
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 13,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 1000,
      allowTransparency: true,
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(terminalRef.current);
    fit.fit();

    terminalInstance.current = term;
    fitAddon.current = fit;

    // Welcome message
    const welcomeLines = [
      '\x1b[32m╔══════════════════════════════════════════╗\x1b[0m',
      '\x1b[32m║\x1b[0m  \x1b[1;32mVEXIS LINUX\x1b[0m - Security Terminal        \x1b[32m║\x1b[0m',
      '\x1b[32m║\x1b[0m  Lab: \x1b[36m' + title.padEnd(33) + '\x1b[32m║\x1b[0m',
      '\x1b[32m╚══════════════════════════════════════════╝\x1b[0m',
      '',
      '\x1b[33m[*]\x1b[0m Initializing secure environment...',
      '\x1b[32m[✓]\x1b[0m WSL2 kernel loaded',
      '\x1b[32m[✓]\x1b[0m Network isolation active',
      '\x1b[32m[✓]\x1b[0m HMAC authentication verified',
      '',
    ];

    welcomeLines.forEach((line, i) => {
      setTimeout(() => term.writeln(line), i * 50);
    });

    setTimeout(() => {
      term.write('\x1b[32mvexis@lab-' + id + '\x1b[0m:\x1b[34m~\x1b[0m$ ');
    }, welcomeLines.length * 50 + 100);

    // Handle input
    let commandBuffer = '';
    term.onData((data) => {
      if (data === '\r') {
        term.writeln('');
        if (commandBuffer.trim()) {
          handleCommand(term, commandBuffer.trim(), id);
        }
        commandBuffer = '';
        term.write('\x1b[32mvexis@lab-' + id + '\x1b[0m:\x1b[34m~\x1b[0m$ ');
      } else if (data === '\x7f') {
        if (commandBuffer.length > 0) {
          commandBuffer = commandBuffer.slice(0, -1);
          term.write('\b \b');
        }
      } else {
        commandBuffer += data;
        term.write(data);
      }
    });

    const handleResize = () => {
      if (fitAddon.current) {
        fitAddon.current.fit();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, [id, title]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`terminal-window flex flex-col h-full crt-scanlines ${isMaximized ? 'fixed inset-4 z-50' : ''}`}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <button 
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-destructive hover:brightness-125 transition-all"
            />
            <button className="w-3 h-3 rounded-full bg-warning hover:brightness-125 transition-all" />
            <button 
              onClick={() => setIsMaximized(!isMaximized)}
              className="w-3 h-3 rounded-full bg-success hover:brightness-125 transition-all"
            />
          </div>
          <span className="text-xs text-muted-foreground ml-2 font-mono">{title}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-muted/50 rounded transition-colors">
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button className="p-1 hover:bg-muted/50 rounded transition-colors">
            <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button 
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 hover:bg-muted/50 rounded transition-colors"
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
      <div ref={terminalRef} className="flex-1 p-2" />
    </motion.div>
  );
}

function handleCommand(term: Terminal, command: string, labId: number) {
  const commands: Record<string, () => void> = {
    'help': () => {
      const helpText = [
        '\x1b[36mAvailable Commands:\x1b[0m',
        '  help      - Show this help message',
        '  clear     - Clear terminal',
        '  whoami    - Display current user',
        '  uname -a  - System information',
        '  netstat   - Network status',
        '  nmap      - Network scanner (simulated)',
        '  status    - Lab status',
        '',
      ];
      helpText.forEach(line => term.writeln(line));
    },
    'clear': () => {
      term.clear();
    },
    'whoami': () => {
      term.writeln('\x1b[32mvexis\x1b[0m');
    },
    'uname -a': () => {
      term.writeln('Linux vexis-lab-' + labId + ' 5.15.0-wsl2 #1 SMP x86_64 GNU/Linux');
    },
    'netstat': () => {
      const output = [
        '\x1b[33mActive Internet connections:\x1b[0m',
        'Proto  Local Address      Foreign Address    State',
        'tcp    127.0.0.1:8080     0.0.0.0:*          LISTEN',
        'tcp    0.0.0.0:22         0.0.0.0:*          LISTEN',
        'udp    0.0.0.0:68         0.0.0.0:*          ',
        '',
      ];
      output.forEach(line => term.writeln(line));
    },
    'nmap': () => {
      term.writeln('\x1b[36mStarting Nmap 7.94 ( https://nmap.org )\x1b[0m');
      term.writeln('Scanning localhost (127.0.0.1)...');
      setTimeout(() => {
        term.writeln('\x1b[32mPORT     STATE SERVICE\x1b[0m');
        term.writeln('22/tcp   open  ssh');
        term.writeln('80/tcp   open  http');
        term.writeln('443/tcp  open  https');
        term.writeln('8080/tcp open  http-proxy');
        term.writeln('');
        term.writeln('\x1b[32mNmap done: 1 IP address (1 host up)\x1b[0m');
        term.write('\x1b[32mvexis@lab-' + labId + '\x1b[0m:\x1b[34m~\x1b[0m$ ');
      }, 800);
      return;
    },
    'status': () => {
      const output = [
        '\x1b[36m╔═══════════════════════════════╗\x1b[0m',
        '\x1b[36m║\x1b[0m      \x1b[1;32mLAB STATUS\x1b[0m              \x1b[36m║\x1b[0m',
        '\x1b[36m╠═══════════════════════════════╣\x1b[0m',
        '\x1b[36m║\x1b[0m Lab ID:     \x1b[33m' + String(labId).padEnd(17) + '\x1b[36m║\x1b[0m',
        '\x1b[36m║\x1b[0m Status:     \x1b[32mONLINE            \x1b[36m║\x1b[0m',
        '\x1b[36m║\x1b[0m Uptime:     \x1b[35m2h 34m 12s        \x1b[36m║\x1b[0m',
        '\x1b[36m║\x1b[0m Memory:     \x1b[33m256MB / 512MB     \x1b[36m║\x1b[0m',
        '\x1b[36m║\x1b[0m Network:    \x1b[32mIsolated          \x1b[36m║\x1b[0m',
        '\x1b[36m╚═══════════════════════════════╝\x1b[0m',
        '',
      ];
      output.forEach(line => term.writeln(line));
    },
  };

  if (commands[command]) {
    commands[command]();
  } else if (command.startsWith('nmap')) {
    commands['nmap']();
    return;
  } else {
    term.writeln(`\x1b[31mbash: ${command}: command not found\x1b[0m`);
  }
}