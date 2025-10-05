import BaseApiService from './baseApiService.js';

/**
 * NASA EONET Disaster Tracking Service
 * Handles natural disasters, storms, and environmental events
 */
class DisasterTrackingService extends BaseApiService {
  constructor() {
    super();
    this.baseUrl = 'https://eonet.gsfc.nasa.gov/api/v3/events';
  }

  /**
   * Fetch natural disaster events from NASA EONET
   * @param {number} days - Number of days to look back for events
   * @param {string} status - Event status filter (open, closed, all)
   * @returns {Promise} Array of processed disaster events
   */
  async fetchDisasterEvents(days = 30, status = 'open') {
    try {
      console.log('Fetching NASA EONET natural disaster events...');
      
      const url = `${this.baseUrl}?days=${days}&status=${status}`;
      const data = await this.get(url, { timeout: 15000 });

      if (data && data.events) {
        console.log(`Found ${data.events.length} natural disaster events`);
        return this.processDisasterEvents(data.events);
      } else {
        console.log('No natural disaster events found');
        return [];
      }
    } catch (error) {
      console.warn('NASA EONET API error:', error.message);
      return [];
    }
  }

  /**
   * Process raw EONET event data
   * @param {Array} events - Raw event data from EONET
   * @returns {Array} Processed disaster events
   */
  processDisasterEvents(events) {
    return events.map(event => {
      const latestGeometry = event.geometry[event.geometry.length - 1];
      const coordinates = latestGeometry.coordinates;
      
      return {
        id: event.id,
        title: event.title,
        description: event.description || 'No description available',
        category: event.categories[0]?.title || 'Unknown',
        categoryId: event.categories[0]?.id || 'unknown',
        date: latestGeometry.date,
        coordinates: {
          lat: coordinates[1],
          lon: coordinates[0]
        },
        magnitudeValue: latestGeometry.magnitudeValue || null,
        magnitudeUnit: latestGeometry.magnitudeUnit || null,
        link: event.link || null,
        closed: event.closed || null,
        severity: this.calculateEventSeverity(event.categories[0]?.id, latestGeometry.magnitudeValue)
      };
    }).filter(event => this.isValidCoordinates(event.coordinates.lat, event.coordinates.lon));
  }

  /**
   * Calculate event severity based on category and magnitude
   * @param {string} categoryId - Event category identifier
   * @param {number} magnitude - Event magnitude value
   * @returns {string} Severity level (low, moderate, high)
   */
  calculateEventSeverity(categoryId, magnitude) {
    const severityMap = {
      'storms': magnitude ? (magnitude > 100 ? 'high' : magnitude > 50 ? 'moderate' : 'low') : 'moderate',
      'volcanoes': 'high',
      'wildfires': magnitude ? (magnitude > 1000 ? 'high' : magnitude > 100 ? 'moderate' : 'low') : 'moderate',
      'floods': 'moderate',
      'drought': 'low',
      'dustHaze': 'low',
      'earthquakes': magnitude ? (magnitude > 6 ? 'high' : magnitude > 4 ? 'moderate' : 'low') : 'moderate',
      'landslides': 'moderate',
      'manmade': 'low',
      'seaLakeIce': 'low',
      'severeStorms': 'high',
      'snow': 'low',
      'tempExtremes': 'moderate',
      'waterColor': 'low'
    };

    return severityMap[categoryId] || 'low';
  }

  /**
   * Get emoji icon for event category
   * @param {string} categoryId - Event category identifier
   * @returns {string} Emoji representation of the event
   */
  getEventIcon(categoryId) {
    const iconMap = {
      'storms': '🌪️',
      'volcanoes': '🌋',
      'wildfires': '🔥',
      'floods': '🌊',
      'drought': '🏜️',
      'dustHaze': '🌫️',
      'earthquakes': '🌍',
      'landslides': '⛰️',
      'manmade': '🏭',
      'seaLakeIce': '🧊',
      'severeStorms': '⛈️',
      'snow': '❄️',
      'tempExtremes': '🌡️',
      'waterColor': '💧'
    };

    return iconMap[categoryId] || '⚠️';
  }

  /**
   * Filter events by category
   * @param {Array} events - Array of disaster events
   * @param {string} category - Category to filter by
   * @returns {Array} Filtered events
   */
  filterByCategory(events, category) {
    if (category === 'all') return events;
    return events.filter(event => event.categoryId === category);
  }

  /**
   * Filter events by severity
   * @param {Array} events - Array of disaster events
   * @param {string} severity - Severity level to filter by
   * @returns {Array} Filtered events
   */
  filterBySeverity(events, severity) {
    if (severity === 'all') return events;
    return events.filter(event => event.severity === severity);
  }

  /**
   * Get unique categories from events
   * @param {Array} events - Array of disaster events
   * @returns {Array} Unique category IDs
   */
  getUniqueCategories(events) {
    return [...new Set(events.map(event => event.categoryId))];
  }

  /**
   * Get event statistics
   * @param {Array} events - Array of disaster events
   * @returns {Object} Statistics object
   */
  getEventStatistics(events) {
    return {
      total: events.length,
      high: events.filter(e => e.severity === 'high').length,
      moderate: events.filter(e => e.severity === 'moderate').length,
      low: events.filter(e => e.severity === 'low').length,
      categories: this.getUniqueCategories(events)
    };
  }
}

export default DisasterTrackingService;
