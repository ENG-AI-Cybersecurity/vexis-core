import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Grid3X3, Maximize, LayoutGrid } from 'lucide-react';
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from '@/components/ui/resizable';
import { TerminalPane } from './TerminalPane';
import { cn } from '@/lib/utils';

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

type LayoutType = '2x3' | '3x2' | '1x1' | 'custom';

export function ResizableTerminalMatrix() {
  const [terminals, setTerminals] = useState<TerminalConfig[]>(defaultTerminals);
  const [layout, setLayout] = useState<LayoutType>('2x3');
  const [focusedTerminal, setFocusedTerminal] = useState<number | null>(null);

  const activeTerminals = terminals.filter(t => t.active);

  const handleCloseTerminal = useCallback((id: number) => {
    setTerminals(prev => 
      prev.map(t => t.id === id ? { ...t, active: false } : t)
    );
  }, []);

  const handleAddTerminal = useCallback(() => {
    const inactiveTerminal = terminals.find(t => !t.active);
    if (inactiveTerminal) {
      setTerminals(prev =>
        prev.map(t => t.id === inactiveTerminal.id ? { ...t, active: true } : t)
      );
    }
  }, [terminals]);

  const handleTerminalFocus = useCallback((id: number) => {
    setFocusedTerminal(id);
  }, []);

  // Render terminals in a 2x3 grid using resizable panels
  const renderResizableGrid = () => {
    const visibleTerminals = activeTerminals.slice(0, 6);
    
    if (layout === '1x1' && visibleTerminals[0]) {
      return (
        <TerminalPane
          id={visibleTerminals[0].id}
          title={visibleTerminals[0].title}
          onClose={() => handleCloseTerminal(visibleTerminals[0].id)}
          onFocus={() => handleTerminalFocus(visibleTerminals[0].id)}
          isFocused={focusedTerminal === visibleTerminals[0].id}
        />
      );
    }

    // Create rows of terminals
    const row1 = visibleTerminals.slice(0, 3);
    const row2 = visibleTerminals.slice(3, 6);

    // Calculate proper panel sizes that sum to 100
    const row1Size = Math.floor(100 / row1.length);
    const row2Size = row2.length > 0 ? Math.floor(100 / row2.length) : 0;

    return (
      <ResizablePanelGroup direction="vertical" className="h-full">
        {/* Top Row */}
        <ResizablePanel defaultSize={50} minSize={20}>
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {row1.map((terminal, index) => (
              <>
                <ResizablePanel key={terminal.id} defaultSize={row1Size} minSize={15}>
                  <div className="h-full p-1">
                    <TerminalPane
                      id={terminal.id}
                      title={terminal.title}
                      onClose={() => handleCloseTerminal(terminal.id)}
                      onFocus={() => handleTerminalFocus(terminal.id)}
                      isFocused={focusedTerminal === terminal.id}
                    />
                  </div>
                </ResizablePanel>
                {index < row1.length - 1 && (
                  <ResizableHandle key={`handle-${terminal.id}`} withHandle className="bg-transparent hover:bg-primary/30 transition-colors" />
                )}
              </>
            ))}
          </ResizablePanelGroup>
        </ResizablePanel>
        
        {row2.length > 0 && (
          <>
            <ResizableHandle withHandle className="bg-transparent hover:bg-primary/30 transition-colors" />
            
            {/* Bottom Row */}
            <ResizablePanel defaultSize={50} minSize={20}>
              <ResizablePanelGroup direction="horizontal" className="h-full">
                {row2.map((terminal, index) => (
                  <>
                    <ResizablePanel key={terminal.id} defaultSize={row2Size} minSize={15}>
                      <div className="h-full p-1">
                        <TerminalPane
                          id={terminal.id}
                          title={terminal.title}
                          onClose={() => handleCloseTerminal(terminal.id)}
                          onFocus={() => handleTerminalFocus(terminal.id)}
                          isFocused={focusedTerminal === terminal.id}
                        />
                      </div>
                    </ResizablePanel>
                    {index < row2.length - 1 && (
                      <ResizableHandle key={`handle-${terminal.id}`} withHandle className="bg-transparent hover:bg-primary/30 transition-colors" />
                    )}
                  </>
                ))}
              </ResizablePanelGroup>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    );
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
          <div className="h-4 w-px bg-border" />
          <span className="text-xs text-muted-foreground">
            Resizable Panels • IPC Pipe Connected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
            <button
              onClick={() => setLayout('2x3')}
              className={cn(
                'p-1.5 rounded transition-colors',
                layout === '2x3' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
              title="2x3 Grid"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout('custom')}
              className={cn(
                'p-1.5 rounded transition-colors',
                layout === 'custom' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
              title="Custom Layout"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout('1x1')}
              className={cn(
                'p-1.5 rounded transition-colors',
                layout === '1x1' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
              title="Single Terminal"
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
      <div className="flex-1 p-2 overflow-hidden">
        {renderResizableGrid()}
      </div>
    </motion.div>
  );
}