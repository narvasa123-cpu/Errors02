/**
 * NASA POWER API Service
 * Prediction Of Worldwide Energy Resources
 * Provides daily, monthly, and hourly weather data including temperature, precipitation, humidity, solar radiation
 */

class NasaPowerService {
  constructor() {
    this.baseUrl = 'https://power.larc.nasa.gov/api/temporal';
    this.version = 'v2.5.0';
    
    // NASA POWER parameters for weather analysis
    this.parameters = {
      temperature: ['T2M', 'T2M_MAX', 'T2M_MIN'], // Temperature at 2m, max, min
      precipitation: ['PRECTOTCORR'], // Precipitation corrected
      humidity: ['RH2M'], // Relative humidity at 2m
      wind: ['WS2M', 'WD2M'], // Wind speed and direction at 2m
      solar: ['ALLSKY_SFC_SW_DWN'], // Solar radiation
      pressure: ['PS'], // Surface pressure
      evaporation: ['EVLAND'], // Evaporation from land
      soilMoisture: ['GWETROOT'] // Root zone soil wetness
    };
  }

  /**
   * Get weather data for a specific location and date range
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} startDate - Start date (YYYYMMDD)
   * @param {string} endDate - End date (YYYYMMDD)
   * @param {string} temporal - Temporal resolution (daily, monthly, hourly)
   * @returns {Promise} Weather data from NASA POWER API
   */
  async getWeatherData(lat, lon, startDate, endDate, temporal = 'daily') {
    try {
      // Combine all parameters for comprehensive weather data
      const allParams = [
        ...this.parameters.temperature,
        ...this.parameters.precipitation,
        ...this.parameters.humidity,
        ...this.parameters.wind,
        ...this.parameters.solar,
        ...this.parameters.pressure,
        ...this.parameters.evaporation,
        ...this.parameters.soilMoisture
      ].join(',');

      const url = `${this.baseUrl}/${temporal}/point` +
        `?parameters=${allParams}` +
        `&community=RE` + // Renewable Energy community (most comprehensive)
        `&longitude=${lon}` +
        `&latitude=${lat}` +
        `&start=${startDate}` +
        `&end=${endDate}` +
        `&format=JSON`;

      console.log('Fetching NASA POWER data:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`NASA POWER API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.processNasaPowerData(data);

    } catch (error) {
      console.error('NASA POWER API error:', error);
      throw new Error(`Failed to fetch NASA POWER data: ${error.message}`);
    }
  }

  /**
   * Get historical weather data for probability calculations
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {number} years - Number of years of historical data
   * @returns {Promise} Historical weather data
   */
  async getHistoricalData(lat, lon, years = 15) {
    try {
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - years;
      
      const startDate = `${startYear}0101`;
      const endDate = `${currentYear - 1}1231`;

      const data = await this.getWeatherData(lat, lon, startDate, endDate, 'daily');
      
      return {
        ...data,
        metadata: {
          source: 'NASA POWER API',
          years: years,
          startYear: startYear,
          endYear: currentYear - 1,
          location: { lat, lon },
          dataPoints: data.daily ? Object.keys(data.daily.T2M || {}).length : 0
        }
      };

    } catch (error) {
      console.error('Historical data fetch error:', error);
      throw error;
    }
  }

  /**
   * Get current weather conditions
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise} Current weather data
   */
  async getCurrentWeather(lat, lon) {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      const startDate = this.formatDateForApi(yesterday);
      const endDate = this.formatDateForApi(today);

      return await this.getWeatherData(lat, lon, startDate, endDate, 'daily');

    } catch (error) {
      console.error('Current weather fetch error:', error);
      throw error;
    }
  }

  /**
   * Get monthly climate data for seasonal analysis
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {number} years - Number of years for monthly averages
   * @returns {Promise} Monthly climate data
   */
  async getMonthlyClimateData(lat, lon, years = 10) {
    try {
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - years;
      
      const startDate = `${startYear}01`;
      const endDate = `${currentYear - 1}12`;

      return await this.getWeatherData(lat, lon, startDate, endDate, 'monthly');

    } catch (error) {
      console.error('Monthly climate data fetch error:', error);
      throw error;
    }
  }

  /**
   * Process NASA POWER API response data
   * @param {Object} rawData - Raw API response
   * @returns {Object} Processed weather data
   */
  processNasaPowerData(rawData) {
    try {
      const { properties } = rawData;
      const { parameter } = properties;

      // Process daily data
      const processedData = {
        daily: {},
        monthly: {},
        metadata: {
          source: 'NASA POWER API',
          location: {
            lat: properties.geometry?.coordinates?.[1],
            lon: properties.geometry?.coordinates?.[0]
          },
          elevation: properties.elevation,
          timezone: properties.timezone,
          dataVersion: rawData.header?.api_version
        }
      };

      // Process each parameter
      Object.keys(parameter).forEach(param => {
        const paramData = parameter[param];
        
        if (typeof paramData === 'object') {
          processedData.daily[param] = paramData;
        }
      });

      // Calculate derived metrics
      if (processedData.daily.T2M && processedData.daily.RH2M) {
        processedData.daily.HEAT_INDEX = this.calculateHeatIndex(
          processedData.daily.T2M, 
          processedData.daily.RH2M
        );
      }

      // Calculate comfort index
      if (processedData.daily.T2M && processedData.daily.WS2M && processedData.daily.RH2M) {
        processedData.daily.COMFORT_INDEX = this.calculateComfortIndex(
          processedData.daily.T2M,
          processedData.daily.WS2M,
          processedData.daily.RH2M
        );
      }

      return processedData;

    } catch (error) {
      console.error('Data processing error:', error);
      throw new Error(`Failed to process NASA POWER data: ${error.message}`);
    }
  }

  /**
   * Calculate heat index from temperature and humidity
   * @param {Object} temperature - Temperature data object
   * @param {Object} humidity - Humidity data object
   * @returns {Object} Heat index data object
   */
  calculateHeatIndex(temperature, humidity) {
    const heatIndex = {};
    
    Object.keys(temperature).forEach(date => {
      const T = temperature[date];
      const RH = humidity[date];
      
      if (T !== null && RH !== null && T >= 27) {
        // Simplified heat index formula
        const HI = -8.78469475556 +
                   1.61139411 * T +
                   2.33854883889 * RH +
                   -0.14611605 * T * RH +
                   -0.012308094 * T * T +
                   -0.0164248277778 * RH * RH +
                   0.002211732 * T * T * RH +
                   0.00072546 * T * RH * RH +
                   -0.000003582 * T * T * RH * RH;
        
        heatIndex[date] = Math.round(HI * 10) / 10;
      } else {
        heatIndex[date] = T; // Use temperature if heat index not applicable
      }
    });
    
    return heatIndex;
  }

  /**
   * Calculate comfort index combining temperature, wind, and humidity
   * @param {Object} temperature - Temperature data
   * @param {Object} windSpeed - Wind speed data
   * @param {Object} humidity - Humidity data
   * @returns {Object} Comfort index data
   */
  calculateComfortIndex(temperature, windSpeed, humidity) {
    const comfortIndex = {};
    
    Object.keys(temperature).forEach(date => {
      const T = temperature[date];
      const WS = windSpeed[date];
      const RH = humidity[date];
      
      if (T !== null && WS !== null && RH !== null) {
        // Simplified comfort calculation (0-100 scale)
        let comfort = 50; // Base comfort
        
        // Temperature comfort (optimal around 20-25°C)
        if (T >= 20 && T <= 25) {
          comfort += 20;
        } else if (T >= 15 && T <= 30) {
          comfort += 10;
        } else if (T < 5 || T > 35) {
          comfort -= 30;
        } else {
          comfort -= 10;
        }
        
        // Humidity comfort (optimal 40-60%)
        if (RH >= 40 && RH <= 60) {
          comfort += 15;
        } else if (RH >= 30 && RH <= 70) {
          comfort += 5;
        } else {
          comfort -= 15;
        }
        
        // Wind comfort (light breeze is pleasant)
        if (WS >= 1 && WS <= 5) {
          comfort += 10;
        } else if (WS > 10) {
          comfort -= 10;
        }
        
        comfortIndex[date] = Math.max(0, Math.min(100, Math.round(comfort)));
      } else {
        comfortIndex[date] = null;
      }
    });
    
    return comfortIndex;
  }

  /**
   * Format date for NASA POWER API (YYYYMMDD or YYYYMM)
   * @param {Date} date - Date object
   * @param {boolean} monthOnly - Return YYYYMM format
   * @returns {string} Formatted date string
   */
  formatDateForApi(date, monthOnly = false) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    if (monthOnly) {
      return `${year}${month}`;
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * Get data availability for a location
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise} Data availability information
   */
  async getDataAvailability(lat, lon) {
    try {
      // Test with a small date range to check availability
      const testDate = '20230101';
      const url = `${this.baseUrl}/daily/point` +
        `?parameters=T2M` +
        `&community=RE` +
        `&longitude=${lon}` +
        `&latitude=${lat}` +
        `&start=${testDate}` +
        `&end=${testDate}` +
        `&format=JSON`;

      const response = await fetch(url);
      const data = await response.json();

      return {
        available: response.ok,
        location: {
          lat: data.properties?.geometry?.coordinates?.[1],
          lon: data.properties?.geometry?.coordinates?.[0]
        },
        elevation: data.properties?.elevation,
        timezone: data.properties?.timezone,
        message: response.ok ? 'Data available' : 'No data available for this location'
      };

    } catch (error) {
      return {
        available: false,
        message: `Error checking data availability: ${error.message}`
      };
    }
  }
}

export default NasaPowerService;
