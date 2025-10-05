import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Global weather locations with estimated conditions
const globalWeatherLocations = [
  // Major World Cities
  { name: 'New York', lat: 40.7128, lon: -74.0060, condition: 'sunny', country: 'USA' },
  { name: 'London', lat: 51.5074, lon: -0.1278, condition: 'rainy', country: 'UK' },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503, condition: 'sunny', country: 'Japan' },
  { name: 'Paris', lat: 48.8566, lon: 2.3522, condition: 'sunny', country: 'France' },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093, condition: 'sunny', country: 'Australia' },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, condition: 'hot', country: 'USA' },
  { name: 'Chicago', lat: 41.8781, lon: -87.6298, condition: 'windy', country: 'USA' },
  { name: 'Miami', lat: 25.7617, lon: -80.1918, condition: 'hot', country: 'USA' },
  { name: 'Berlin', lat: 52.5200, lon: 13.4050, condition: 'sunny', country: 'Germany' },
  { name: 'Rome', lat: 41.9028, lon: 12.4964, condition: 'sunny', country: 'Italy' },
  { name: 'Madrid', lat: 40.4168, lon: -3.7038, condition: 'hot', country: 'Spain' },
  { name: 'Amsterdam', lat: 52.3676, lon: 4.9041, condition: 'rainy', country: 'Netherlands' },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708, condition: 'hot', country: 'UAE' },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198, condition: 'rainy', country: 'Singapore' },
  { name: 'Hong Kong', lat: 22.3193, lon: 114.1694, condition: 'rainy', country: 'China' },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, condition: 'rainy', country: 'India' },
  { name: 'Delhi', lat: 28.7041, lon: 77.1025, condition: 'hot', country: 'India' },
  { name: 'Bangkok', lat: 13.7563, lon: 100.5018, condition: 'rainy', country: 'Thailand' },
  { name: 'Seoul', lat: 37.5665, lon: 126.9780, condition: 'cold', country: 'South Korea' },
  { name: 'Beijing', lat: 39.9042, lon: 116.4074, condition: 'windy', country: 'China' },
  { name: 'Shanghai', lat: 31.2304, lon: 121.4737, condition: 'rainy', country: 'China' },
  { name: 'Toronto', lat: 43.6532, lon: -79.3832, condition: 'cold', country: 'Canada' },
  { name: 'Vancouver', lat: 49.2827, lon: -123.1207, condition: 'rainy', country: 'Canada' },
  { name: 'Montreal', lat: 45.5017, lon: -73.5673, condition: 'cold', country: 'Canada' },
  { name: 'Mexico City', lat: 19.4326, lon: -99.1332, condition: 'sunny', country: 'Mexico' },
  { name: 'São Paulo', lat: -23.5505, lon: -46.6333, condition: 'rainy', country: 'Brazil' },
  { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, condition: 'hot', country: 'Brazil' },
  { name: 'Buenos Aires', lat: -34.6118, lon: -58.3960, condition: 'windy', country: 'Argentina' },
  { name: 'Cairo', lat: 30.0444, lon: 31.2357, condition: 'hot', country: 'Egypt' },
  { name: 'Cape Town', lat: -33.9249, lon: 18.4241, condition: 'windy', country: 'South Africa' },
  { name: 'Lagos', lat: 6.5244, lon: 3.3792, condition: 'rainy', country: 'Nigeria' },
  { name: 'Nairobi', lat: -1.2921, lon: 36.8219, condition: 'sunny', country: 'Kenya' },
  { name: 'Istanbul', lat: 41.0082, lon: 28.9784, condition: 'sunny', country: 'Turkey' },
  { name: 'Moscow', lat: 55.7558, lon: 37.6176, condition: 'cold', country: 'Russia' },
  { name: 'St. Petersburg', lat: 59.9311, lon: 30.3609, condition: 'cold', country: 'Russia' },
  
  // Philippines Cities (with more realistic weather patterns)
  { name: 'Manila', lat: 14.5995, lon: 120.9842, condition: 'rainy', country: 'Philippines' },
  { name: 'Cebu City', lat: 10.3157, lon: 123.8854, condition: 'hot', country: 'Philippines' },
  { name: 'Davao City', lat: 7.1907, lon: 125.4553, condition: 'rainy', country: 'Philippines' },
  { name: 'Valencia City', lat: 7.9064, lon: 125.0945, condition: 'rainy', country: 'Philippines' },
  { name: 'Baguio City', lat: 16.4023, lon: 120.5960, condition: 'cold', country: 'Philippines' },
  { name: 'Iloilo City', lat: 10.7202, lon: 122.5621, condition: 'rainy', country: 'Philippines' },
  { name: 'Cagayan de Oro', lat: 8.4542, lon: 124.6319, condition: 'windy', country: 'Philippines' },
  { name: 'Zamboanga City', lat: 6.9214, lon: 122.0790, condition: 'hot', country: 'Philippines' },
  { name: 'Bacolod City', lat: 10.6767, lon: 122.9511, condition: 'hot', country: 'Philippines' },
  { name: 'Tacloban City', lat: 11.2444, lon: 125.0033, condition: 'windy', country: 'Philippines' },
  
  // Additional Asian Cities
  { name: 'Kuala Lumpur', lat: 3.1390, lon: 101.6869, condition: 'rainy', country: 'Malaysia' },
  { name: 'Jakarta', lat: -6.2088, lon: 106.8456, condition: 'rainy', country: 'Indonesia' },
  { name: 'Ho Chi Minh City', lat: 10.8231, lon: 106.6297, condition: 'hot', country: 'Vietnam' },
  { name: 'Hanoi', lat: 21.0285, lon: 105.8542, condition: 'rainy', country: 'Vietnam' },
  
  // European Cities
  { name: 'Barcelona', lat: 41.3851, lon: 2.1734, condition: 'sunny', country: 'Spain' },
  { name: 'Vienna', lat: 48.2082, lon: 16.3738, condition: 'sunny', country: 'Austria' },
  { name: 'Prague', lat: 50.0755, lon: 14.4378, condition: 'sunny', country: 'Czech Republic' },
  { name: 'Stockholm', lat: 59.3293, lon: 18.0686, condition: 'cold', country: 'Sweden' },
  { name: 'Oslo', lat: 59.9139, lon: 10.7522, condition: 'cold', country: 'Norway' },
  
  // Middle East & Africa
  { name: 'Riyadh', lat: 24.7136, lon: 46.6753, condition: 'hot', country: 'Saudi Arabia' },
  { name: 'Tel Aviv', lat: 32.0853, lon: 34.7818, condition: 'hot', country: 'Israel' },
  { name: 'Johannesburg', lat: -26.2041, lon: 28.0473, condition: 'sunny', country: 'South Africa' }
];

// Weather condition detection logic
const getWeatherCondition = (probabilities) => {
  if (!probabilities) return 'unknown';
  
  // Priority order: wet > windy > hot > cold > sunny
  if (probabilities.wet > 40) return 'rainy';
  if (probabilities.windy > 50) return 'windy';
  if (probabilities.hot > 60) return 'hot';
  if (probabilities.cold > 40) return 'cold';
  return 'sunny';
};

// Generate estimated probabilities for global locations
const getEstimatedProbabilities = (condition) => {
  const baseProbabilities = { wet: 20, windy: 25, hot: 30, cold: 15, uncomfortable: 20 };
  
  switch (condition) {
    case 'rainy':
      return { ...baseProbabilities, wet: 75, uncomfortable: 40 };
    case 'windy':
      return { ...baseProbabilities, windy: 70, cold: 35 };
    case 'hot':
      return { ...baseProbabilities, hot: 80, uncomfortable: 85 };
    case 'cold':
      return { ...baseProbabilities, cold: 70, hot: 5 };
    case 'sunny':
    default:
      return { ...baseProbabilities, wet: 10, hot: 45 };
  }
};

// Weather icon mapping
const weatherIcons = {
  sunny: '☀️',
  rainy: '🌧️',
  windy: '🌬️',
  hot: '🔥',
  cold: '❄️',
  unknown: '🌤️'
};

// Create custom weather icon
const createWeatherIcon = (condition, size = 'large') => {
  const emoji = weatherIcons[condition] || weatherIcons.unknown;
  const iconSize = size === 'large' ? 48 : 32;
  
  return L.divIcon({
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${iconSize}px;
        height: ${iconSize}px;
        background: white;
        border: 3px solid #2563eb;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-size: ${iconSize * 0.6}px;
        cursor: pointer;
        transition: all 0.3s ease;
      " 
      onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.4)';"
      onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.3)';"
      title="Weather: ${condition}"
      aria-label="Weather condition: ${condition}"
      role="button"
      tabindex="0"
      >
        ${emoji}
      </div>
    `,
    className: 'weather-icon-marker',
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize/2, iconSize/2],
    popupAnchor: [0, -iconSize/2]
  });
};

// Generate detailed weather popup content
const createWeatherPopup = (location, probabilities, condition) => {
  if (!probabilities) {
    return `
      <div class="weather-popup" style="min-width: 250px; font-family: system-ui;">
        <div style="text-align: center; padding: 12px;">
          <div style="font-size: 32px; margin-bottom: 8px;">${weatherIcons[condition] || weatherIcons.unknown}</div>
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
            ${location || 'Selected Location'}
          </h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Click "Analyze Weather" to get detailed forecast
          </p>
        </div>
      </div>
    `;
  }

  const temp = probabilities.temperature || 'N/A';
  const humidity = probabilities.humidity || 'N/A';
  const windSpeed = probabilities.windSpeed || 'N/A';
  
  return `
    <div class="weather-popup" style="min-width: 280px; font-family: system-ui;">
      <div style="text-align: center; padding: 16px;">
        <div style="font-size: 40px; margin-bottom: 12px;">${weatherIcons[condition]}</div>
        <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
          ${location || 'Weather Forecast'}
        </h3>
        
        <div style="background: #f9fafb; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; text-align: left;">
            <div>
              <span style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 500;">Rain</span>
              <div style="font-size: 16px; font-weight: 600; color: #2563eb;">${probabilities.wet}%</div>
            </div>
            <div>
              <span style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 500;">Wind</span>
              <div style="font-size: 16px; font-weight: 600; color: #059669;">${probabilities.windy}%</div>
            </div>
            <div>
              <span style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 500;">Hot</span>
              <div style="font-size: 16px; font-weight: 600; color: #dc2626;">${probabilities.hot}%</div>
            </div>
            <div>
              <span style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 500;">Cold</span>
              <div style="font-size: 16px; font-weight: 600; color: #2563eb;">${probabilities.cold}%</div>
            </div>
          </div>
        </div>
        
        <div style="text-align: left; font-size: 14px; color: #374151;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>🌡️ Temperature:</span>
            <strong>${temp}°C</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>💧 Humidity:</span>
            <strong>${humidity}%</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>💨 Wind Speed:</span>
            <strong>${windSpeed} m/s</strong>
          </div>
        </div>
        
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
          <div style="font-size: 12px; color: #6b7280;">
            Condition: <strong style="color: #1f2937; text-transform: capitalize;">${condition}</strong>
          </div>
        </div>
      </div>
    </div>
  `;
};

const WeatherMap = ({ coordinates, onLocationSelect, weatherData, locationName, showGlobalWeather = true }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const globalMarkersRef = useRef([]);
  const [globalWeatherVisible, setGlobalWeatherVisible] = React.useState(showGlobalWeather);
  const [mapZoom, setMapZoom] = React.useState(3);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map with global view if showing global weather, otherwise focus on coordinates
    const initialView = globalWeatherVisible ? [20, 0] : [coordinates.lat, coordinates.lon];
    const initialZoom = globalWeatherVisible ? 2 : 10;
    const map = L.map(mapRef.current).setView(initialView, initialZoom);
    mapInstanceRef.current = map;
    
    // Track zoom changes
    map.on('zoomend', () => {
      setMapZoom(map.getZoom());
    });

    // Add tile layer with better styling
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
      tileSize: 256
    }).addTo(map);

    // Add global weather markers if enabled
    if (showGlobalWeather) {
      globalWeatherLocations.forEach((location) => {
        const estimatedProbs = getEstimatedProbabilities(location.condition);
        const globalIcon = createWeatherIcon(location.condition, 'small');
        
        const globalMarker = L.marker([location.lat, location.lon], {
          icon: globalIcon,
          alt: `${location.name} weather: ${location.condition}`,
          title: `${location.name}, ${location.country} - ${location.condition}`,
          zIndexOffset: -100 // Keep global markers behind the main marker
        })
          .addTo(map)
          .bindPopup(createWeatherPopup(
            `${location.name}, ${location.country}`, 
            estimatedProbs, 
            location.condition
          ), {
            maxWidth: 300,
            className: 'weather-popup-container global-weather-popup'
          });
        
        globalMarkersRef.current.push(globalMarker);
      });
    }

    // Determine weather condition and create appropriate icon for main location
    const condition = getWeatherCondition(weatherData?.probabilities);
    const weatherIcon = createWeatherIcon(condition, 'large');

    // Add main weather marker (highlighted)
    const marker = L.marker([coordinates.lat, coordinates.lon], { 
      icon: weatherIcon,
      alt: `Weather condition: ${condition}`,
      title: `${locationName || 'Selected Location'} - ${condition}`,
      zIndexOffset: 1000 // Keep main marker on top
    })
      .addTo(map)
      .bindPopup(createWeatherPopup(locationName, weatherData?.probabilities, condition), {
        maxWidth: 320,
        className: 'weather-popup-container main-weather-popup'
      });
    
    markerRef.current = marker;

    // Add click handler for map
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      
      // Update marker position with new weather icon
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        
        // Create new icon for the new location (default to unknown until analysis)
        const newIcon = createWeatherIcon('unknown', 'large');
        markerRef.current.setIcon(newIcon);
        
        // Update popup content
        markerRef.current.setPopupContent(
          createWeatherPopup(`Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`, null, 'unknown')
        );
      }
      
      // Call callback
      if (onLocationSelect) {
        onLocationSelect(lat, lng);
      }
    });

    // Cleanup function
    return () => {
      // Clean up global markers
      globalMarkersRef.current.forEach(marker => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(marker);
        }
      });
      globalMarkersRef.current = [];
      
      // Clean up map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showGlobalWeather]);

  // Update marker when coordinates or weather data changes
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && coordinates.lat && coordinates.lon) {
      const newLatLng = [coordinates.lat, coordinates.lon];
      markerRef.current.setLatLng(newLatLng);
      mapInstanceRef.current.setView(newLatLng, 10);
      
      // Update weather icon based on new data
      const condition = getWeatherCondition(weatherData?.probabilities);
      const weatherIcon = createWeatherIcon(condition, 'large');
      markerRef.current.setIcon(weatherIcon);
      
      // Update popup with weather information
      markerRef.current.setPopupContent(
        createWeatherPopup(locationName, weatherData?.probabilities, condition)
      );
    }
  }, [coordinates, weatherData, locationName]);

  // Toggle global weather visibility
  const toggleGlobalWeather = () => {
    const newVisibility = !globalWeatherVisible;
    setGlobalWeatherVisible(newVisibility);
    
    if (mapInstanceRef.current) {
      if (newVisibility) {
        // Show global view
        mapInstanceRef.current.setView([20, 0], 2);
        // Add global markers
        globalWeatherLocations.forEach((location) => {
          const estimatedProbs = getEstimatedProbabilities(location.condition);
          const globalIcon = createWeatherIcon(location.condition, 'small');
          
          const globalMarker = L.marker([location.lat, location.lon], {
            icon: globalIcon,
            alt: `${location.name} weather: ${location.condition}`,
            title: `${location.name}, ${location.country} - ${location.condition}`,
            zIndexOffset: -100
          })
            .addTo(mapInstanceRef.current)
            .bindPopup(createWeatherPopup(
              `${location.name}, ${location.country}`, 
              estimatedProbs, 
              location.condition
            ), {
              maxWidth: 300,
              className: 'weather-popup-container global-weather-popup'
            });
          
          globalMarkersRef.current.push(globalMarker);
        });
      } else {
        // Hide global markers and focus on selected location
        globalMarkersRef.current.forEach(marker => {
          mapInstanceRef.current.removeLayer(marker);
        });
        globalMarkersRef.current = [];
        mapInstanceRef.current.setView([coordinates.lat, coordinates.lon], 10);
      }
    }
  };

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-64 sm:h-80 lg:h-96 rounded-lg border border-gray-200"
        style={{ minHeight: '300px' }}
      />
      
      {/* Main Info Panel */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-white p-2 sm:p-4 rounded-lg shadow-lg border z-[1000] max-w-xs">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xl sm:text-2xl">
            {weatherIcons[getWeatherCondition(weatherData?.probabilities)]}
          </span>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
              {locationName || 'Selected Location'}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {getWeatherCondition(weatherData?.probabilities)} conditions
            </p>
          </div>
        </div>
        
        <div className="text-xs text-gray-600 space-y-1">
          <p className="hidden sm:block"><strong>Click weather icons</strong> for detailed forecasts</p>
          <p><strong>Click map</strong> to select location</p>
          <p className="text-gray-400 text-xs">
            📍 {coordinates.lat.toFixed(2)}, {coordinates.lon.toFixed(2)}
          </p>
        </div>
        
        {weatherData?.probabilities && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>🌧️ Rain:</span>
                <span className="font-semibold text-blue-600">{weatherData.probabilities.wet}%</span>
              </div>
              <div className="flex justify-between">
                <span>🌬️ Wind:</span>
                <span className="font-semibold text-green-600">{weatherData.probabilities.windy}%</span>
              </div>
              <div className="flex justify-between">
                <span>🔥 Hot:</span>
                <span className="font-semibold text-red-600">{weatherData.probabilities.hot}%</span>
              </div>
              <div className="flex justify-between">
                <span>❄️ Cold:</span>
                <span className="font-semibold text-blue-600">{weatherData.probabilities.cold}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Weather Controls */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white p-2 sm:p-3 rounded-lg shadow-lg border z-[1000]">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
          <button
            onClick={toggleGlobalWeather}
            className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              globalWeatherVisible 
                ? 'bg-primary-600 text-white hover:bg-primary-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="hidden sm:inline">🌍 Global Weather</span>
            <span className="sm:hidden">🌍 Global</span>
          </button>
        </div>
        
        <div className="text-xs text-gray-600">
          <p className="mb-1 hidden sm:block">Zoom: {mapZoom}</p>
          <p className="text-xs">{globalWeatherVisible ? `${globalWeatherLocations.length} cities` : 'Focus mode'}</p>
        </div>
      </div>

      {/* Weather Legend */}
      {globalWeatherVisible && (
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-white p-2 sm:p-3 rounded-lg shadow-lg border z-[1000] max-w-xs">
          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">Weather Legend</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <span className="text-sm sm:text-lg">☀️</span>
              <span className="text-xs">Sunny</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-sm sm:text-lg">🌧️</span>
              <span className="text-xs">Rainy</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-sm sm:text-lg">🌬️</span>
              <span className="text-xs">Windy</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-sm sm:text-lg">🔥</span>
              <span className="text-xs">Hot</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-sm sm:text-lg">❄️</span>
              <span className="text-xs">Cold</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-sm sm:text-lg">🌤️</span>
              <span className="text-xs">Unknown</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500 hidden sm:block">
            <p>Large icons: Analyzed locations</p>
            <p>Small icons: Estimated conditions</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherMap;
