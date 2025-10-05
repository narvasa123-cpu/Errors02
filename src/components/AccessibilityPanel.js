import React, { useState, useEffect } from 'react';
import { 
  Accessibility, 
  Eye, 
  EyeOff, 
  Type, 
  Contrast, 
  Volume2,
  Keyboard,
  MousePointer,
  Settings,
  X
} from 'lucide-react';

const AccessibilityPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    voiceAnnouncements: true,
    fontSize: 16
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast mode
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (settings.largeText) {
      root.style.fontSize = `${settings.fontSize}px`;
      root.classList.add('large-text');
    } else {
      root.style.fontSize = '16px';
      root.classList.remove('large-text');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Save settings
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    const defaultSettings = {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true,
      voiceAnnouncements: true,
      fontSize: 16
    };
    setSettings(defaultSettings);
  };

  const announceChange = (message) => {
    if (settings.voiceAnnouncements && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.8;
      utterance.volume = 0.7;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      {/* Accessibility Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
        aria-label="Open accessibility settings"
        title="Accessibility Settings (Alt + A)"
      >
        <Accessibility className="h-6 w-6" />
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <Accessibility className="h-6 w-6" />
                  <span>Accessibility Settings</span>
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  aria-label="Close accessibility settings"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Visual Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Visual Settings</span>
                  </h3>
                  
                  <div className="space-y-4">
                    {/* High Contrast */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Contrast className="h-5 w-5 text-gray-600" />
                        <div>
                          <label className="font-medium text-gray-900">High Contrast Mode</label>
                          <p className="text-sm text-gray-600">Increases contrast for better visibility</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          updateSetting('highContrast', !settings.highContrast);
                          announceChange(`High contrast mode ${!settings.highContrast ? 'enabled' : 'disabled'}`);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.highContrast ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        aria-label={`Toggle high contrast mode. Currently ${settings.highContrast ? 'enabled' : 'disabled'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Large Text */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Type className="h-5 w-5 text-gray-600" />
                        <div>
                          <label className="font-medium text-gray-900">Large Text</label>
                          <p className="text-sm text-gray-600">Increases text size for better readability</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          updateSetting('largeText', !settings.largeText);
                          announceChange(`Large text mode ${!settings.largeText ? 'enabled' : 'disabled'}`);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.largeText ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        aria-label={`Toggle large text mode. Currently ${settings.largeText ? 'enabled' : 'disabled'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.largeText ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Font Size Slider */}
                    {settings.largeText && (
                      <div className="ml-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Font Size: {settings.fontSize}px
                        </label>
                        <input
                          type="range"
                          min="14"
                          max="24"
                          value={settings.fontSize}
                          onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          aria-label="Adjust font size"
                        />
                      </div>
                    )}

                    {/* Reduced Motion */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <MousePointer className="h-5 w-5 text-gray-600" />
                        <div>
                          <label className="font-medium text-gray-900">Reduced Motion</label>
                          <p className="text-sm text-gray-600">Minimizes animations and transitions</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          updateSetting('reducedMotion', !settings.reducedMotion);
                          announceChange(`Reduced motion ${!settings.reducedMotion ? 'enabled' : 'disabled'}`);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        aria-label={`Toggle reduced motion. Currently ${settings.reducedMotion ? 'enabled' : 'disabled'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Audio Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Volume2 className="h-5 w-5" />
                    <span>Audio Settings</span>
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Voice Announcements */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Volume2 className="h-5 w-5 text-gray-600" />
                        <div>
                          <label className="font-medium text-gray-900">Voice Announcements</label>
                          <p className="text-sm text-gray-600">Announces changes and actions</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          updateSetting('voiceAnnouncements', !settings.voiceAnnouncements);
                          if (!settings.voiceAnnouncements) {
                            announceChange('Voice announcements enabled');
                          }
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.voiceAnnouncements ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        aria-label={`Toggle voice announcements. Currently ${settings.voiceAnnouncements ? 'enabled' : 'disabled'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.voiceAnnouncements ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Navigation Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Keyboard className="h-5 w-5" />
                    <span>Navigation Settings</span>
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Keyboard Navigation */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Keyboard className="h-5 w-5 text-gray-600" />
                        <div>
                          <label className="font-medium text-gray-900">Enhanced Keyboard Navigation</label>
                          <p className="text-sm text-gray-600">Improved keyboard shortcuts and focus indicators</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          updateSetting('keyboardNavigation', !settings.keyboardNavigation);
                          announceChange(`Keyboard navigation ${!settings.keyboardNavigation ? 'enabled' : 'disabled'}`);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.keyboardNavigation ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        aria-label={`Toggle keyboard navigation. Currently ${settings.keyboardNavigation ? 'enabled' : 'disabled'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.keyboardNavigation ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Keyboard Shortcuts Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Keyboard Shortcuts</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li><kbd className="bg-blue-200 px-1 rounded">Ctrl + Space</kbd> - Toggle voice control</li>
                    <li><kbd className="bg-blue-200 px-1 rounded">Ctrl + H</kbd> - Show voice help</li>
                    <li><kbd className="bg-blue-200 px-1 rounded">Alt + A</kbd> - Open accessibility settings</li>
                    <li><kbd className="bg-blue-200 px-1 rounded">Escape</kbd> - Stop all voice activity</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => {
                    resetSettings();
                    announceChange('Accessibility settings reset to default');
                  }}
                  className="btn-secondary"
                >
                  Reset to Default
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    announceChange('Accessibility settings saved');
                  }}
                  className="btn-primary"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityPanel;
