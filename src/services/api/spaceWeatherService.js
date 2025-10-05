import BaseApiService from './baseApiService.js';

/**
 * NASA DONKI Space Weather Service
 * Handles Coronal Mass Ejection (CME) and space weather data
 */
class SpaceWeatherService extends BaseApiService {
  constructor() {
    super();
    this.apiKey = '64TpVAZmiLUgxbVXQQXmGVV1cEfej2oWoPfLBxEW';
    this.baseUrl = 'https://api.nasa.gov/DONKI';
  }

  /**
   * Fetch space weather data for a specific date range
   * @param {string} targetDate - Target date for analysis
   * @param {number} dayRange - Number of days to look ahead/behind
   * @returns {Promise} Processed space weather data
   */
  async fetchSpaceWeatherData(targetDate, dayRange = 7) {
    try {
      const startDate = this.addDays(targetDate, -dayRange);
      const endDate = this.addDays(targetDate, dayRange);
      
      const startDateStr = this.formatDate(startDate);
      const endDateStr = this.formatDate(endDate);
      
      const url = `${this.baseUrl}/CME?startDate=${startDateStr}&endDate=${endDateStr}&api_key=${this.apiKey}`;
      
      console.log('Fetching NASA DONKI space weather data...');
      const data = await this.get(url, { timeout: 15000 });
      
      if (data && data.length > 0) {
        console.log(`Found ${data.length} space weather events`);
        return this.processSpaceWeatherData(data);
      } else {
        console.log('No space weather events found for this period');
        return this.generateDefaultSpaceWeatherData();
      }
    } catch (error) {
      console.warn('NASA DONKI API error:', error.message);
      return this.generateDefaultSpaceWeatherData();
    }
  }

  /**
   * Process raw CME data from NASA DONKI
   * @param {Array} cmeData - Raw CME event data
   * @returns {Object} Processed space weather impact data
   */
  processSpaceWeatherData(cmeData) {
    const events = cmeData.map(event => ({
      activityID: event.activityID,
      startTime: event.startTime,
      sourceLocation: event.sourceLocation,
      note: event.note,
      linkedEvents: event.linkedEvents || [],
      cmeAnalyses: event.cmeAnalyses || []
    }));

    return {
      hasEvents: events.length > 0,
      eventCount: events.length,
      events: events.slice(0, 3), // Limit to 3 most recent
      impactLevel: this.calculateSpaceWeatherImpact(events),
      description: this.getSpaceWeatherDescription(events)
    };
  }

  /**
   * Calculate space weather impact level
   * @param {Array} events - Array of space weather events
   * @returns {string} Impact level (minimal, low, moderate, high)
   */
  calculateSpaceWeatherImpact(events) {
    if (events.length === 0) return 'minimal';
    if (events.length >= 3) return 'high';
    if (events.length >= 2) return 'moderate';
    return 'low';
  }

  /**
   * Generate description based on space weather events
   * @param {Array} events - Array of space weather events
   * @returns {string} Human-readable description
   */
  getSpaceWeatherDescription(events) {
    if (events.length === 0) {
      return 'No significant space weather events detected. Normal atmospheric conditions expected.';
    }
    
    const descriptions = [
      'Coronal Mass Ejection activity may influence upper atmospheric conditions.',
      'Space weather events could affect radio communications and satellite operations.',
      'Solar activity detected - potential minor effects on weather patterns.',
      'Geomagnetic disturbances possible due to solar wind interactions.'
    ];
    
    return descriptions[Math.min(events.length - 1, descriptions.length - 1)];
  }

  /**
   * Generate default space weather data when no events are found
   * @returns {Object} Default space weather data structure
   */
  generateDefaultSpaceWeatherData() {
    return {
      hasEvents: false,
      eventCount: 0,
      events: [],
      impactLevel: 'minimal',
      description: 'No significant space weather events detected. Normal atmospheric conditions expected.'
    };
  }
}

export default SpaceWeatherService;
