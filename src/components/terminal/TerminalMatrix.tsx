import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Grid3X3, Maximize } from 'lucide-react';
import { TerminalPane } from './TerminalPane';

interface TerminalConfig {
  id: number;
  title: string;
  active: boolean;
}

const defaultTerminals: TerminalConfig[] = [
  { id: 1, title: 'Main Terminal', active: true },
  { id: 2, title: 'Network Monitor', active: true },
  { id: 3, title: 'Packet Sniffer', active: true },
  { id: 4, title: 'Log Analyzer', active: true },
  { id: 5, title: 'Exploit Dev', active: true },
  { id: 6, title: 'Reverse Shell', active: true },
];

export function TerminalMatrix() {
  const [terminals, setTerminals] = useState<TerminalConfig[]>(defaultTerminals);
  const [layout, setLayout] = useState<'2x3' | '3x2' | '1x1'>('2x3');

  const activeTerminals = terminals.filter(t => t.active);

  const gridClass = {
    '2x3': 'grid-cols-3 grid-rows-2',
    '3x2': 'grid-cols-2 grid-rows-3',
    '1x1': 'grid-cols-1 grid-rows-1',
  };

  const handleCloseTerminal = (id: number) => {
    setTerminals(prev => 
      prev.map(t => t.id === id ? { ...t, active: false } : t)
    );
  };

  const handleAddTerminal = () => {
    const inactiveTerminal = terminals.find(t => !t.active);
    if (inactiveTerminal) {
      setTerminals(prev =>
        prev.map(t => t.id === inactiveTerminal.id ? { ...t, active: true } : t)
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full"
    >
      {/* Matrix Header */}
      <div className="flex items-center justify-between px-4 py-3 glass-panel border-b border-border/40">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-lg font-semibold neon-text">Terminal Matrix</h2>
          <span className="text-xs text-muted-foreground">
            {activeTerminals.length}/6 Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
            <button
              onClick={() => setLayout('2x3')}
              className={`p-1.5 rounded transition-colors ${layout === '2x3' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout('1x1')}
              className={`p-1.5 rounded transition-colors ${layout === '1x1' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAddTerminal}
            disabled={activeTerminals.length >= 6}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-medium">New</span>
          </button>
        </div>
      </div>

      {/* Terminal Grid */}
      <div className={`flex-1 grid ${gridClass[layout]} gap-2 p-2 overflow-hidden`}>
        {layout === '1x1' ? (
          activeTerminals[0] && (
            <TerminalPane
              key={activeTerminals[0].id}
              id={activeTerminals[0].id}
              title={activeTerminals[0].title}
              onClose={() => handleCloseTerminal(activeTerminals[0].id)}
            />
          )
        ) : (
          activeTerminals.slice(0, 6).map((terminal, index) => (
            <motion.div
              key={terminal.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="min-h-0"
            >
              <TerminalPane
                id={terminal.id}
                title={terminal.title}
                onClose={() => handleCloseTerminal(terminal.id)}
              />
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}