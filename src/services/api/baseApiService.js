import axios from 'axios';

/**
 * Base API Service class with common functionality
 */
class BaseApiService {
  constructor() {
    this.defaultTimeout = 10000;
    this.defaultHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  /**
   * Make HTTP GET request with error handling
   * @param {string} url - API endpoint URL
   * @param {object} options - Request options
   * @returns {Promise} Response data
   */
  async get(url, options = {}) {
    try {
      const config = {
        timeout: options.timeout || this.defaultTimeout,
        headers: { ...this.defaultHeaders, ...options.headers },
        ...options
      };

      const response = await axios.get(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error, url);
      throw error;
    }
  }

  /**
   * Handle API errors consistently
   * @param {Error} error - The error object
   * @param {string} url - The URL that failed
   */
  handleError(error, url) {
    if (error.response) {
      console.error(`API Error (${error.response.status}):`, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Request Error:', error.message);
    }
    console.error(`Failed URL: ${url}`);
  }

  /**
   * Format date to ISO string
   * @param {Date|string} date - Date to format
   * @returns {string} ISO date string
   */
  formatDate(date) {
    return new Date(date).toISOString().split('T')[0];
  }

  /**
   * Add days to a date
   * @param {Date|string} date - Base date
   * @param {number} days - Number of days to add
   * @returns {Date} New date
   */
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Check if coordinates are valid
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {boolean} True if valid
   */
  isValidCoordinates(lat, lon) {
    return (
      typeof lat === 'number' && 
      typeof lon === 'number' &&
      lat >= -90 && lat <= 90 &&
      lon >= -180 && lon <= 180
    );
  }
}

export default BaseApiService;
