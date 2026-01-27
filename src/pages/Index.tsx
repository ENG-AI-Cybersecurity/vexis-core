import { useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ResizableTerminalMatrix } from '@/components/terminal/ResizableTerminalMatrix';
import { LabManager } from '@/components/labs/LabManager';
import { DarkWebMonitor } from '@/components/robin/DarkWebMonitor';
import { SystemSecurity } from '@/components/security/SystemSecurity';
import { SecretForum } from '@/components/forum/SecretForum';
import { CryptoStore } from '@/components/crypto/CryptoStore';
import { CommandPalette } from '@/components/command/CommandPalette';
import { DevModeOverlay } from '@/components/debug/DevModeOverlay';
import { LabWizard } from '@/components/labs/LabWizard';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { PerformanceAnalytics } from '@/components/analytics/PerformanceAnalytics';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { StealthTunneling } from '@/components/tunneling/StealthTunneling';
import { PayloadFactory } from '@/components/payload/PayloadFactory';
import { MissionsHub } from '@/components/missions/MissionsHub';
import { VendorForge } from '@/components/marketplace/VendorForge';
import { ScriptMarketplace } from '@/components/marketplace/ScriptMarketplace';
import { VexisWalletUI } from '@/components/marketplace/VexisWallet';
import { UserDashboard } from '@/components/dashboard/UserDashboard';
import { MemberDashboard } from '@/components/dashboard/MemberDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

type ViewType = 
  | 'dashboard' 
  | 'labs' 
  | 'robin' 
  | 'security' 
  | 'forum' 
  | 'crypto' 
  | 'analytics' 
  | 'settings' 
  | 'tunneling' 
  | 'payload' 
  | 'missions' 
  | 'vendor-forge' 
  | 'script-market' 
  | 'wallet'
  | 'user-dashboard'
  | 'member-dashboard'
  | 'admin-dashboard';

const Index = () => {
  const [activeView, setActiveView] = useState<ViewType>('user-dashboard');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [devModeOpen, setDevModeOpen] = useState(false);
  const [labWizardOpen, setLabWizardOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

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
      case 'user-dashboard':
        return <UserDashboard />;
      case 'member-dashboard':
        return <MemberDashboard />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'dashboard':
        return <ResizableTerminalMatrix />;
      case 'labs':
        return <LabManager onCreateLab={() => setLabWizardOpen(true)} />;
      case 'robin':
        return <DarkWebMonitor />;
      case 'security':
        return <SystemSecurity />;
      case 'forum':
        return <SecretForum />;
      case 'crypto':
        return <CryptoStore />;
      case 'analytics':
        return <PerformanceAnalytics />;
      case 'settings':
        return <SettingsPanel />;
      case 'tunneling':
        return <StealthTunneling />;
      case 'payload':
        return <PayloadFactory />;
      case 'missions':
        return <MissionsHub />;
      case 'vendor-forge':
        return <VendorForge />;
      case 'script-market':
        return <ScriptMarketplace />;
      case 'wallet':
        return <VexisWalletUI />;
      default:
        return <UserDashboard />;
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Animated background grid */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div 
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--primary) / 0.4) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--primary) / 0.4) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <Sidebar 
          activeView={activeView} 
          onViewChange={(view) => setActiveView(view as ViewType)} 
          onOpenNotifications={() => setNotificationPanelOpen(true)}
        />

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
      <NotificationPanel
        isOpen={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
      />
    </>
  );
};

export default Index;
