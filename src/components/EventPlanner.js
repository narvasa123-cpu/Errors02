import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Umbrella,
  Sun,
  Wind,
  Thermometer,
  Activity,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import weatherService from '../services/weatherApiService';
import { weatherCalculations } from '../utils/weatherCalculations';
import { searchLocationsAPI, getLocationCoordinates } from '../services/locationService';
import VoiceControl from './VoiceControl';

const EventPlanner = () => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    name: '',
    type: 'outdoor-festival',
    location: '',
    coordinates: { lat: null, lon: null },
    startDate: '',
    endDate: '',
    duration: 1,
    attendees: 100,
    timeOfDay: 'all-day'
  });

  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const eventTypes = [
    { id: 'outdoor-festival', name: 'Outdoor Festival', icon: Activity, risks: ['rain', 'wind', 'heat'] },
    { id: 'parade', name: 'Parade', icon: Users, risks: ['rain', 'wind'] },
    { id: 'hiking', name: 'Hiking Trip', icon: TrendingUp, risks: ['rain', 'cold', 'wind', 'heat'] },
    { id: 'fishing', name: 'Fishing Trip', icon: Activity, risks: ['rain', 'wind'] },
    { id: 'wedding', name: 'Outdoor Wedding', icon: Sun, risks: ['rain', 'wind', 'heat'] },
    { id: 'sports', name: 'Sports Event', icon: Activity, risks: ['rain', 'wind', 'heat', 'cold'] },
    { id: 'concert', name: 'Outdoor Concert', icon: Activity, risks: ['rain', 'wind'] },
    { id: 'market', name: 'Farmers Market', icon: Activity, risks: ['rain', 'wind', 'heat'] }
  ];

  // Location database (same as Dashboard)
  const locationDatabase = [
    { name: 'Manila', country: 'Philippines', lat: 14.5995, lon: 120.9842, type: 'city' },
    { name: 'Cebu City', country: 'Philippines', lat: 10.3157, lon: 123.8854, type: 'city' },
    { name: 'Valencia City', country: 'Philippines', lat: 7.9064, lon: 125.0945, type: 'city' },
    { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060, type: 'city' },
    { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278, type: 'city' },
    { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, type: 'city' },
    { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, type: 'city' },
    { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, type: 'city' }
  ];

  // Search function
  const searchLocation = (query) => {
    if (!query.trim()) return [];
    const searchTerm = query.toLowerCase();
    return locationDatabase.filter(location => 
      location.name.toLowerCase().includes(searchTerm) ||
      location.country.toLowerCase().includes(searchTerm)
    ).slice(0, 5);
  };

  const handleLocationInputChange = async (value) => {
    setEventData({...eventData, location: value});
    
    if (value.trim().length > 2) {
      try {
        // First try API search for better results
        const apiResults = await searchLocationsAPI(value, 5);
        if (apiResults && apiResults.length > 0) {
          setSuggestions(apiResults);
          setShowSuggestions(true);
          return;
        }
      } catch (error) {
        console.warn('API location search failed, using local database:', error);
      }
      
      // Fallback to local database
      const localResults = searchLocation(value);
      setSuggestions(localResults || []);
      setShowSuggestions(localResults && localResults.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setEventData({
      ...eventData, 
      location: suggestion.name,
      coordinates: { lat: suggestion.lat, lon: suggestion.lon }
    });
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Voice control handlers
  const handleVoiceLocationSelect = (location) => {
    setEventData({
      ...eventData,
      location: location.name,
      coordinates: { lat: location.lat, lon: location.lon }
    });
  };

  const handleVoiceAnalyze = () => {
    handleEventAnalysis();
  };

  const handleEventAnalysis = async () => {
    if (!eventData.location || !eventData.startDate || !eventData.coordinates.lat) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const results = [];
      const startDate = new Date(eventData.startDate);
      
      console.log('🎪 Starting event analysis for:', eventData);
      
      // Analyze each day of the event
      for (let i = 0; i < eventData.duration; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        console.log(`📅 Analyzing day ${i + 1}: ${dateStr}`);
        
        try {
          // Fetch weather data with error handling
          const weatherData = await weatherService.getWeatherAnalysis(
            eventData.coordinates.lat, 
            eventData.coordinates.lon, 
            dateStr
          );
          
          console.log('🌤️ Weather data received:', weatherData);
          
          // Calculate probabilities with fallback
          let probabilities;
          try {
            probabilities = weatherCalculations.calculateProbabilities(weatherData, dateStr);
            console.log('📊 Probabilities calculated:', probabilities);
          } catch (probError) {
            console.warn('⚠️ Probability calculation failed, using location-based estimates:', probError);
            probabilities = weatherCalculations.getLocationBasedProbabilities(
              eventData.coordinates.lat, 
              eventData.coordinates.lon
            );
          }
          
          // Ensure probabilities are valid
          if (!probabilities || Object.values(probabilities).every(val => val === 0)) {
            console.log('🔄 Using default probabilities for event planning');
            probabilities = {
              hot: 20,
              cold: 15,
              wet: 30,
              windy: 25,
              uncomfortable: 22
            };
          }
          
          results.push({
            date: dateStr,
            dayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
            probabilities,
            weatherData,
            riskLevel: calculateEventRisk(probabilities, eventData.type)
          });
          
        } catch (dayError) {
          console.error(`❌ Failed to analyze day ${dateStr}:`, dayError);
          
          // Add fallback data for this day
          const fallbackProbabilities = {
            hot: 20,
            cold: 15,
            wet: 30,
            windy: 25,
            uncomfortable: 22
          };
          
          results.push({
            date: dateStr,
            dayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
            probabilities: fallbackProbabilities,
            weatherData: { fallback: true, error: dayError.message },
            riskLevel: calculateEventRisk(fallbackProbabilities, eventData.type)
          });
        }
      }

      console.log('✅ Event analysis completed:', results);
      setAnalysis(results);
      
      // Generate recommendations
      const recs = generateRecommendations(results);
      setRecommendations(recs);
      
    } catch (err) {
      console.error('❌ Event analysis error:', err);
      setError(`Failed to analyze weather data: ${err.message || 'Unknown error'}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEventRisk = (probabilities, eventType) => {
    const eventTypeData = eventTypes.find(type => type.id === eventType);
    if (!eventTypeData) return 'low';

    let riskScore = 0;
    const risks = eventTypeData.risks;

    if (risks.includes('rain') && probabilities.wet > 30) riskScore += probabilities.wet;
    if (risks.includes('wind') && probabilities.windy > 40) riskScore += probabilities.windy;
    if (risks.includes('heat') && probabilities.hot > 50) riskScore += probabilities.hot;
    if (risks.includes('cold') && probabilities.cold > 30) riskScore += probabilities.cold;

    if (riskScore > 150) return 'high';
    if (riskScore > 80) return 'medium';
    return 'low';
  };

  const generateRecommendations = (analysisResults) => {
    if (!analysisResults || !Array.isArray(analysisResults)) {
      return [];
    }
    
    const recs = [];
    const highRiskDays = analysisResults.filter(day => day && day.riskLevel === 'high');
    const mediumRiskDays = analysisResults.filter(day => day && day.riskLevel === 'medium');

    if (highRiskDays.length > 0) {
      recs.push({
        type: 'warning',
        title: 'High Risk Days Detected',
        message: `${highRiskDays.length} day(s) have high weather risk. Consider rescheduling or indoor alternatives.`,
        days: highRiskDays.map(d => d.dayName)
      });
    }

    if (mediumRiskDays.length > 0) {
      recs.push({
        type: 'caution',
        title: 'Weather Precautions Needed',
        message: `${mediumRiskDays.length} day(s) require weather preparations.`,
        suggestions: generateEventSuggestions(mediumRiskDays, eventData.type)
      });
    }

    // Best day recommendation
    const bestDay = analysisResults.reduce((best, current) => 
      current && current.riskLevel === 'low' && current.probabilities && 
      (!best || (current.probabilities.wet < (best.probabilities?.wet || 100)))
        ? current : best
    , null);

    if (bestDay) {
      recs.push({
        type: 'success',
        title: 'Optimal Day Identified',
        message: `${bestDay.dayName} shows the most favorable conditions for your event.`,
        bestDay: bestDay
      });
    }

    setRecommendations(recs);
  };

  const generateEventSuggestions = (riskDays, eventType) => {
    const suggestions = [];
    
    riskDays.forEach(day => {
      if (day.probabilities.wet > 40) {
        suggestions.push('Provide covered areas or tents');
        suggestions.push('Have rain contingency plan ready');
      }
      if (day.probabilities.windy > 50) {
        suggestions.push('Secure all decorations and equipment');
        suggestions.push('Consider wind-resistant setup');
      }
      if (day.probabilities.hot > 60) {
        suggestions.push('Provide shade and hydration stations');
        suggestions.push('Schedule during cooler hours');
      }
    });

    return [...new Set(suggestions)]; // Remove duplicates
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return XCircle;
      case 'medium': return AlertTriangle;
      case 'low': return CheckCircle;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-14">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              <span className="hidden sm:inline">Event Planning Assistant</span>
              <span className="sm:hidden">Event Planner</span>
            </h1>
            <p className="text-sm text-gray-600 hidden md:block">Weather probability analysis for outdoor events</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="mb-6 sm:mb-8">
          <p className="text-sm sm:text-base text-gray-600">Plan your outdoor events with confidence using weather probability analysis</p>
        </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Event Details Form */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Event Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
              <input
                type="text"
                value={eventData.name}
                onChange={(e) => setEventData({...eventData, name: e.target.value})}
                placeholder="e.g., Summer Music Festival"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
              <select
                value={eventData.type}
                onChange={(e) => setEventData({...eventData, type: e.target.value})}
                className="input-field"
              >
                {eventTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <div className="relative">
                <input
                  type="text"
                  value={eventData.location}
                  onChange={(e) => handleLocationInputChange(e.target.value)}
                  onFocus={() => {
                    if (suggestions && suggestions.length > 0) setShowSuggestions(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 150);
                  }}
                  placeholder="Search for a city..."
                  className="input-field"
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-primary-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                      >
                        <MapPin className="h-4 w-4 text-primary-600" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{suggestion.name}</div>
                          <div className="text-sm text-gray-500">{suggestion.country}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={eventData.startDate}
                  onChange={(e) => setEventData({...eventData, startDate: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={eventData.duration}
                  onChange={(e) => setEventData({...eventData, duration: parseInt(e.target.value)})}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Attendees</label>
                <input
                  type="number"
                  value={eventData.attendees}
                  onChange={(e) => setEventData({...eventData, attendees: parseInt(e.target.value)})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time of Day</label>
                <select
                  value={eventData.timeOfDay}
                  onChange={(e) => setEventData({...eventData, timeOfDay: e.target.value})}
                  className="input-field"
                >
                  <option value="all-day">All Day</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleEventAnalysis}
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Event Weather Risk'}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Results */}
        <div className="space-y-6">
          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    rec.type === 'warning' ? 'bg-red-50 border-red-200' :
                    rec.type === 'caution' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-green-50 border-green-200'
                  }`}>
                    <h4 className={`font-medium mb-2 ${
                      rec.type === 'warning' ? 'text-red-800' :
                      rec.type === 'caution' ? 'text-yellow-800' :
                      'text-green-800'
                    }`}>{rec.title}</h4>
                    <p className={`text-sm ${
                      rec.type === 'warning' ? 'text-red-700' :
                      rec.type === 'caution' ? 'text-yellow-700' :
                      'text-green-700'
                    }`}>{rec.message}</p>
                    {rec.suggestions && (
                      <ul className="mt-2 text-sm space-y-1">
                        {rec.suggestions.map((suggestion, i) => (
                          <li key={i} className="flex items-center space-x-2">
                            <ArrowRight className="h-3 w-3" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Analysis */}
          {analysis && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Weather Analysis</h3>
              <div className="space-y-4">
                {analysis.map((day, index) => {
                  const RiskIcon = getRiskIcon(day.riskLevel);
                  return (
                    <div key={index} className={`p-4 rounded-lg border ${getRiskColor(day.riskLevel)}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{day.dayName}</h4>
                          <p className="text-sm opacity-75">{new Date(day.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RiskIcon className="h-5 w-5" />
                          <span className="text-sm font-medium capitalize">{day.riskLevel} Risk</span>
                        </div>
                      </div>
                      
                      {day.probabilities && (
                        <div className="grid grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <Umbrella className="h-4 w-4" />
                            <span>Rain: {day.probabilities.wet || 0}%</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Wind className="h-4 w-4" />
                            <span>Wind: {day.probabilities.windy || 0}%</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Thermometer className="h-4 w-4" />
                            <span>Hot: {day.probabilities.hot || 0}%</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Thermometer className="h-4 w-4" />
                            <span>Cold: {day.probabilities.cold || 0}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Voice Control */}
      <VoiceControl 
        onLocationSelect={handleVoiceLocationSelect}
        onAnalyze={handleVoiceAnalyze}
        currentPage="event-planner"
        results={analysis}
      />
    </div>
  );
};

export default EventPlanner;
