/**
 * Weather API Service - Integrates with NASA APIs (POWER, GPM, SMAP, DONKI)
 */

import NasaPowerService from './api/nasaPowerService.js';
import NasaEarthdataService from './api/nasaEarthdataService.js';
import SpaceWeatherService from './api/spaceWeatherService.js';

class WeatherApiService {
  constructor() {
    // Initialize NASA API services
    this.nasaPower = new NasaPowerService();
    this.nasaEarthdata = new NasaEarthdataService();
    this.spaceWeather = new SpaceWeatherService();
    
    // Meteomatics backup (NASA-recommended commercial API)
    this.meteomaticsUrl = 'https://api.meteomatics.com';
    this.meteomaticsAuth = {
      username: 'narvasa_darryljohn',
      password: '20XN1825ylysfXl8jSXx'
    };
  }

  /**
   * Get comprehensive weather analysis using NASA APIs
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude  
   * @param {string} date - Target date (YYYY-MM-DD)
   * @returns {Promise} Comprehensive weather analysis
   */
  async getWeatherAnalysis(lat, lon, date) {
    try {
      console.log(`🛰️ Fetching NASA weather data for ${lat}, ${lon} on ${date}`);
      
      // Calculate date range for analysis (±15 days for context)
      const targetDate = new Date(date);
      const startDate = new Date(targetDate);
      startDate.setDate(targetDate.getDate() - 15);
      const endDate = new Date(targetDate);
      endDate.setDate(targetDate.getDate() + 15);
      
      const startDateStr = this.formatDate(startDate);
      const endDateStr = this.formatDate(endDate);
      
      // Fetch data from multiple NASA sources in parallel
      const [
        nasaPowerData,
        precipitationData,
        soilMoistureData,
        spaceWeatherData
      ] = await Promise.allSettled([
        this.nasaPower.getWeatherData(lat, lon, startDateStr, endDateStr),
        this.nasaEarthdata.getGpmPrecipitationData(lat, lon, this.formatDateDash(startDate), this.formatDateDash(endDate)),
        this.nasaEarthdata.getSmapSoilMoistureData(lat, lon, this.formatDateDash(startDate), this.formatDateDash(endDate)),
        this.spaceWeather.fetchSpaceWeatherData(this.formatDateDash(targetDate), 7)
      ]);

      // Process results and handle any failures gracefully
      const weatherAnalysis = {
        location: { lat, lon },
        targetDate: date,
        dataSources: [],
        daily: {},
        monthly: {},
        precipitation: null,
        soilMoisture: null,
        spaceWeather: null,
        metadata: {
          analysisDate: new Date().toISOString(),
          dataQuality: 'high',
          sources: []
        }
      };

      // Process NASA POWER data
      if (nasaPowerData.status === 'fulfilled') {
        weatherAnalysis.daily = nasaPowerData.value.daily || {};
        weatherAnalysis.monthly = nasaPowerData.value.monthly || {};
        weatherAnalysis.metadata.sources.push('NASA POWER API');
        weatherAnalysis.dataSources.push('NASA POWER');
        console.log('✅ NASA POWER data retrieved successfully');
      } else {
        console.warn('⚠️ NASA POWER data failed:', nasaPowerData.reason);
        // Fallback to mock data for NASA POWER
        const mockData = this.getMockWeatherData(lat, lon, date);
        weatherAnalysis.daily = mockData;
        weatherAnalysis.metadata.sources.push('NASA POWER (simulated)');
        weatherAnalysis.dataSources.push('NASA POWER (simulated)');
      }

      // Process GPM precipitation data
      if (precipitationData.status === 'fulfilled') {
        weatherAnalysis.precipitation = precipitationData.value;
        weatherAnalysis.metadata.sources.push('NASA GPM IMERG');
        weatherAnalysis.dataSources.push('NASA GPM IMERG');
        console.log('✅ NASA GPM precipitation data retrieved successfully');
      } else {
        console.warn('⚠️ NASA GPM data failed:', precipitationData.reason);
      }

      // Process SMAP soil moisture data
      if (soilMoistureData.status === 'fulfilled') {
        weatherAnalysis.soilMoisture = soilMoistureData.value;
        weatherAnalysis.metadata.sources.push('NASA SMAP');
        weatherAnalysis.dataSources.push('NASA SMAP');
        console.log('✅ NASA SMAP soil moisture data retrieved successfully');
      } else {
        console.warn('⚠️ NASA SMAP data failed:', soilMoistureData.reason);
      }

      // Process space weather data
      if (spaceWeatherData.status === 'fulfilled') {
        weatherAnalysis.spaceWeather = spaceWeatherData.value;
        weatherAnalysis.metadata.sources.push('NASA DONKI');
        weatherAnalysis.dataSources.push('NASA DONKI');
        console.log('✅ NASA DONKI space weather data retrieved successfully');
      } else {
        console.warn('⚠️ NASA DONKI data failed:', spaceWeatherData.reason);
      }

      // Enhanced analysis combining all NASA data sources
      weatherAnalysis.enhancedAnalysis = this.combineNasaDataSources(weatherAnalysis);
      
      console.log(`🎯 Weather analysis complete using ${weatherAnalysis.dataSources.length} NASA data sources`);
      return weatherAnalysis;

    } catch (error) {
      console.error('❌ Weather analysis error:', error);
      
      // Fallback to mock data if all NASA APIs fail
      console.log('🔄 Falling back to simulated NASA data...');
      const mockData = this.getMockWeatherData(lat, lon, date);
      return {
        location: { lat, lon },
        targetDate: date,
        daily: mockData,
        dataSources: ['NASA APIs (simulated)'],
        metadata: {
          analysisDate: new Date().toISOString(),
          dataQuality: 'simulated',
          sources: ['NASA POWER (simulated)', 'NASA GPM (simulated)', 'NASA SMAP (simulated)'],
          fallbackReason: error.message
        }
      };
    }
  }

  /**
   * Generate mock weather data for development
   */
  getMockWeatherData(lat, lon, date) {
    // Generate realistic weather data based on location
    const isNorthern = lat > 0;
    const isTropical = Math.abs(lat) < 23.5;
    const isCoastal = Math.abs(lon) % 10 < 3; // Rough coastal approximation
    
    // Base temperature varies by latitude
    let baseTemp = 25; // Default tropical temperature
    if (Math.abs(lat) > 60) baseTemp = 5; // Arctic/Antarctic
    else if (Math.abs(lat) > 40) baseTemp = 15; // Temperate
    else if (Math.abs(lat) > 23.5) baseTemp = 20; // Subtropical
    
    // Seasonal variation (simplified)
    const month = new Date(date).getMonth();
    const seasonalVariation = isNorthern 
      ? Math.sin((month - 3) * Math.PI / 6) * 10 // Northern hemisphere
      : Math.sin((month - 9) * Math.PI / 6) * 10; // Southern hemisphere
    
    const temperature = baseTemp + seasonalVariation + (Math.random() - 0.5) * 10;
    
    // Humidity varies by location type
    const humidity = isTropical ? 70 + Math.random() * 20 : 40 + Math.random() * 30;
    
    // Wind speed
    const windSpeed = isCoastal ? 5 + Math.random() * 15 : 2 + Math.random() * 8;
    
    // Precipitation (higher in tropical and coastal areas)
    const precipitationChance = isTropical ? 0.6 : isCoastal ? 0.4 : 0.3;
    const precipitation = Math.random() < precipitationChance ? Math.random() * 20 : 0;
    
    return {
      temperature: Math.round(temperature * 10) / 10,
      humidity: Math.round(humidity),
      windSpeed: Math.round(windSpeed * 10) / 10,
      precipitation: Math.round(precipitation * 10) / 10,
      pressure: 1013 + (Math.random() - 0.5) * 40,
      visibility: 10 + Math.random() * 15,
      cloudCover: Math.random() * 100,
      uvIndex: Math.max(0, Math.min(11, 5 + Math.random() * 6)),
      location: { lat, lon },
      date: date,
      source: 'mock_data'
    };
  }

  /**
   * Get historical weather data
   */
  async getHistoricalData(lat, lon, startDate, endDate) {
    const data = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      data.push(await this.getWeatherAnalysis(lat, lon, dateStr));
    }
    
    return data;
  }

  /**
   * Get current weather conditions using NASA APIs
   */
  async getCurrentWeather(lat, lon) {
    const today = new Date().toISOString().split('T')[0];
    return await this.getWeatherAnalysis(lat, lon, today);
  }

  /**
   * Get historical weather data for probability calculations
   */
  async getHistoricalData(lat, lon, years = 15) {
    try {
      console.log(`📊 Fetching ${years} years of NASA historical data...`);
      return await this.nasaPower.getHistoricalData(lat, lon, years);
    } catch (error) {
      console.error('Historical data error:', error);
      // Fallback to simulated historical data
      return this.generateSimulatedHistoricalData(lat, lon, years);
    }
  }

  /**
   * Get agricultural insights using NASA Earthdata
   */
  async getAgriculturalInsights(lat, lon, startDate, endDate, cropType = 'general') {
    try {
      return await this.nasaEarthdata.getAgriculturalInsights(lat, lon, startDate, endDate, cropType);
    } catch (error) {
      console.error('Agricultural insights error:', error);
      throw error;
    }
  }

  /**
   * Combine data from multiple NASA sources for enhanced analysis
   */
  combineNasaDataSources(weatherAnalysis) {
    const enhanced = {
      dataIntegration: {
        nasaPowerAvailable: !!weatherAnalysis.daily && Object.keys(weatherAnalysis.daily).length > 0,
        gpmPrecipitationAvailable: !!weatherAnalysis.precipitation,
        smapSoilMoistureAvailable: !!weatherAnalysis.soilMoisture,
        spaceWeatherAvailable: !!weatherAnalysis.spaceWeather
      },
      crossValidation: {},
      enhancedMetrics: {},
      confidence: 'high'
    };

    try {
      // Cross-validate precipitation data between NASA POWER and GPM
      if (enhanced.dataIntegration.nasaPowerAvailable && enhanced.dataIntegration.gpmPrecipitationAvailable) {
        enhanced.crossValidation.precipitation = this.validatePrecipitationData(
          weatherAnalysis.daily.PRECTOTCORR,
          weatherAnalysis.precipitation.data
        );
      }

      // Combine soil moisture with precipitation for drought/flood analysis
      if (enhanced.dataIntegration.gpmPrecipitationAvailable && enhanced.dataIntegration.smapSoilMoistureAvailable) {
        enhanced.enhancedMetrics.soilWaterBalance = this.calculateSoilWaterBalance(
          weatherAnalysis.precipitation.data,
          weatherAnalysis.soilMoisture.data
        );
      }

      // Factor in space weather effects on atmospheric conditions
      if (enhanced.dataIntegration.spaceWeatherAvailable) {
        enhanced.enhancedMetrics.atmosphericConditions = this.analyzeSpaceWeatherImpact(
          weatherAnalysis.spaceWeather,
          weatherAnalysis.daily
        );
      }

      // Calculate overall data confidence
      const availableSources = Object.values(enhanced.dataIntegration).filter(Boolean).length;
      if (availableSources >= 3) {
        enhanced.confidence = 'very_high';
      } else if (availableSources >= 2) {
        enhanced.confidence = 'high';
      } else if (availableSources >= 1) {
        enhanced.confidence = 'medium';
      } else {
        enhanced.confidence = 'low';
      }

      return enhanced;

    } catch (error) {
      console.error('Enhanced analysis error:', error);
      enhanced.confidence = 'low';
      enhanced.error = error.message;
      return enhanced;
    }
  }

  /**
   * Validate precipitation data between NASA POWER and GPM
   */
  validatePrecipitationData(powerPrecip, gpmPrecip) {
    if (!powerPrecip || !gpmPrecip) return null;

    const validation = {
      correlation: 0,
      averageDifference: 0,
      agreement: 'unknown'
    };

    try {
      const commonDates = Object.keys(powerPrecip).filter(date => gpmPrecip[date]);
      
      if (commonDates.length > 0) {
        const powerValues = commonDates.map(date => powerPrecip[date] || 0);
        const gpmValues = commonDates.map(date => gpmPrecip[date].precipitation || 0);
        
        // Calculate correlation
        validation.correlation = this.calculateCorrelation(powerValues, gpmValues);
        
        // Calculate average difference
        const differences = powerValues.map((val, i) => Math.abs(val - gpmValues[i]));
        validation.averageDifference = differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
        
        // Determine agreement level
        if (validation.correlation > 0.7) {
          validation.agreement = 'excellent';
        } else if (validation.correlation > 0.5) {
          validation.agreement = 'good';
        } else if (validation.correlation > 0.3) {
          validation.agreement = 'moderate';
        } else {
          validation.agreement = 'poor';
        }
      }

      return validation;

    } catch (error) {
      console.error('Precipitation validation error:', error);
      return validation;
    }
  }

  /**
   * Calculate soil water balance using precipitation and soil moisture
   */
  calculateSoilWaterBalance(precipData, soilData) {
    const balance = {
      waterSurplus: 0,
      waterDeficit: 0,
      balanceStatus: 'neutral',
      recommendations: []
    };

    try {
      const dates = Object.keys(precipData).filter(date => soilData[date]);
      
      if (dates.length === 0) return balance;

      let totalPrecip = 0;
      let avgSoilMoisture = 0;

      dates.forEach(date => {
        totalPrecip += precipData[date].precipitation || 0;
        avgSoilMoisture += soilData[date].soilMoisture || 0;
      });

      avgSoilMoisture /= dates.length;
      const avgDailyPrecip = totalPrecip / dates.length;

      // Simple water balance calculation
      if (avgSoilMoisture > 0.35 && avgDailyPrecip > 5) {
        balance.waterSurplus = (avgSoilMoisture - 0.35) * 100;
        balance.balanceStatus = 'surplus';
        balance.recommendations.push('Excess water conditions - monitor for flooding');
      } else if (avgSoilMoisture < 0.15 && avgDailyPrecip < 2) {
        balance.waterDeficit = (0.15 - avgSoilMoisture) * 100;
        balance.balanceStatus = 'deficit';
        balance.recommendations.push('Water deficit conditions - irrigation recommended');
      } else {
        balance.balanceStatus = 'balanced';
        balance.recommendations.push('Water conditions are balanced');
      }

      return balance;

    } catch (error) {
      console.error('Soil water balance error:', error);
      return balance;
    }
  }

  /**
   * Analyze space weather impact on atmospheric conditions
   */
  analyzeSpaceWeatherImpact(spaceWeatherData, dailyWeatherData) {
    const impact = {
      level: 'minimal',
      effects: [],
      confidence: 'medium'
    };

    try {
      if (!spaceWeatherData || !spaceWeatherData.events) return impact;

      const eventCount = spaceWeatherData.events.length;
      
      if (eventCount > 5) {
        impact.level = 'high';
        impact.effects.push('Increased atmospheric ionization');
        impact.effects.push('Potential impact on precipitation patterns');
      } else if (eventCount > 2) {
        impact.level = 'moderate';
        impact.effects.push('Minor atmospheric disturbances');
      } else {
        impact.level = 'minimal';
        impact.effects.push('Normal atmospheric conditions');
      }

      return impact;

    } catch (error) {
      console.error('Space weather analysis error:', error);
      return impact;
    }
  }

  /**
   * Calculate correlation coefficient
   */
  calculateCorrelation(x, y) {
    const n = x.length;
    if (n !== y.length || n === 0) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Format date for NASA POWER API (YYYYMMDD)
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * Format date with dashes (YYYY-MM-DD)
   */
  formatDateDash(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Generate simulated historical data as fallback
   */
  generateSimulatedHistoricalData(lat, lon, years) {
    console.log('🔄 Generating simulated NASA historical data...');
    
    const data = {
      daily: {},
      metadata: {
        source: 'NASA APIs (simulated)',
        years: years,
        location: { lat, lon },
        note: 'Simulated data based on NASA methodologies'
      }
    };

    // Generate realistic historical patterns
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - years; year < currentYear; year++) {
      for (let month = 0; month < 12; month++) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day);
          const dateStr = this.formatDateDash(date);
          
          const mockDay = this.getMockWeatherData(lat, lon, dateStr);
          Object.keys(mockDay).forEach(param => {
            if (!data.daily[param]) data.daily[param] = {};
            data.daily[param][dateStr] = mockDay[param];
          });
        }
      }
    }

    return data;
  }
}

// Export singleton instance
const weatherService = new WeatherApiService();
export default weatherService;
