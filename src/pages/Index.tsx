import { useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { TerminalMatrix } from '@/components/terminal/TerminalMatrix';
import { LabManager } from '@/components/labs/LabManager';
import { DarkWebMonitor } from '@/components/robin/DarkWebMonitor';
import { Marketplace } from '@/components/marketplace/Marketplace';
import { SystemSecurity } from '@/components/security/SystemSecurity';
import { SecretForum } from '@/components/forum/SecretForum';
import { CryptoStore } from '@/components/crypto/CryptoStore';
import { CommandPalette } from '@/components/command/CommandPalette';
import { DevModeOverlay } from '@/components/debug/DevModeOverlay';
import { LabWizard } from '@/components/labs/LabWizard';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

type ViewType = 'dashboard' | 'labs' | 'robin' | 'marketplace' | 'security' | 'forum' | 'crypto';

const Index = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [devModeOpen, setDevModeOpen] = useState(false);
  const [labWizardOpen, setLabWizardOpen] = useState(false);

  const handleViewChange = useCallback((view: ViewType) => {
    setActiveView(view);
  }, []);

  const handleCommandPalette = useCallback(() => {
    setCommandPaletteOpen(prev => !prev);
  }, []);

  const handleDevMode = useCallback(() => {
    setDevModeOpen(prev => !prev);
  }, []);

  useKeyboardShortcuts({
    onViewChange: handleViewChange,
    onCommandPalette: handleCommandPalette,
    onDevMode: handleDevMode,
  });

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <TerminalMatrix />;
      case 'labs':
        return <LabManager onCreateLab={() => setLabWizardOpen(true)} />;
      case 'robin':
        return <DarkWebMonitor />;
      case 'marketplace':
        return <Marketplace />;
      case 'security':
        return <SystemSecurity />;
      case 'forum':
        return <SecretForum />;
      case 'crypto':
        return <CryptoStore />;
      default:
        return <TerminalMatrix />;
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Animated background grid */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--neon-green) / 0.3) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--neon-green) / 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent scan-line" />
          </div>
        </div>

        <Sidebar activeView={activeView} onViewChange={(view) => setActiveView(view as ViewType)} />

        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <Header />
          <main className="flex-1 overflow-hidden">
            {renderView()}
          </main>
        </div>
      </div>

      {/* Overlays */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleViewChange}
        onToggleDevMode={handleDevMode}
      />
      <DevModeOverlay isOpen={devModeOpen} onClose={() => setDevModeOpen(false)} />
      <LabWizard
        isOpen={labWizardOpen}
        onClose={() => setLabWizardOpen(false)}
        onLabCreated={() => {}}
      />
    </>
  );
};

export default Index;
