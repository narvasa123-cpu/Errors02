import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  Calendar, 
  Download,
  Thermometer,
  Wind,
  Droplets,
  Sun,
  Snowflake,
  AlertTriangle,
  Wheat,
  Navigation,
  BarChart3
} from 'lucide-react';
import WeatherMap from './WeatherMap';
import VoiceControl from './VoiceControl';
import ResultsDisplay from './ResultsDisplay';
import { calculateWeatherProbabilities, weatherCalculations } from '../utils/weatherCalculations';
import { searchLocationsAPI, getLocationCoordinates, reverseGeocode } from '../services/locationService';
import weatherService from '../services/weatherApiService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: null, lon: null });
  const [selectedDate, setSelectedDate] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('search');

  // Initialize with current date and load search history
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    
    // Load search history from localStorage
    const savedHistory = localStorage.getItem('weatherSearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Comprehensive location database
  const locationDatabase = [
    // Major Cities
    { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060, type: 'city' },
    { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278, type: 'city' },
    { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, type: 'city' },
    { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, type: 'city' },
    { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, type: 'city' },
    { name: 'Los Angeles', country: 'United States', lat: 34.0522, lon: -118.2437, type: 'city' },
    { name: 'Chicago', country: 'United States', lat: 41.8781, lon: -87.6298, type: 'city' },
    { name: 'Miami', country: 'United States', lat: 25.7617, lon: -80.1918, type: 'city' },
    { name: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050, type: 'city' },
    { name: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964, type: 'city' },
    { name: 'Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038, type: 'city' },
    { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lon: 4.9041, type: 'city' },
    { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708, type: 'city' },
    { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, type: 'city' },
    { name: 'Hong Kong', country: 'China', lat: 22.3193, lon: 114.1694, type: 'city' },
    { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777, type: 'city' },
    { name: 'Delhi', country: 'India', lat: 28.7041, lon: 77.1025, type: 'city' },
    { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018, type: 'city' },
    { name: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.9780, type: 'city' },
    { name: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074, type: 'city' },
    { name: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737, type: 'city' },
    
    // Philippines - Major Cities
    { name: 'Manila', country: 'Philippines', lat: 14.5995, lon: 120.9842, type: 'city' },
    { name: 'Quezon City', country: 'Philippines', lat: 14.6760, lon: 121.0437, type: 'city' },
    { name: 'Davao City', country: 'Philippines', lat: 7.1907, lon: 125.4553, type: 'city' },
    { name: 'Cebu City', country: 'Philippines', lat: 10.3157, lon: 123.8854, type: 'city' },
    { name: 'Iloilo City', country: 'Philippines', lat: 10.7202, lon: 122.5621, type: 'city' },
    { name: 'Cagayan de Oro', country: 'Philippines', lat: 8.4542, lon: 124.6319, type: 'city' },
    { name: 'Zamboanga City', country: 'Philippines', lat: 6.9214, lon: 122.0790, type: 'city' },
    { name: 'General Santos', country: 'Philippines', lat: 6.1164, lon: 125.1716, type: 'city' },
    { name: 'Baguio City', country: 'Philippines', lat: 16.4023, lon: 120.5960, type: 'city' },
    { name: 'Bacolod City', country: 'Philippines', lat: 10.6767, lon: 122.9511, type: 'city' },
    { name: 'Tacloban City', country: 'Philippines', lat: 11.2444, lon: 125.0033, type: 'city' },
    { name: 'Valencia City', country: 'Philippines', lat: 7.9064, lon: 125.0945, type: 'city' },
    { name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832, type: 'city' },
    { name: 'Vancouver', country: 'Canada', lat: 49.2827, lon: -123.1207, type: 'city' },
    { name: 'Montreal', country: 'Canada', lat: 45.5017, lon: -73.5673, type: 'city' },
    { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332, type: 'city' },
    { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333, type: 'city' },
    { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lon: -43.1729, type: 'city' },
    { name: 'Buenos Aires', country: 'Argentina', lat: -34.6118, lon: -58.3960, type: 'city' },
    { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357, type: 'city' },
    { name: 'Cape Town', country: 'South Africa', lat: -33.9249, lon: 18.4241, type: 'city' },
    { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lon: 3.3792, type: 'city' },
    { name: 'Nairobi', country: 'Kenya', lat: -1.2921, lon: 36.8219, type: 'city' },
    { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784, type: 'city' },
    { name: 'Moscow', country: 'Russia', lat: 55.7558, lon: 37.6176, type: 'city' },
    { name: 'St. Petersburg', country: 'Russia', lat: 59.9311, lon: 30.3609, type: 'city' },
    
    // US States/Regions
    { name: 'California', country: 'United States', lat: 36.7783, lon: -119.4179, type: 'state' },
    { name: 'Texas', country: 'United States', lat: 31.9686, lon: -99.9018, type: 'state' },
    { name: 'Florida', country: 'United States', lat: 27.7663, lon: -82.6404, type: 'state' },
    { name: 'New York State', country: 'United States', lat: 42.1657, lon: -74.9481, type: 'state' },
    
    // Philippines - Regions
    { name: 'Luzon', country: 'Philippines', lat: 16.5662, lon: 121.2627, type: 'region' },
    { name: 'Visayas', country: 'Philippines', lat: 10.3157, lon: 123.8854, type: 'region' },
    { name: 'Mindanao', country: 'Philippines', lat: 8.4542, lon: 124.6319, type: 'region' },
    
    // Countries
    { name: 'United States', country: 'United States', lat: 39.8283, lon: -98.5795, type: 'country' },
    { name: 'Canada', country: 'Canada', lat: 56.1304, lon: -106.3468, type: 'country' },
    { name: 'United Kingdom', country: 'United Kingdom', lat: 55.3781, lon: -3.4360, type: 'country' },
    { name: 'Germany', country: 'Germany', lat: 51.1657, lon: 10.4515, type: 'country' },
    { name: 'France', country: 'France', lat: 46.2276, lon: 2.2137, type: 'country' },
    { name: 'Italy', country: 'Italy', lat: 41.8719, lon: 12.5674, type: 'country' },
    { name: 'Spain', country: 'Spain', lat: 40.4637, lon: -3.7492, type: 'country' },
    { name: 'Japan', country: 'Japan', lat: 36.2048, lon: 138.2529, type: 'country' },
    { name: 'Australia', country: 'Australia', lat: -25.2744, lon: 133.7751, type: 'country' },
    { name: 'India', country: 'India', lat: 20.5937, lon: 78.9629, type: 'country' },
    { name: 'China', country: 'China', lat: 35.8617, lon: 104.1954, type: 'country' },
    { name: 'Brazil', country: 'Brazil', lat: -14.2350, lon: -51.9253, type: 'country' },
    { name: 'Philippines', country: 'Philippines', lat: 12.8797, lon: 121.7740, type: 'country' }
  ];

  // API-based location search with worldwide coverage
  const searchLocation = async (query) => {
    if (!query.trim()) return [];
    
    try {
      const results = await searchLocationsAPI(query, 8);
      return results;
    } catch (error) {
      console.error('Location search failed:', error);
      setError('Failed to search locations. Please try again.');
      return [];
    }
  };

  // Handle input change with suggestions (async)
  const handleLocationInputChange = async (value) => {
    setLocation(value);
    
    if (value.trim().length > 0) {
      try {
        const searchResults = await searchLocation(value);
        setSuggestions(searchResults);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion) => {
    setLocation(suggestion.name);
    setShowSuggestions(false);
    setSuggestions([]);
    setCoordinates({ lat: suggestion.lat, lon: suggestion.lon });
    
    // Add to search history
    addToSearchHistory(suggestion);
    
    // Fetch weather data
    await fetchWeatherData(suggestion.lat, suggestion.lon);
  };

  // Add location to search history
  const addToSearchHistory = (location) => {
    const newHistory = [location, ...searchHistory.filter(item => item.name !== location.name)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('weatherSearchHistory', JSON.stringify(newHistory));
  };

  // Voice control handlers
  const handleVoiceLocationSelect = (location) => {
    setLocation(location.name);
    setCoordinates({ lat: location.lat, lon: location.lon });
    addToSearchHistory(location);
    fetchWeatherData(location.lat, location.lon);
  };

  const handleVoiceAnalyze = () => {
    if (coordinates.lat && coordinates.lon) {
      fetchWeatherData(coordinates.lat, coordinates.lon);
    } else {
      handleLocationSearch();
    }
  };

  const handleLocationSearch = async () => {
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setIsLoading(true);
    setError('');
    setShowSuggestions(false);

    try {
      // Use API to get coordinates for any location worldwide
      const locationData = await getLocationCoordinates(location);
      
      if (locationData) {
        setCoordinates({ lat: locationData.lat, lon: locationData.lon });
        setLocation(locationData.name);
        
        // Add to search history
        const historyItem = {
          name: locationData.name,
          country: locationData.country,
          lat: locationData.lat,
          lon: locationData.lon,
          type: 'city'
        };
        addToSearchHistory(historyItem);
        
        await fetchWeatherData(locationData.lat, locationData.lon);
      } else {
        setError('Location not found. Please try a different search term.');
      }
    } catch (err) {
      console.error('Location lookup error:', err);
      setError('Unable to find location. Please check your spelling and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSampleCoordinates = (locationName) => {
    const cities = {
      'new york': { lat: 40.7128, lon: -74.0060 },
      'london': { lat: 51.5074, lon: -0.1278 },
      'tokyo': { lat: 35.6762, lon: 139.6503 },
      'paris': { lat: 48.8566, lon: 2.3522 },
      'sydney': { lat: -33.8688, lon: 151.2093 },
      'los angeles': { lat: 34.0522, lon: -118.2437 },
      'chicago': { lat: 41.8781, lon: -87.6298 },
      'miami': { lat: 25.7617, lon: -80.1918 }
    };
    
    const key = locationName.toLowerCase();
    return cities[key] || null;
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lon: longitude });
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        await fetchWeatherData(latitude, longitude);
      },
      (error) => {
        setIsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access denied. Please enable location permissions and try again.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out. Please try again.');
            break;
          default:
            setError('An unknown error occurred while retrieving location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleCoordinateInput = async (lat, lon) => {
    if (lat && lon) {
      setCoordinates({ lat, lon });
      
      try {
        // Use reverse geocoding to get location name
        const locationData = await reverseGeocode(lat, lon);
        setLocation(locationData.name);
        
        // Add to search history
        const historyItem = {
          name: locationData.name,
          country: locationData.country,
          lat: locationData.lat,
          lon: locationData.lon,
          type: 'location'
        };
        addToSearchHistory(historyItem);
      } catch (error) {
        console.error('Reverse geocoding failed:', error);
        setLocation(`Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
      }
      
      await fetchWeatherData(lat, lon);
    }
  };

  const fetchWeatherData = async (lat, lon) => {
    setIsLoading(true);
    setError('');

    try {
      const targetDate = selectedDate || new Date().toISOString().split('T')[0];
      
      // Fetch comprehensive NASA weather analysis
      const weatherData = await weatherService.getWeatherAnalysis(lat, lon, targetDate);
      console.log('🌍 Received weather data for probability calculation:', weatherData);
      
      // For probability calculations, we need historical data, not just current analysis
      let historicalData;
      try {
        console.log('📊 Fetching historical data for probability calculations...');
        historicalData = await weatherService.getHistoricalData(lat, lon, 15);
        console.log('📈 Historical data received:', historicalData);
      } catch (error) {
        console.warn('⚠️ Historical data fetch failed, using current analysis:', error);
        historicalData = weatherData;
      }
      
      // Calculate probabilities using historical NASA data
      let probabilities;
      try {
        probabilities = weatherCalculations.calculateProbabilities(historicalData, targetDate);
        
        // If we get default probabilities, try location-based estimates instead
        if (probabilities.hot === 15 && probabilities.cold === 10 && probabilities.wet === 25) {
          console.log('🌍 Default probabilities detected, using location-based estimates...');
          probabilities = weatherCalculations.getLocationBasedProbabilities(lat, lon);
        }
      } catch (error) {
        console.error('❌ Probability calculation failed:', error);
        probabilities = weatherCalculations.getLocationBasedProbabilities(lat, lon);
      }
      
      // Generate enhanced summary
      const summary = generateSummary(probabilities);
      
      setResults({
        location: { lat, lon },
        date: targetDate,
        probabilities,
        historicalData: weatherData,
        summary,
        // Include NASA API specific data
        dataSources: weatherData.dataSources || ['NASA APIs (simulated)'],
        metadata: weatherData.metadata || {},
        enhancedAnalysis: weatherData.enhancedAnalysis || null,
        precipitation: weatherData.precipitation || null,
        soilMoisture: weatherData.soilMoisture || null,
        spaceWeather: weatherData.spaceWeather || null
      });
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      console.error('Weather data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummary = (probabilities) => {
    const conditions = [];
    
    if (probabilities.hot > 50) conditions.push(`${probabilities.hot}% chance of hot weather`);
    if (probabilities.cold > 50) conditions.push(`${probabilities.cold}% chance of cold weather`);
    if (probabilities.wet > 50) conditions.push(`${probabilities.wet}% chance of rain`);
    if (probabilities.windy > 50) conditions.push(`${probabilities.windy}% chance of windy conditions`);
    if (probabilities.uncomfortable > 50) conditions.push(`${probabilities.uncomfortable}% chance of uncomfortable heat`);
    
    if (conditions.length === 0) {
      return "Weather conditions are expected to be moderate with no extreme conditions likely.";
    }
    
    return `Based on historical data: ${conditions.join(', ')}.`;
  };

  const handleExportData = () => {
    if (!results) return;

    const exportData = {
      location: results.location,
      date: results.date,
      probabilities: results.probabilities,
      summary: results.summary,
      exportedAt: new Date().toISOString(),
      dataSource: 'NASA POWER, GPM IMERG, MERRA-2'
    };

    // Export as JSON
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `weather-probability-${results.date}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 transition-colors p-1"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium text-sm sm:text-base hidden sm:inline">Back to Home</span>
                <span className="font-medium text-sm sm:hidden">Back</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                <span className="hidden sm:inline">Weather Analysis Dashboard</span>
                <span className="sm:hidden">Weather Dashboard</span>
              </h1>
              
              <div className="hidden md:flex items-center space-x-2">
                <button 
                  onClick={() => navigate('/farm-weather')}
                  className="btn-secondary inline-flex items-center space-x-1 text-sm"
                >
                  <Wheat className="h-4 w-4" />
                  <span className="hidden lg:inline">Farm Weather</span>
                </button>
                
                <button 
                  onClick={() => navigate('/event-planner')}
                  className="btn-secondary inline-flex items-center space-x-1 text-sm"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden lg:inline">Event Planner</span>
                </button>
                
                {results && (
                  <button 
                    onClick={handleExportData}
                    className="btn-secondary inline-flex items-center space-x-1 text-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden lg:inline">Export</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4 sm:top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Location & Date</h2>
              
              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('search')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'search' 
                      ? 'bg-white text-primary-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Search className="h-4 w-4 inline mr-2" />
                  Search
                </button>
                <button
                  onClick={() => setActiveTab('coordinates')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'coordinates' 
                      ? 'bg-white text-primary-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Coordinates
                </button>
              </div>

              {/* Location Input */}
              {activeTab === 'search' ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search for a location
                  </label>
                  
                  {/* Responsive Search Bar */}
                  <div className="relative mb-3">
                    <div className="space-y-2 sm:space-y-0 sm:flex sm:space-x-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => handleLocationInputChange(e.target.value)}
                          onFocus={() => {
                            if (suggestions.length > 0) setShowSuggestions(true);
                          }}
                          onBlur={() => {
                            // Delay hiding suggestions to allow clicks
                            setTimeout(() => setShowSuggestions(false), 150);
                          }}
                          placeholder="Search cities, states, or countries..."
                          className="input-field pr-10 shadow-lg border-2 border-gray-200 focus:border-primary-500 focus:shadow-xl transition-all duration-200 text-sm sm:text-base w-full"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleLocationSearch();
                              setShowSuggestions(false);
                            }
                          }}
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                      <button 
                        onClick={handleLocationSearch}
                        disabled={isLoading}
                        className="btn-primary px-4 sm:px-6 py-2.5 shadow-lg w-full sm:w-auto text-sm sm:text-base"
                      >
                        {isLoading ? 'Searching...' : 'Search'}
                      </button>
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 mt-1 max-h-60 sm:max-h-80 overflow-y-auto">
                        {/* Search History */}
                        {searchHistory.length > 0 && suggestions.length === 0 && (
                          <>
                            <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                              Recent searches
                            </div>
                            {searchHistory.map((item, index) => (
                              <button
                                key={`history-${index}`}
                                onClick={() => handleSuggestionSelect(item)}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-gray-50 flex items-center space-x-2 sm:space-x-3 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.name}</div>
                                  <div className="text-xs sm:text-sm text-gray-500 truncate">{item.country}</div>
                                </div>
                                <div className="text-xs text-gray-400 capitalize hidden sm:block">{item.type}</div>
                              </button>
                            ))}
                          </>
                        )}

                        {/* Live Suggestions */}
                        {suggestions.length > 0 && (
                          <>
                            {suggestions.length > 0 && searchHistory.length > 0 && (
                              <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                                Suggestions
                              </div>
                            )}
                            {suggestions.map((suggestion, index) => (
                              <button
                                key={`suggestion-${index}`}
                                onClick={() => handleSuggestionSelect(suggestion)}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-primary-50 flex items-center space-x-2 sm:space-x-3 border-b border-gray-100 last:border-b-0 group"
                              >
                                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 flex-shrink-0">
                                  <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{suggestion.name}</div>
                                  <div className="text-xs sm:text-sm text-gray-500 truncate">{suggestion.country}</div>
                                </div>
                                <div className="text-xs text-primary-600 capitalize font-medium hidden sm:block">{suggestion.type}</div>
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Current Location Button */}
                  <button
                    onClick={handleCurrentLocation}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 border-2 border-primary-300 text-primary-600 rounded-lg hover:bg-primary-50 hover:border-primary-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <Navigation className="h-4 w-4" />
                    <span className="font-medium">Use Current Location</span>
                  </button>
                </div>
              ) : (
                <div className="mb-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g., 40.7128"
                      className="input-field"
                      onChange={(e) => {
                        const lat = parseFloat(e.target.value);
                        if (!isNaN(lat) && coordinates.lon) {
                          handleCoordinateInput(lat, coordinates.lon);
                        }
                        setCoordinates(prev => ({ ...prev, lat }));
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g., -74.0060"
                      className="input-field"
                      onChange={(e) => {
                        const lon = parseFloat(e.target.value);
                        if (!isNaN(lon) && coordinates.lat) {
                          handleCoordinateInput(coordinates.lat, lon);
                        }
                        setCoordinates(prev => ({ ...prev, lon }));
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Target Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Current Coordinates Display */}
              {coordinates.lat && coordinates.lon && (
                <div className="mb-6 p-4 bg-primary-50 rounded-lg">
                  <h3 className="text-sm font-medium text-primary-900 mb-2">Current Location</h3>
                  <p className="text-sm text-primary-700">
                    Lat: {coordinates.lat.toFixed(4)}, Lon: {coordinates.lon.toFixed(4)}
                  </p>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-sm text-gray-600">Analyzing weather data...</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {results ? (
              <ResultsDisplay results={results} />
            ) : (
              <div className="card text-center py-8 sm:py-12 lg:py-16">
                <div className="mb-4 sm:mb-6">
                  <BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    Ready to Analyze Weather Patterns
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-4">
                    Enter a location and date to get started with weather probability predictions 
                    based on 30+ years of NASA satellite data.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 max-w-2xl mx-auto px-4">
                  {[
                    { icon: Thermometer, label: 'Hot Weather', color: 'text-red-500' },
                    { icon: Thermometer, label: 'Cold Weather', color: 'text-blue-500' },
                    { icon: Droplets, label: 'Rainfall', color: 'text-blue-600' },
                    { icon: Wind, label: 'Windy', color: 'text-gray-600' },
                    { icon: Sun, label: 'Heat Index', color: 'text-orange-500' }
                  ].map((item, index) => (
                    <div key={index} className="text-center">
                      <item.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${item.color} mx-auto mb-1 sm:mb-2`} />
                      <p className="text-xs text-gray-500">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Weather Map Section */}
        {coordinates.lat && coordinates.lon && (
          <div className="mt-6 sm:mt-8">
            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Interactive Weather Map</h2>
                {results && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="text-xl sm:text-2xl">
                      {(() => {
                        const { wet, windy, hot, cold } = results.probabilities;
                        if (wet > 40) return '🌧️';
                        if (windy > 50) return '🌬️';
                        if (hot > 60) return '🔥';
                        if (cold > 40) return '❄️';
                        return '☀️';
                      })()}
                    </span>
                    <span className="text-xs sm:text-sm">Current weather condition</span>
                  </div>
                )}
              </div>
              <WeatherMap 
                coordinates={coordinates} 
                onLocationSelect={(lat, lon) => handleCoordinateInput(lat, lon)}
                weatherData={results}
                locationName={location}
                showGlobalWeather={true}
              />
              
              <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Global Weather Map Instructions</h3>
                <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                  <li>• <strong>🌍 Global Weather:</strong> Toggle to view weather icons worldwide</li>
                  <li>• <strong>Large Icons:</strong> Analyzed locations with real NASA data</li>
                  <li>• <strong>Small Icons:</strong> Estimated conditions for major cities</li>
                  <li>• <strong>Click Any Icon:</strong> View detailed weather information</li>
                  <li>• <strong>Click Map:</strong> Select a new location for analysis</li>
                  <li className="hidden sm:list-item">• <strong>Voice Command:</strong> Say location names to update the map</li>
                </ul>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-700">
                    <strong>🌍 Global Coverage:</strong> Search any city, region, or country worldwide using OpenStreetMap API
                  </p>
                  <p className="text-xs text-blue-600 mt-1 hidden sm:block">
                    Examples: "Paris, France", "Tokyo", "New York", "Manila", "London", "Sydney", etc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Voice Control Integration */}
        <VoiceControl 
          onLocationSelect={handleVoiceLocationSelect}
          onAnalyze={handleVoiceAnalyze}
          currentPage="dashboard"
          results={results}
        />
      </div>
    </div>
  );
};

export default Dashboard;
