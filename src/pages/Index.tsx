import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { TerminalMatrix } from '@/components/terminal/TerminalMatrix';
import { LabManager } from '@/components/labs/LabManager';
import { DarkWebMonitor } from '@/components/robin/DarkWebMonitor';
import { Marketplace } from '@/components/marketplace/Marketplace';
import { SystemSecurity } from '@/components/security/SystemSecurity';

type ViewType = 'dashboard' | 'labs' | 'robin' | 'marketplace' | 'security';

const Index = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <TerminalMatrix />;
      case 'labs':
        return <LabManager />;
      case 'robin':
        return <DarkWebMonitor />;
      case 'marketplace':
        return <Marketplace />;
      case 'security':
        return <SystemSecurity />;
      default:
        return <TerminalMatrix />;
    }
  };

  return (
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
        {/* Scan line effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent scan-line"
          />
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar activeView={activeView} onViewChange={(view) => setActiveView(view as ViewType)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Header />
        <main className="flex-1 overflow-hidden">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default Index;