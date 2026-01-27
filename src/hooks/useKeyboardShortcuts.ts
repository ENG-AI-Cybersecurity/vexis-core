import { useEffect, useCallback } from 'react';

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

interface KeyboardShortcutsOptions {
  onViewChange: (view: ViewType) => void;
  onCommandPalette: () => void;
  onDevMode: () => void;
}

export function useKeyboardShortcuts({
  onViewChange,
  onCommandPalette,
  onDevMode,
}: KeyboardShortcutsOptions) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if typing in input/textarea
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return;
    }
    
    // Ctrl+1-9 for view switching
    if (event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
      const viewMap: Record<string, ViewType> = {
        '1': 'user-dashboard',
        '2': 'member-dashboard',
        '3': 'admin-dashboard',
        '4': 'dashboard',
        '5': 'labs',
        '6': 'robin',
        '7': 'security',
      };
      
      if (viewMap[event.key]) {
        event.preventDefault();
        onViewChange(viewMap[event.key]);
        return;
      }
    }
    
    // Cmd+K or Ctrl+K for command palette
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      onCommandPalette();
      return;
    }
    
    // Ctrl+Shift+D for developer mode
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      event.preventDefault();
      onDevMode();
      return;
    }
  }, [onViewChange, onCommandPalette, onDevMode]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
