import SpaceWeatherService from './api/spaceWeatherService.js';
import DisasterTrackingService from './api/disasterTrackingService.js';
import MeteomaticsService from './api/meteomaticsService.js';
import { processHistoricalData, mergeDataSources, validateDataIntegrity } from './utils/dataProcessor.js';

/**
 * Main Weather Service - Orchestrates all weather-related data sources
 * This is the primary service that components should interact with
 */
class WeatherService {
  constructor() {
    // Initialize individual service modules
    this.spaceWeatherService = new SpaceWeatherService();
    this.disasterTrackingService = new DisasterTrackingService();
    this.meteomaticsService = new MeteomaticsService();
    
    // Service configuration
    this.config = {
      enableSpaceWeather: true,
      enableDisasterTracking: true,
      defaultDayRange: 7,
      maxRetries: 3
    };
  }

  /**
   * Get comprehensive weather data for a location and date
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} targetDate - Target date for analysis
   * @returns {Promise<Object>} Complete weather analysis
   */
  async getWeatherAnalysis(lat, lon, targetDate) {
    try {
      console.log(`Fetching comprehensive weather analysis for ${lat}, ${lon} on ${targetDate}`);
      
      // Validate inputs
      if (!this.meteomaticsService.isValidCoordinates(lat, lon)) {
        throw new Error('Invalid coordinates provided');
      }

      // Fetch data from all sources in parallel
      const [weatherData, spaceWeatherData] = await Promise.all([
        this.meteomaticsService.fetchWeatherData(lat, lon, targetDate),
        this.config.enableSpaceWeather 
          ? this.spaceWeatherService.fetchSpaceWeatherData(targetDate, this.config.defaultDayRange)
          : null
      ]);

      // Process historical weather data
      const processedWeatherData = processHistoricalData(weatherData.daily, weatherData.monthly);
      
      // Merge all data sources
      const mergedData = mergeDataSources(
        { ...weatherData, ...processedWeatherData },
        spaceWeatherData
      );

      // Validate data integrity
      const validation = validateDataIntegrity(mergedData);
      if (!validation.isValid) {
        console.warn('Data validation failed:', validation.errors);
      }

      // Add validation results to response
      mergedData.validation = validation;
      
      console.log('Weather analysis completed successfully');
      return mergedData;

    } catch (error) {
      console.error('Error in weather analysis:', error);
      throw error;
    }
  }

  /**
   * Get disaster events for storm tracking
   * @param {number} days - Number of days to look back
   * @param {string} status - Event status filter
   * @returns {Promise<Array>} Array of disaster events
   */
  async getDisasterEvents(days = 30, status = 'open') {
    try {
      if (!this.config.enableDisasterTracking) {
        console.log('Disaster tracking is disabled');
        return [];
      }

      return await this.disasterTrackingService.fetchDisasterEvents(days, status);
    } catch (error) {
      console.error('Error fetching disaster events:', error);
      return [];
    }
  }

  /**
   * Get space weather data independently
   * @param {string} targetDate - Target date for analysis
   * @param {number} dayRange - Number of days to look around target date
   * @returns {Promise<Object>} Space weather data
   */
  async getSpaceWeatherData(targetDate, dayRange = 7) {
    try {
      if (!this.config.enableSpaceWeather) {
        console.log('Space weather tracking is disabled');
        return this.spaceWeatherService.generateDefaultSpaceWeatherData();
      }

      return await this.spaceWeatherService.fetchSpaceWeatherData(targetDate, dayRange);
    } catch (error) {
      console.error('Error fetching space weather data:', error);
      return this.spaceWeatherService.generateDefaultSpaceWeatherData();
    }
  }

  /**
   * Filter disaster events by criteria
   * @param {Array} events - Array of disaster events
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered events
   */
  filterDisasterEvents(events, filters = {}) {
    let filteredEvents = [...events];

    if (filters.category && filters.category !== 'all') {
      filteredEvents = this.disasterTrackingService.filterByCategory(filteredEvents, filters.category);
    }

    if (filters.severity && filters.severity !== 'all') {
      filteredEvents = this.disasterTrackingService.filterBySeverity(filteredEvents, filters.severity);
    }

    return filteredEvents;
  }

  /**
   * Get disaster event statistics
   * @param {Array} events - Array of disaster events
   * @returns {Object} Event statistics
   */
  getDisasterStatistics(events) {
    return this.disasterTrackingService.getEventStatistics(events);
  }

  /**
   * Get event icon for disaster category
   * @param {string} categoryId - Event category ID
   * @returns {string} Emoji icon
   */
  getDisasterEventIcon(categoryId) {
    return this.disasterTrackingService.getEventIcon(categoryId);
  }

  /**
   * Export weather data in specified format
   * @param {Object} data - Weather data to export
   * @param {string} format - Export format ('json' or 'csv')
   * @returns {string|Object} Formatted export data
   */
  exportData(data, format = 'json') {
    const { formatForExport } = require('./utils/dataProcessor.js');
    return formatForExport(data, format);
  }

  /**
   * Get service status and configuration
   * @returns {Object} Service status information
   */
  getServiceStatus() {
    return {
      services: {
        meteomatics: this.meteomaticsService.getApiStatus(),
        spaceWeather: {
          service: 'NASA DONKI Space Weather',
          enabled: this.config.enableSpaceWeather,
          apiKey: this.spaceWeatherService.apiKey ? 'configured' : 'missing'
        },
        disasterTracking: {
          service: 'NASA EONET Disaster Tracking',
          enabled: this.config.enableDisasterTracking,
          baseUrl: this.disasterTrackingService.baseUrl
        }
      },
      configuration: this.config,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Update service configuration
   * @param {Object} newConfig - New configuration options
   */
  updateConfiguration(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('Service configuration updated:', this.config);
  }

  /**
   * Health check for all services
   * @returns {Promise<Object>} Health status of all services
   */
  async healthCheck() {
    const health = {
      overall: 'healthy',
      services: {},
      timestamp: new Date().toISOString()
    };

    try {
      // Check Meteomatics service
      health.services.meteomatics = {
        status: this.meteomaticsService.validateCredentials() ? 'healthy' : 'degraded',
        message: 'Credentials validated'
      };

      // Check space weather service
      try {
        await this.spaceWeatherService.generateDefaultSpaceWeatherData();
        health.services.spaceWeather = { status: 'healthy', message: 'Service operational' };
      } catch (error) {
        health.services.spaceWeather = { status: 'unhealthy', message: error.message };
        health.overall = 'degraded';
      }

      // Check disaster tracking service
      try {
        const testEvents = this.disasterTrackingService.getEventStatistics([]);
        health.services.disasterTracking = { status: 'healthy', message: 'Service operational' };
      } catch (error) {
        health.services.disasterTracking = { status: 'unhealthy', message: error.message };
        health.overall = 'degraded';
      }

    } catch (error) {
      health.overall = 'unhealthy';
      health.error = error.message;
    }

    return health;
  }
}

// Export singleton instance
export const weatherService = new WeatherService();
export default WeatherService;
