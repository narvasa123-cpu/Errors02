import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { 
  AlertTriangle, 
  Zap, 
  Filter, 
  RefreshCw, 
  MapPin,
  Calendar,
  ExternalLink,
  Info
} from 'lucide-react';
import L from 'leaflet';
import DisasterTrackingService from '../services/api/disasterTrackingService';

// Custom marker icons for different event types
const createCustomIcon = (emoji, severity) => {
  const colors = {
    high: '#ef4444',
    moderate: '#f59e0b',
    low: '#10b981'
  };
  
  return L.divIcon({
    html: `
      <div style="
        background: ${colors[severity] || colors.low};
        border: 2px solid white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        ${emoji}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const StormTracker = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState('');

  // Initialize disaster tracking service
  const disasterService = new DisasterTrackingService();

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('🌪️ Fetching NASA EONET disaster events...');
      const eventData = await disasterService.fetchDisasterEvents(30, 'open');
      console.log('📊 Received disaster events:', eventData);
      setEvents(eventData || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ Error fetching disaster events:', error);
      setError('Failed to load disaster events. Please try again.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const categoryMatch = selectedCategory === 'all' || event.categoryId === selectedCategory;
    const severityMatch = selectedSeverity === 'all' || event.severity === selectedSeverity;
    return categoryMatch && severityMatch;
  });

  const categories = [...new Set(events.map(event => event.categoryId))];
  const severityLevels = ['low', 'moderate', 'high'];

  // Get event icon using disaster service
  const getEventIcon = (categoryId) => {
    return disasterService.getEventIcon(categoryId);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'text-red-600 bg-red-50 border-red-200',
      moderate: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-green-600 bg-green-50 border-green-200'
    };
    return colors[severity] || colors.low;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  <span className="hidden sm:inline">NASA Storm Tracker</span>
                  <span className="sm:hidden">Storm Tracker</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Real-time natural disaster monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {lastUpdated && (
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
                </div>
              )}
              
              <button
                onClick={fetchEvents}
                disabled={loading}
                className="btn-primary inline-flex items-center space-x-1 sm:space-x-2 text-sm"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
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
        {loading && (
          <div className="mb-6 text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Loading NASA disaster events...</p>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Severity Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity Level
                </label>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Severities</option>
                  {severityLevels.map(severity => (
                    <option key={severity} value={severity}>
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Statistics */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Statistics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Total Events:</span>
                    <span className="font-medium text-blue-900">{events.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Filtered:</span>
                    <span className="font-medium text-blue-900">{filteredEvents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">High Severity:</span>
                    <span className="font-medium text-red-600">
                      {events.filter(e => e.severity === 'high').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map and Events */}
          <div className="lg:col-span-3 space-y-6">
            {/* Map */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Global Event Map</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{filteredEvents.length} events shown</span>
                </div>
              </div>
              
              <div className="h-96 rounded-lg overflow-hidden border">
                {!loading && (
                  <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {filteredEvents.map(event => (
                      <Marker
                        key={event.id}
                        position={[event.coordinates.lat, event.coordinates.lon]}
                        icon={createCustomIcon(
                          getEventIcon(event.categoryId),
                          event.severity
                        )}
                      >
                        <Popup>
                          <div className="p-2 max-w-xs">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              {event.title}
                            </h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Category:</span>
                                <span className="font-medium">{event.category}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Severity:</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(event.severity)}`}>
                                  {event.severity.toUpperCase()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Date:</span>
                                <span className="font-medium">
                                  {new Date(event.date).toLocaleDateString()}
                                </span>
                              </div>
                              {event.magnitudeValue && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Magnitude:</span>
                                  <span className="font-medium">
                                    {event.magnitudeValue} {event.magnitudeUnit}
                                  </span>
                                </div>
                              )}
                            </div>
                            {event.link && (
                              <a
                                href={event.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm mt-2"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>More Info</span>
                              </a>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                )}
                
                {loading && (
                  <div className="h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Loading events...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Events List */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h3>
              
              {filteredEvents.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No events match your current filters.</p>
                </div>
              )}

              <div className="space-y-3">
                {filteredEvents.slice(0, 10).map(event => (
                  <div key={event.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xl">
                            {getEventIcon(event.categoryId)}
                          </span>
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(event.severity)}`}>
                            {event.severity.toUpperCase()}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{event.category}</span>
                          <span>•</span>
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>
                            {event.coordinates.lat.toFixed(2)}°, {event.coordinates.lon.toFixed(2)}°
                          </span>
                          {event.magnitudeValue && (
                            <>
                              <span>•</span>
                              <span>{event.magnitudeValue} {event.magnitudeUnit}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {event.link && (
                        <a
                          href={event.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StormTracker;
