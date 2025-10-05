/**
 * NASA Earthdata Service
 * Global Precipitation Measurement (GPM) / IMERG for precipitation data
 * Soil Moisture Active Passive (SMAP) for soil moisture data
 */

class NasaEarthdataService {
  constructor() {
    // NASA Earthdata endpoints
    this.gpmBaseUrl = 'https://gpm1.gesdisc.eosdis.nasa.gov/data';
    this.smapBaseUrl = 'https://n5eil01u.ecs.nsidc.org/SMAP';
    
    // For demo purposes, we'll use publicly available summary APIs
    // In production, you would need Earthdata credentials
    this.publicApiUrl = 'https://disc.gsfc.nasa.gov/service/subset';
    
    // GPM IMERG parameters
    this.gpmParameters = {
      precipitation: 'precipitationCal', // Calibrated precipitation
      precipitationError: 'precipitationCal_cnt', // Precipitation count/quality
      probabilityLiquid: 'probabilityLiquidPrecipitation' // Probability of liquid precipitation
    };
    
    // SMAP parameters
    this.smapParameters = {
      soilMoisture: 'soil_moisture', // Surface soil moisture
      soilMoistureError: 'soil_moisture_error', // Soil moisture uncertainty
      vegetationWaterContent: 'vegetation_water_content', // Vegetation water content
      surfaceFlag: 'surface_flag' // Surface condition flag
    };
  }

  /**
   * Get GPM IMERG precipitation data for a location and date range
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise} GPM precipitation data
   */
  async getGpmPrecipitationData(lat, lon, startDate, endDate) {
    try {
      // For demo, we'll simulate GPM data based on location and season
      // In production, this would make actual API calls to NASA Earthdata
      
      console.log('Fetching GPM IMERG precipitation data...');
      
      const precipitationData = await this.simulateGpmData(lat, lon, startDate, endDate);
      
      return {
        source: 'NASA GPM IMERG',
        location: { lat, lon },
        dateRange: { startDate, endDate },
        data: precipitationData,
        metadata: {
          resolution: '0.1° x 0.1°',
          temporalResolution: '30 minutes',
          units: 'mm/hr',
          algorithm: 'IMERG V06',
          description: 'Global Precipitation Measurement mission data'
        }
      };

    } catch (error) {
      console.error('GPM data fetch error:', error);
      throw new Error(`Failed to fetch GPM data: ${error.message}`);
    }
  }

  /**
   * Get SMAP soil moisture data for a location and date range
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise} SMAP soil moisture data
   */
  async getSmapSoilMoistureData(lat, lon, startDate, endDate) {
    try {
      console.log('Fetching SMAP soil moisture data...');
      
      const soilMoistureData = await this.simulateSmapData(lat, lon, startDate, endDate);
      
      return {
        source: 'NASA SMAP',
        location: { lat, lon },
        dateRange: { startDate, endDate },
        data: soilMoistureData,
        metadata: {
          resolution: '36 km',
          temporalResolution: '2-3 days',
          units: 'cm³/cm³',
          frequency: 'L-band (1.41 GHz)',
          description: 'Soil Moisture Active Passive mission data'
        }
      };

    } catch (error) {
      console.error('SMAP data fetch error:', error);
      throw new Error(`Failed to fetch SMAP data: ${error.message}`);
    }
  }

  /**
   * Get combined precipitation and soil moisture analysis
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise} Combined analysis
   */
  async getCombinedAnalysis(lat, lon, startDate, endDate) {
    try {
      const [gpmData, smapData] = await Promise.all([
        this.getGpmPrecipitationData(lat, lon, startDate, endDate),
        this.getSmapSoilMoistureData(lat, lon, startDate, endDate)
      ]);

      return {
        precipitation: gpmData,
        soilMoisture: smapData,
        analysis: this.analyzePrecipitationSoilRelationship(gpmData.data, smapData.data),
        metadata: {
          combinedSources: ['NASA GPM IMERG', 'NASA SMAP'],
          analysisDate: new Date().toISOString(),
          location: { lat, lon }
        }
      };

    } catch (error) {
      console.error('Combined analysis error:', error);
      throw error;
    }
  }

  /**
   * Simulate GPM IMERG precipitation data (for demo purposes)
   * In production, this would make actual API calls
   */
  async simulateGpmData(lat, lon, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const data = {};

    // Simulate realistic precipitation patterns based on location
    const isTropical = Math.abs(lat) < 23.5;
    const isCoastal = Math.abs(lon) % 10 < 3; // Rough approximation
    const isMonsoonal = (lat > 5 && lat < 30 && lon > 70 && lon < 140); // Asia monsoon region

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const month = d.getMonth();
      
      // Base precipitation probability
      let precipProb = 0.3;
      
      // Tropical regions have higher precipitation
      if (isTropical) precipProb += 0.3;
      
      // Coastal areas have more precipitation
      if (isCoastal) precipProb += 0.2;
      
      // Seasonal variations
      if (isMonsoonal) {
        // Monsoon season (June-September)
        if (month >= 5 && month <= 8) precipProb += 0.4;
        else precipProb -= 0.2;
      }
      
      // Northern hemisphere winter/summer patterns
      if (lat > 0) {
        if (month >= 5 && month <= 8) precipProb += 0.1; // Summer
        else precipProb -= 0.1; // Winter
      } else {
        if (month >= 11 || month <= 2) precipProb += 0.1; // Summer (Southern)
        else precipProb -= 0.1; // Winter (Southern)
      }
      
      // Generate precipitation value
      const hasRain = Math.random() < Math.max(0.1, Math.min(0.8, precipProb));
      const intensity = hasRain ? Math.random() * 15 + 0.5 : 0; // 0.5-15.5 mm/hr
      
      data[dateStr] = {
        precipitation: Math.round(intensity * 100) / 100,
        precipitationQuality: hasRain ? Math.random() * 0.3 + 0.7 : 1.0, // Quality flag
        probabilityLiquid: hasRain ? Math.random() * 0.2 + 0.8 : 0.1 // Probability it's liquid
      };
    }

    return data;
  }

  /**
   * Simulate SMAP soil moisture data (for demo purposes)
   */
  async simulateSmapData(lat, lon, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const data = {};

    // Simulate realistic soil moisture patterns
    const isArid = Math.abs(lat) > 30 && (lon < -100 || (lon > 20 && lon < 50)); // Rough arid regions
    const isTropical = Math.abs(lat) < 23.5;
    
    // Base soil moisture (0.0 - 0.5 cm³/cm³)
    let baseMoisture = 0.25;
    if (isArid) baseMoisture = 0.15;
    if (isTropical) baseMoisture = 0.35;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const month = d.getMonth();
      
      // Seasonal variation
      let seasonalFactor = 1.0;
      if (lat > 0) {
        // Northern hemisphere - higher moisture in summer
        seasonalFactor = 0.8 + 0.4 * Math.sin((month - 3) * Math.PI / 6);
      } else {
        // Southern hemisphere - higher moisture in their summer
        seasonalFactor = 0.8 + 0.4 * Math.sin((month - 9) * Math.PI / 6);
      }
      
      const moisture = baseMoisture * seasonalFactor * (0.8 + Math.random() * 0.4);
      const error = moisture * 0.1 * Math.random(); // 10% uncertainty
      
      data[dateStr] = {
        soilMoisture: Math.round(moisture * 1000) / 1000,
        soilMoistureError: Math.round(error * 1000) / 1000,
        vegetationWaterContent: Math.round((moisture * 2 + Math.random()) * 100) / 100,
        surfaceFlag: Math.random() > 0.9 ? 1 : 0 // Occasional surface issues
      };
    }

    return data;
  }

  /**
   * Analyze relationship between precipitation and soil moisture
   */
  analyzePrecipitationSoilRelationship(precipData, soilData) {
    const analysis = {
      correlation: 0,
      droughtRisk: 'low',
      floodRisk: 'low',
      soilSaturation: 'normal',
      recommendations: []
    };

    try {
      const dates = Object.keys(precipData).filter(date => soilData[date]);
      
      if (dates.length === 0) return analysis;

      // Calculate averages
      const avgPrecip = dates.reduce((sum, date) => sum + precipData[date].precipitation, 0) / dates.length;
      const avgSoil = dates.reduce((sum, date) => sum + soilData[date].soilMoisture, 0) / dates.length;

      // Simple correlation calculation
      let correlation = 0;
      if (dates.length > 1) {
        const precipValues = dates.map(date => precipData[date].precipitation);
        const soilValues = dates.map(date => soilData[date].soilMoisture);
        correlation = this.calculateCorrelation(precipValues, soilValues);
      }

      analysis.correlation = Math.round(correlation * 100) / 100;

      // Risk assessments
      if (avgSoil < 0.1) {
        analysis.droughtRisk = 'high';
        analysis.soilSaturation = 'very_dry';
        analysis.recommendations.push('High drought risk - consider irrigation');
      } else if (avgSoil < 0.2) {
        analysis.droughtRisk = 'medium';
        analysis.soilSaturation = 'dry';
        analysis.recommendations.push('Moderate drought risk - monitor soil moisture');
      }

      if (avgPrecip > 10) {
        analysis.floodRisk = 'high';
        analysis.recommendations.push('High precipitation - flood risk possible');
      } else if (avgPrecip > 5) {
        analysis.floodRisk = 'medium';
        analysis.recommendations.push('Moderate precipitation - monitor drainage');
      }

      if (avgSoil > 0.4) {
        analysis.soilSaturation = 'saturated';
        analysis.recommendations.push('Soil near saturation - good for crops but watch for waterlogging');
      }

      return analysis;

    } catch (error) {
      console.error('Analysis error:', error);
      return analysis;
    }
  }

  /**
   * Calculate correlation coefficient between two arrays
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
   * Get agricultural insights combining precipitation and soil moisture
   */
  async getAgriculturalInsights(lat, lon, startDate, endDate, cropType = 'general') {
    try {
      const combinedData = await this.getCombinedAnalysis(lat, lon, startDate, endDate);
      
      const insights = {
        cropSuitability: this.assessCropSuitability(combinedData, cropType),
        irrigationNeeds: this.assessIrrigationNeeds(combinedData),
        plantingRecommendations: this.getPlantingRecommendations(combinedData, cropType),
        riskFactors: this.identifyRiskFactors(combinedData)
      };

      return {
        ...combinedData,
        agriculturalInsights: insights
      };

    } catch (error) {
      console.error('Agricultural insights error:', error);
      throw error;
    }
  }

  /**
   * Assess crop suitability based on water conditions
   */
  assessCropSuitability(data, cropType) {
    const analysis = data.analysis;
    
    const suitability = {
      score: 50, // Base score
      factors: [],
      recommendation: 'moderate'
    };

    // Soil moisture assessment
    if (analysis.soilSaturation === 'very_dry') {
      suitability.score -= 30;
      suitability.factors.push('Very dry soil conditions');
    } else if (analysis.soilSaturation === 'dry') {
      suitability.score -= 15;
      suitability.factors.push('Dry soil conditions');
    } else if (analysis.soilSaturation === 'saturated') {
      suitability.score += 20;
      suitability.factors.push('Good soil moisture');
    }

    // Precipitation assessment
    const avgPrecip = Object.values(data.precipitation.data)
      .reduce((sum, day) => sum + day.precipitation, 0) / Object.keys(data.precipitation.data).length;

    if (avgPrecip > 8) {
      suitability.score += 15;
      suitability.factors.push('Adequate rainfall');
    } else if (avgPrecip < 2) {
      suitability.score -= 20;
      suitability.factors.push('Low rainfall');
    }

    // Determine recommendation
    if (suitability.score >= 70) {
      suitability.recommendation = 'excellent';
    } else if (suitability.score >= 60) {
      suitability.recommendation = 'good';
    } else if (suitability.score >= 40) {
      suitability.recommendation = 'moderate';
    } else {
      suitability.recommendation = 'poor';
    }

    return suitability;
  }

  /**
   * Assess irrigation needs
   */
  assessIrrigationNeeds(data) {
    const analysis = data.analysis;
    
    if (analysis.droughtRisk === 'high') {
      return {
        level: 'high',
        frequency: 'daily',
        amount: 'heavy',
        priority: 'urgent'
      };
    } else if (analysis.droughtRisk === 'medium') {
      return {
        level: 'medium',
        frequency: 'every 2-3 days',
        amount: 'moderate',
        priority: 'important'
      };
    } else {
      return {
        level: 'low',
        frequency: 'weekly',
        amount: 'light',
        priority: 'optional'
      };
    }
  }

  /**
   * Get planting recommendations
   */
  getPlantingRecommendations(data, cropType) {
    const analysis = data.analysis;
    const recommendations = [];

    if (analysis.soilSaturation === 'saturated') {
      recommendations.push('Excellent conditions for planting');
      recommendations.push('Consider water-loving crops');
    } else if (analysis.soilSaturation === 'dry') {
      recommendations.push('Consider drought-resistant varieties');
      recommendations.push('Prepare irrigation systems');
    }

    if (analysis.floodRisk === 'high') {
      recommendations.push('Delay planting until flood risk subsides');
      recommendations.push('Consider raised bed planting');
    }

    return recommendations;
  }

  /**
   * Identify risk factors
   */
  identifyRiskFactors(data) {
    const risks = [];
    const analysis = data.analysis;

    if (analysis.droughtRisk === 'high') {
      risks.push({
        type: 'drought',
        severity: 'high',
        description: 'Very low soil moisture levels detected'
      });
    }

    if (analysis.floodRisk === 'high') {
      risks.push({
        type: 'flood',
        severity: 'high',
        description: 'High precipitation levels may cause flooding'
      });
    }

    if (Math.abs(analysis.correlation) < 0.3) {
      risks.push({
        type: 'weather_pattern',
        severity: 'medium',
        description: 'Unusual precipitation-soil moisture relationship detected'
      });
    }

    return risks;
  }
}

export default NasaEarthdataService;
