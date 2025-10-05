import { useEffect } from 'react';

const useKeyboardAccessibility = (voiceControlRef) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Prevent default behavior for accessibility shortcuts
      if (event.ctrlKey || event.altKey) {
        switch (event.key) {
          case ' ': // Ctrl/Alt + Space: Toggle voice control
            event.preventDefault();
            if (voiceControlRef.current) {
              voiceControlRef.current.toggleListening();
            }
            break;
          case 'h': // Ctrl/Alt + H: Show help
            event.preventDefault();
            if (voiceControlRef.current) {
              voiceControlRef.current.showHelp();
            }
            break;
          case 's': // Ctrl/Alt + S: Stop speaking
            event.preventDefault();
            if (voiceControlRef.current) {
              voiceControlRef.current.stopSpeaking();
            }
            break;
          default:
            break;
        }
      }

      // Global accessibility shortcuts (no modifier needed)
      switch (event.key) {
        case 'Escape': // Escape: Stop voice control and speaking
          if (voiceControlRef.current) {
            voiceControlRef.current.stopAll();
          }
          break;
        default:
          break;
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [voiceControlRef]);

  // Announce keyboard shortcuts to screen readers
  useEffect(() => {
    const announceShortcuts = () => {
      const shortcuts = [
        'Keyboard shortcuts available:',
        'Ctrl + Space: Toggle voice control',
        'Ctrl + H: Show help',
        'Ctrl + S: Stop speaking',
        'Escape: Stop all voice activity'
      ].join('. ');

      // Create an invisible element for screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.style.position = 'absolute';
      announcement.style.left = '-10000px';
      announcement.style.width = '1px';
      announcement.style.height = '1px';
      announcement.style.overflow = 'hidden';
      
      document.body.appendChild(announcement);
      
      // Delay the announcement to ensure it's read
      setTimeout(() => {
        announcement.textContent = shortcuts;
        
        // Remove after announcement
        setTimeout(() => {
          if (document.body.contains(announcement)) {
            document.body.removeChild(announcement);
          }
        }, 3000);
      }, 1000);
    };

    // Only announce on first load
    const hasAnnounced = sessionStorage.getItem('keyboardShortcutsAnnounced');
    if (!hasAnnounced) {
      announceShortcuts();
      sessionStorage.setItem('keyboardShortcutsAnnounced', 'true');
    }
  }, []);
};

export default useKeyboardAccessibility;
