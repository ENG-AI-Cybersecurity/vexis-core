import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Monitor, Bell, Volume2, Palette, Check } from 'lucide-react';
import { getSettings, saveSettings, type UserSettings, type ThemeType } from '@/lib/db';
import { Switch } from '@/components/ui/switch';
import toast from 'react-hot-toast';

interface ThemeOption {
  id: ThemeType;
  name: string;
  description: string;
  colors: { primary: string; secondary: string; accent: string };
}

const themes: ThemeOption[] = [
  {
    id: 'neon-night',
    name: 'Neon Night',
    description: 'Classic cyberpunk with neon green accents',
    colors: { primary: '#00ff41', secondary: '#9d4edd', accent: '#00d9ff' },
  },
  {
    id: 'classic-hacker',
    name: 'Classic Hacker',
    description: 'Retro terminal green on black',
    colors: { primary: '#00ff00', secondary: '#00aa00', accent: '#33ff33' },
  },
  {
    id: 'monochrome-stealth',
    name: 'Monochrome Stealth',
    description: 'Low-profile grayscale theme',
    colors: { primary: '#888888', secondary: '#555555', accent: '#aaaaaa' },
  },
];

export function SettingsPanel() {
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'neon-night',
    scanlinesEnabled: true,
    notificationsEnabled: true,
    soundEnabled: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getSettings().then((s) => {
      if (mounted) {
        setSettings(s);
        setLoading(false);
        applyTheme(s.theme);
        applyScanlines(s.scanlinesEnabled);
      }
    });
    return () => { mounted = false; };
  }, []);

  const applyTheme = (theme: ThemeType) => {
    const root = document.documentElement;
    
    switch (theme) {
      case 'neon-night':
        root.style.setProperty('--primary', '120 100% 50%');
        root.style.setProperty('--secondary', '280 80% 60%');
        root.style.setProperty('--accent', '190 100% 50%');
        root.style.setProperty('--neon-green', '120 100% 50%');
        root.style.setProperty('--neon-purple', '280 80% 60%');
        break;
      case 'classic-hacker':
        root.style.setProperty('--primary', '120 100% 50%');
        root.style.setProperty('--secondary', '120 100% 33%');
        root.style.setProperty('--accent', '120 100% 60%');
        root.style.setProperty('--neon-green', '120 100% 50%');
        root.style.setProperty('--neon-purple', '120 60% 40%');
        break;
      case 'monochrome-stealth':
        root.style.setProperty('--primary', '0 0% 53%');
        root.style.setProperty('--secondary', '0 0% 33%');
        root.style.setProperty('--accent', '0 0% 67%');
        root.style.setProperty('--neon-green', '0 0% 53%');
        root.style.setProperty('--neon-purple', '0 0% 40%');
        break;
    }
  };

  const applyScanlines = (enabled: boolean) => {
    const terminals = document.querySelectorAll('.terminal-window');
    terminals.forEach((el) => {
      if (enabled) {
        el.classList.add('crt-scanlines');
      } else {
        el.classList.remove('crt-scanlines');
      }
    });
    // Store in body data attribute for new terminals
    document.body.dataset.scanlines = enabled ? 'true' : 'false';
  };

  const handleSettingChange = async <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);

    if (key === 'theme') {
      applyTheme(value as ThemeType);
      toast.success(`Theme changed to ${themes.find(t => t.id === value)?.name}`);
    } else if (key === 'scanlinesEnabled') {
      applyScanlines(value as boolean);
      toast.success(`CRT scanlines ${value ? 'enabled' : 'disabled'}`);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full p-6 overflow-auto"
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-lg bg-primary/20 neon-border">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold neon-text">Settings</h2>
            <p className="text-sm text-muted-foreground">Configure your Vexis experience</p>
          </div>
        </div>

        {/* Theme Selection */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Theme</h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleSettingChange('theme', theme.id)}
                className={`relative flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  settings.theme === theme.id
                    ? 'glass-panel neon-border'
                    : 'border-border/40 hover:border-border'
                }`}
              >
                <div className="flex gap-1">
                  {Object.values(theme.colors).map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-foreground">{theme.name}</div>
                  <div className="text-xs text-muted-foreground">{theme.description}</div>
                </div>
                {settings.theme === theme.id && (
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Display Settings */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Display</h3>
          </div>
          <div className="glass-panel rounded-lg divide-y divide-border/40">
            <div className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium text-foreground">CRT Scanlines</div>
                <div className="text-xs text-muted-foreground">
                  Add retro CRT scanline effect to terminals
                </div>
              </div>
              <Switch
                checked={settings.scanlinesEnabled}
                onCheckedChange={(checked) => handleSettingChange('scanlinesEnabled', checked)}
              />
            </div>
          </div>
        </section>

        {/* Notification Settings */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Notifications</h3>
          </div>
          <div className="glass-panel rounded-lg divide-y divide-border/40">
            <div className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium text-foreground">Enable Notifications</div>
                <div className="text-xs text-muted-foreground">
                  Show alerts for system events and security warnings
                </div>
              </div>
              <Switch
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) => handleSettingChange('notificationsEnabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium text-foreground">Sound Effects</div>
                <div className="text-xs text-muted-foreground">
                  Play audio for critical alerts
                </div>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
              />
            </div>
          </div>
        </section>

        {/* System Info */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Volume2 className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">System</h3>
          </div>
          <div className="glass-panel rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Version</span>
              <span className="text-foreground font-mono">v2.4.1</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Kernel</span>
              <span className="text-foreground font-mono">WSL2 5.15.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IPC Auth</span>
              <span className="text-success font-mono">HMAC-SHA256</span>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}