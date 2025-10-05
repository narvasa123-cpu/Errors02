import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Settings,
  Play,
  Pause,
  RotateCcw,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VoiceControl = ({ onLocationSelect, onCropSelect, onAnalyze, currentPage, results }) => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 0.8,
    pitch: 1,
    volume: 0.8,
    voice: null,
    autoSpeak: true
  });

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Text-to-speech function
  const speak = (text) => {
    console.log('Speak called with text:', text);
    console.log('synthRef.current:', !!synthRef.current);
    console.log('voiceSettings.autoSpeak:', voiceSettings.autoSpeak);
    
    if (!synthRef.current || !voiceSettings.autoSpeak) {
      console.log('Speech synthesis not available or autoSpeak disabled');
      return;
    }

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;
    utterance.voice = voiceSettings.voice;

    utterance.onstart = () => {
      console.log('Speech started');
      setIsSpeaking(true);
    };
    utterance.onend = () => {
      console.log('Speech ended');
      setIsSpeaking(false);
    };
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    console.log('Starting speech synthesis');
    synthRef.current.speak(utterance);
  };

  // Read weather summary function
  const readSummary = () => {
    console.log('=== readSummary called ===');
    console.log('Results object:', results);
    console.log('Results type:', typeof results);
    console.log('Results keys:', results ? Object.keys(results) : 'No results');
    
    if (!results) {
      console.log('No results object available');
      speak('No weather analysis results available. Please analyze weather data first.');
      return;
    }
    
    if (!results.summary) {
      console.log('No summary in results. Available keys:', Object.keys(results));
      speak('No weather summary found in results. Please analyze weather data first.');
      return;
    }

    console.log('Summary found:', results.summary);
    console.log('Summary type:', typeof results.summary);
    console.log('Summary length:', results.summary.length);

    // Create a comprehensive summary to read
    const location = results.location ? 
      `For location ${results.location.lat.toFixed(2)}, ${results.location.lon.toFixed(2)}` : 
      'For the selected location';
    
    const date = results.date ? 
      ` on ${new Date(results.date).toLocaleDateString()}` : 
      '';

    const fullSummary = `${location}${date}. Weather summary: ${results.summary}`;
    
    console.log('=== About to speak summary ===');
    console.log('Full summary text:', fullSummary);
    console.log('Full summary length:', fullSummary.length);
    
    speak(fullSummary);
  };

  // Voice commands database
  const voiceCommands = {
    navigation: {
      'go home': () => navigate('/'),
      'open dashboard': () => navigate('/dashboard'),
      'weather dashboard': () => navigate('/dashboard'),
      'farm weather': () => navigate('/farm-weather'),
      'farming assistant': () => navigate('/farm-weather'),
      'event planner': () => navigate('/event-planner'),
      'plan event': () => navigate('/event-planner'),
      'storm tracker': () => navigate('/storm-tracker'),
      'track storms': () => navigate('/storm-tracker')
    },
    locations: {
      'manila': () => onLocationSelect && onLocationSelect({ name: 'Manila', lat: 14.5995, lon: 120.9842 }),
      'cebu': () => onLocationSelect && onLocationSelect({ name: 'Cebu City', lat: 10.3157, lon: 123.8854 }),
      'davao': () => onLocationSelect && onLocationSelect({ name: 'Davao City', lat: 7.1907, lon: 125.4553 }),
      'valencia': () => onLocationSelect && onLocationSelect({ name: 'Valencia City', lat: 7.9064, lon: 125.0945 }),
      'bukidnon': () => onLocationSelect && onLocationSelect({ name: 'Bukidnon', lat: 8.1390, lon: 125.1277 }),
      'nueva ecija': () => onLocationSelect && onLocationSelect({ name: 'Nueva Ecija', lat: 15.5784, lon: 121.1113 }),
      'baguio': () => onLocationSelect && onLocationSelect({ name: 'Baguio City', lat: 16.4023, lon: 120.5960 })
    },
    crops: {
      'rice': () => onCropSelect && onCropSelect('rice'),
      'palay': () => onCropSelect && onCropSelect('rice'),
      'corn': () => onCropSelect && onCropSelect('corn'),
      'mais': () => onCropSelect && onCropSelect('corn'),
      'sugarcane': () => onCropSelect && onCropSelect('sugarcane'),
      'coconut': () => onCropSelect && onCropSelect('coconut'),
      'banana': () => onCropSelect && onCropSelect('banana'),
      'saging': () => onCropSelect && onCropSelect('banana'),
      'vegetables': () => onCropSelect && onCropSelect('vegetables'),
      'gulay': () => onCropSelect && onCropSelect('vegetables')
    },
    actions: {
      'analyze weather': () => onAnalyze && onAnalyze(),
      'get weather': () => onAnalyze && onAnalyze(),
      'check weather': () => onAnalyze && onAnalyze(),
      'analyze farm': () => onAnalyze && onAnalyze(),
      'read summary': () => readSummary(),
      'read the summary': () => readSummary(),
      'summary': () => readSummary(),
      'read results': () => readSummary(),
      'help': () => setShowHelp(true),
      'show help': () => setShowHelp(true),
      'voice help': () => setShowHelp(true),
      'close help': () => setShowHelp(false),
      'hide help': () => setShowHelp(false)
    }
  };

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Check for Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;

    if (SpeechRecognition && speechSynthesis) {
      setIsSupported(true);
      
      // Initialize speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        speak('Voice control activated. I am listening for your commands.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            setConfidence(confidence);
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          processVoiceCommand(finalTranscript.toLowerCase().trim());
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        speak('Sorry, I had trouble understanding. Please try again.');
      };

      recognitionRef.current = recognition;
      synthRef.current = speechSynthesis;

      // Load available voices
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
        setVoiceSettings(prev => ({ ...prev, voice: englishVoice || voices[0] }));
      };

      speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Process voice commands
  const processVoiceCommand = (command) => {
    console.log('Processing voice command:', command);
    let commandExecuted = false;

    // Check all command categories
    Object.values(voiceCommands).forEach(category => {
      Object.entries(category).forEach(([phrase, action]) => {
        if (command.includes(phrase)) {
          console.log('Command matched:', phrase);
          
          // Special handling for summary commands to avoid double speech
          if (phrase.includes('summary') || phrase.includes('results')) {
            console.log('Summary command detected, calling action without confirmation');
            action();
            commandExecuted = true;
          } else {
            action();
            commandExecuted = true;
            speak(`Executing: ${phrase}`);
          }
        }
      });
    });

    if (!commandExecuted) {
      console.log('Command not recognized:', command);
      speak('Command not recognized. Say "help" to hear available commands.');
    }
  };

  // Toggle voice recognition
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      speak('Voice control deactivated.');
    } else {
      recognitionRef.current.start();
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Get help content based on current page
  const getContextualHelp = () => {
    const baseCommands = [
      'Navigation: "go home", "weather dashboard", "farm weather", "event planner", "storm tracker"',
      'Locations: "manila", "cebu", "davao", "valencia", "bukidnon"',
      'Actions: "analyze weather", "read summary", "help", "close help"'
    ];

    if (currentPage === 'farm-weather') {
      return [
        ...baseCommands,
        'Farm Commands: "rice", "corn", "sugarcane", "coconut", "banana", "vegetables"',
        'Analysis: "analyze farm", "check weather", "read summary"'
      ];
    }

    return baseCommands;
  };

  if (!isSupported) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border border-red-300 rounded-lg p-4 max-w-sm">
        <div className="flex items-center space-x-2 text-red-700">
          <MicOff className="h-5 w-5" />
          <span className="text-sm">Voice control not supported in this browser</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Voice Control Panel - Responsive */}
      <div className="fixed bottom-2 sm:bottom-4 right-2 sm:right-4 bg-white rounded-lg shadow-2xl border border-gray-200 p-3 sm:p-4 w-[calc(100vw-1rem)] sm:w-80 max-w-sm z-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Voice Control</h3>
          <button
            onClick={() => setShowHelp(true)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>

        {/* Status Display */}
        <div className="mb-3 sm:mb-4">
          <div className={`flex items-center space-x-2 mb-2 ${isListening ? 'text-green-600' : 'text-gray-500'}`}>
            {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            <span className="text-xs sm:text-sm font-medium">
              {isListening ? 'Listening...' : 'Voice control inactive'}
            </span>
          </div>

          {transcript && (
            <div className="bg-gray-50 rounded p-2 text-xs sm:text-sm">
              <div className="text-gray-600 break-words">Heard: "{transcript}"</div>
              {confidence > 0 && (
                <div className="text-xs text-gray-400 mt-1">
                  Confidence: {Math.round(confidence * 100)}%
                </div>
              )}
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={toggleListening}
            className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 py-2 px-2 sm:px-3 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
              isListening 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            <span className="hidden sm:inline">{isListening ? 'Stop' : 'Start'}</span>
          </button>

          <button
            onClick={isSpeaking ? stopSpeaking : () => speak('Voice control is ready. Say help for commands.')}
            className="flex items-center justify-center p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
            title={isSpeaking ? 'Stop speaking' : 'Test voice'}
          >
            {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Quick voice commands:</div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1">
            {['help', 'farm weather', 'manila', 'analyze weather', 'read summary'].map((cmd) => (
              <button
                key={cmd}
                onClick={() => processVoiceCommand(cmd)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors truncate"
                title={`Say: "${cmd}"`}
              >
                "{cmd.length > 8 ? cmd.substring(0, 8) + '...' : cmd}"
              </button>
            ))}
          </div>
          
          {/* Debug button - remove after testing */}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => readSummary()}
              className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded transition-colors"
            >
              🐛 Test Summary
            </button>
            <div className="text-xs text-gray-400 mt-1 break-words">
              Results: {results ? 'Available' : 'None'} | 
              Summary: {results?.summary ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      </div>

      {/* Help Modal - Responsive */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] sm:max-h-96 overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Voice Commands Help</h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">How to Use Voice Control</h3>
                  <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-gray-600">
                    <li>Click the "Start" button to activate voice recognition</li>
                    <li>Speak clearly and wait for the system to process your command</li>
                    <li>Commands are case-insensitive and support natural language</li>
                    <li>Say "help" anytime to open this guide</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Available Commands</h3>
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    {getContextualHelp().map((category, index) => (
                      <div key={index} className="bg-gray-50 rounded p-2 sm:p-3">
                        <code className="text-gray-700 break-words">{category}</code>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Accessibility Features</h3>
                  <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-gray-600">
                    <li>Hands-free navigation throughout the app</li>
                    <li>Audio feedback for all actions</li>
                    <li>Voice-controlled weather analysis</li>
                    <li>Support for Philippine locations and crops</li>
                    <li>Keyboard shortcuts: Space to toggle listening, Esc to stop</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => speak(getContextualHelp().join('. '))}
                  className="btn-secondary inline-flex items-center justify-center space-x-2 text-sm"
                >
                  <Volume2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Read Commands Aloud</span>
                  <span className="sm:hidden">Read Aloud</span>
                </button>
                <button
                  onClick={() => setShowHelp(false)}
                  className="btn-primary text-sm"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceControl;
