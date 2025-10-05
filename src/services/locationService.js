/**
 * Location Service - Provides worldwide location data using APIs
 */

// Free geocoding APIs (no API key required)
const GEOCODING_APIS = {
  nominatim: 'https://nominatim.openstreetmap.org/search',
  photon: 'https://photon.komoot.io/api',
  geonames: 'http://api.geonames.org/searchJSON'
};

// Popular worldwide locations cache for quick access
const POPULAR_LOCATIONS = [
  // Major World Cities
  { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060, type: 'city' },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278, type: 'city' },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, type: 'city' },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, type: 'city' },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, type: 'city' },
  { name: 'Los Angeles', country: 'United States', lat: 34.0522, lon: -118.2437, type: 'city' },
  { name: 'Chicago', country: 'United States', lat: 41.8781, lon: -87.6298, type: 'city' },
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
  
  // Philippines Cities
  { name: 'Manila', country: 'Philippines', lat: 14.5995, lon: 120.9842, type: 'city' },
  { name: 'Quezon City', country: 'Philippines', lat: 14.6760, lon: 121.0437, type: 'city' },
  { name: 'Davao City', country: 'Philippines', lat: 7.1907, lon: 125.4553, type: 'city' },
  { name: 'Cebu City', country: 'Philippines', lat: 10.3157, lon: 123.8854, type: 'city' },
  { name: 'Valencia City', country: 'Philippines', lat: 7.9064, lon: 125.0945, type: 'city' },
  { name: 'Baguio City', country: 'Philippines', lat: 16.4023, lon: 120.5960, type: 'city' },
  { name: 'Iloilo City', country: 'Philippines', lat: 10.7202, lon: 122.5621, type: 'city' },
  { name: 'Cagayan de Oro', country: 'Philippines', lat: 8.4542, lon: 124.6319, type: 'city' },
  
  // More World Cities
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832, type: 'city' },
  { name: 'Vancouver', country: 'Canada', lat: 49.2827, lon: -123.1207, type: 'city' },
  { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332, type: 'city' },
  { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333, type: 'city' },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6118, lon: -58.3960, type: 'city' },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357, type: 'city' },
  { name: 'Cape Town', country: 'South Africa', lat: -33.9249, lon: 18.4241, type: 'city' },
  { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lon: 3.3792, type: 'city' },
  { name: 'Nairobi', country: 'Kenya', lat: -1.2921, lon: 36.8219, type: 'city' },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784, type: 'city' },
  { name: 'Moscow', country: 'Russia', lat: 55.7558, lon: 37.6176, type: 'city' },
  { name: 'Johannesburg', country: 'South Africa', lat: -26.2041, lon: 28.0473, type: 'city' },
  { name: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lon: 46.6753, type: 'city' },
  { name: 'Tel Aviv', country: 'Israel', lat: 32.0853, lon: 34.7818, type: 'city' },
  { name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.1390, lon: 101.6869, type: 'city' },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lon: 106.8456, type: 'city' },
  { name: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.8231, lon: 106.6297, type: 'city' },
  { name: 'Hanoi', country: 'Vietnam', lat: 21.0285, lon: 105.8542, type: 'city' },
  { name: 'Barcelona', country: 'Spain', lat: 41.3851, lon: 2.1734, type: 'city' },
  { name: 'Vienna', country: 'Austria', lat: 48.2082, lon: 16.3738, type: 'city' },
  { name: 'Prague', country: 'Czech Republic', lat: 50.0755, lon: 14.4378, type: 'city' },
  { name: 'Stockholm', country: 'Sweden', lat: 59.3293, lon: 18.0686, type: 'city' },
  { name: 'Oslo', country: 'Norway', lat: 59.9139, lon: 10.7522, type: 'city' },
  { name: 'Helsinki', country: 'Finland', lat: 60.1699, lon: 24.9384, type: 'city' },
  { name: 'Copenhagen', country: 'Denmark', lat: 55.6761, lon: 12.5683, type: 'city' },
  { name: 'Zurich', country: 'Switzerland', lat: 47.3769, lon: 8.5417, type: 'city' },
  { name: 'Brussels', country: 'Belgium', lat: 50.8503, lon: 4.3517, type: 'city' },
  { name: 'Warsaw', country: 'Poland', lat: 52.2297, lon: 21.0122, type: 'city' },
  { name: 'Budapest', country: 'Hungary', lat: 47.4979, lon: 19.0402, type: 'city' },
  { name: 'Athens', country: 'Greece', lat: 37.9838, lon: 23.7275, type: 'city' },
  { name: 'Lisbon', country: 'Portugal', lat: 38.7223, lon: -9.1393, type: 'city' },
  
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
  { name: 'Philippines', country: 'Philippines', lat: 12.8797, lon: 121.7740, type: 'country' },
  { name: 'Russia', country: 'Russia', lat: 61.5240, lon: 105.3188, type: 'country' },
  { name: 'Mexico', country: 'Mexico', lat: 23.6345, lon: -102.5528, type: 'country' },
  { name: 'Argentina', country: 'Argentina', lat: -38.4161, lon: -63.6167, type: 'country' },
  { name: 'South Africa', country: 'South Africa', lat: -30.5595, lon: 22.9375, type: 'country' },
  { name: 'Egypt', country: 'Egypt', lat: 26.8206, lon: 30.8025, type: 'country' },
  { name: 'Turkey', country: 'Turkey', lat: 38.9637, lon: 35.2433, type: 'country' },
  { name: 'Saudi Arabia', country: 'Saudi Arabia', lat: 23.8859, lon: 45.0792, type: 'country' },
  { name: 'Indonesia', country: 'Indonesia', lat: -0.7893, lon: 113.9213, type: 'country' },
  { name: 'Thailand', country: 'Thailand', lat: 15.8700, lon: 100.9925, type: 'country' },
  { name: 'Vietnam', country: 'Vietnam', lat: 14.0583, lon: 108.2772, type: 'country' },
  { name: 'Malaysia', country: 'Malaysia', lat: 4.2105, lon: 101.9758, type: 'country' },
  { name: 'South Korea', country: 'South Korea', lat: 35.9078, lon: 127.7669, type: 'country' },
  { name: 'Nigeria', country: 'Nigeria', lat: 9.0820, lon: 8.6753, type: 'country' },
  { name: 'Kenya', country: 'Kenya', lat: -0.0236, lon: 37.9062, type: 'country' },
  { name: 'Israel', country: 'Israel', lat: 31.0461, lon: 34.8516, type: 'country' },
  { name: 'UAE', country: 'UAE', lat: 23.4241, lon: 53.8478, type: 'country' }
];

/**
 * Search locations using OpenStreetMap Nominatim API (free, no API key required)
 */
export const searchLocationsAPI = async (query, limit = 10) => {
  if (!query || query.trim().length < 2) {
    return POPULAR_LOCATIONS.slice(0, limit);
  }

  try {
    // First, search in popular locations cache
    const cacheResults = searchInCache(query, limit);
    
    // If we have good cache results, return them
    if (cacheResults.length >= 3) {
      return cacheResults;
    }

    // Search using Nominatim API for worldwide coverage
    const nominatimUrl = `${GEOCODING_APIS.nominatim}?q=${encodeURIComponent(query)}&format=json&limit=${limit}&addressdetails=1&extratags=1`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'WeatherApp/1.0 (Weather Prediction App)'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform API results to our format
    const apiResults = data.map(item => ({
      name: item.display_name.split(',')[0].trim(),
      country: item.address?.country || 'Unknown',
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      type: determineLocationType(item),
      source: 'api'
    }));

    // Combine cache and API results, prioritizing cache
    const combinedResults = [...cacheResults, ...apiResults]
      .filter((location, index, self) => 
        index === self.findIndex(l => 
          Math.abs(l.lat - location.lat) < 0.1 && 
          Math.abs(l.lon - location.lon) < 0.1
        )
      )
      .slice(0, limit);

    return combinedResults;

  } catch (error) {
    console.warn('Location API search failed, using cache:', error);
    // Fallback to cache search if API fails
    return searchInCache(query, limit);
  }
};

/**
 * Search in popular locations cache
 */
const searchInCache = (query, limit = 10) => {
  const searchTerm = query.toLowerCase().trim();
  
  return POPULAR_LOCATIONS
    .filter(location => 
      location.name.toLowerCase().includes(searchTerm) ||
      location.country.toLowerCase().includes(searchTerm)
    )
    .slice(0, limit);
};

/**
 * Determine location type from API response
 */
const determineLocationType = (item) => {
  const type = item.type?.toLowerCase();
  const category = item.class?.toLowerCase();
  
  if (type === 'administrative' || category === 'boundary') {
    if (item.address?.country && !item.address?.state) return 'country';
    if (item.address?.state) return 'state';
    return 'region';
  }
  
  if (type === 'city' || type === 'town' || type === 'village' || category === 'place') {
    return 'city';
  }
  
  return 'location';
};

/**
 * Get coordinates for a location name
 */
export const getLocationCoordinates = async (locationName) => {
  try {
    // First check cache
    const cacheResult = POPULAR_LOCATIONS.find(loc => 
      loc.name.toLowerCase() === locationName.toLowerCase()
    );
    
    if (cacheResult) {
      return {
        lat: cacheResult.lat,
        lon: cacheResult.lon,
        name: cacheResult.name,
        country: cacheResult.country
      };
    }

    // Search API
    const results = await searchLocationsAPI(locationName, 1);
    if (results.length > 0) {
      const result = results[0];
      return {
        lat: result.lat,
        lon: result.lon,
        name: result.name,
        country: result.country
      };
    }

    throw new Error('Location not found');
  } catch (error) {
    console.error('Failed to get coordinates:', error);
    throw error;
  }
};

/**
 * Reverse geocoding - get location name from coordinates
 */
export const reverseGeocode = async (lat, lon) => {
  try {
    const url = `${GEOCODING_APIS.nominatim}/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WeatherApp/1.0 (Weather Prediction App)'
      }
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      name: data.address?.city || data.address?.town || data.address?.village || 'Unknown Location',
      country: data.address?.country || 'Unknown Country',
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon)
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return {
      name: `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
      country: 'Unknown',
      lat,
      lon
    };
  }
};

/**
 * Get popular locations for quick access
 */
export const getPopularLocations = (limit = 20) => {
  return POPULAR_LOCATIONS.slice(0, limit);
};

export default {
  searchLocationsAPI,
  getLocationCoordinates,
  reverseGeocode,
  getPopularLocations
};
