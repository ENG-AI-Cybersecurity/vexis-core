import { useEffect, useCallback } from 'react';

type ViewType = 'dashboard' | 'labs' | 'robin' | 'marketplace' | 'security' | 'forum' | 'crypto';

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
    
    // Ctrl+1-7 for view switching
    if (event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
      const viewMap: Record<string, ViewType> = {
        '1': 'dashboard',
        '2': 'labs',
        '3': 'robin',
        '4': 'marketplace',
        '5': 'security',
        '6': 'forum',
        '7': 'crypto',
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
