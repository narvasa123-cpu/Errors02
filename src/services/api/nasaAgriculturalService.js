/**
 * NASA Agricultural Service
 * Combines NASA POWER + GPM + SMAP data for comprehensive agricultural insights
 * Provides planting, irrigation, and harvesting recommendations for Filipino farmers
 */

import NasaPowerService from './nasaPowerService.js';
import NasaEarthdataService from './nasaEarthdataService.js';

class NasaAgriculturalService {
  constructor() {
    this.powerService = new NasaPowerService();
    this.earthdataService = new NasaEarthdataService();
    
    // Philippine crop database with detailed agricultural requirements
    this.cropDatabase = {
      rice: {
        name: 'Rice (Palay)',
        waterNeeds: 'high',
        soilMoistureOptimal: { min: 0.35, max: 0.45 },
        temperatureOptimal: { min: 20, max: 35 },
        plantingSeasons: ['wet', 'dry'],
        growthDuration: 120, // days
        criticalStages: ['transplanting', 'tillering', 'flowering', 'grain_filling'],
        riskFactors: ['flood', 'drought', 'wind', 'heat_stress']
      },
      corn: {
        name: 'Corn (Mais)',
        waterNeeds: 'medium',
        soilMoistureOptimal: { min: 0.25, max: 0.35 },
        temperatureOptimal: { min: 18, max: 32 },
        plantingSeasons: ['wet', 'dry'],
        growthDuration: 90,
        criticalStages: ['planting', 'vegetative', 'tasseling', 'grain_filling'],
        riskFactors: ['drought', 'wind', 'heat_stress']
      },
      sugarcane: {
        name: 'Sugarcane',
        waterNeeds: 'high',
        soilMoistureOptimal: { min: 0.30, max: 0.40 },
        temperatureOptimal: { min: 20, max: 30 },
        plantingSeasons: ['wet'],
        growthDuration: 365,
        criticalStages: ['planting', 'tillering', 'grand_growth', 'maturation'],
        riskFactors: ['drought', 'flood', 'wind']
      },
      coconut: {
        name: 'Coconut',
        waterNeeds: 'medium',
        soilMoistureOptimal: { min: 0.20, max: 0.35 },
        temperatureOptimal: { min: 20, max: 32 },
        plantingSeasons: ['year-round'],
        growthDuration: 2190, // 6 years to maturity
        criticalStages: ['seedling', 'juvenile', 'adult', 'productive'],
        riskFactors: ['wind', 'drought', 'salt_stress']
      },
      banana: {
        name: 'Banana (Saging)',
        waterNeeds: 'high',
        soilMoistureOptimal: { min: 0.30, max: 0.40 },
        temperatureOptimal: { min: 15, max: 35 },
        plantingSeasons: ['year-round'],
        growthDuration: 270,
        criticalStages: ['planting', 'vegetative', 'flowering', 'fruiting'],
        riskFactors: ['wind', 'flood', 'cold_stress']
      },
      vegetables: {
        name: 'Vegetables (Gulay)',
        waterNeeds: 'medium',
        soilMoistureOptimal: { min: 0.25, max: 0.35 },
        temperatureOptimal: { min: 15, max: 30 },
        plantingSeasons: ['dry', 'wet'],
        growthDuration: 60,
        criticalStages: ['planting', 'vegetative', 'flowering', 'harvesting'],
        riskFactors: ['flood', 'heat_stress', 'drought']
      }
    };
  }

  /**
   * Get comprehensive agricultural analysis for a location and crop
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} cropType - Type of crop
   * @param {string} currentStage - Current growth stage
   * @param {string} targetDate - Target date for analysis
   * @returns {Promise<Object>} Complete agricultural analysis
   */
  async getAgriculturalAnalysis(lat, lon, cropType, currentStage, targetDate) {
    try {
      console.log(`Fetching NASA agricultural data for ${cropType} at ${lat}, ${lon}`);
      
      const crop = this.cropDatabase[cropType];
      if (!crop) {
        throw new Error(`Unsupported crop type: ${cropType}`);
      }

      // Calculate date ranges for analysis
      const dates = this.calculateAnalysisDates(targetDate);
      
      // Fetch data from all NASA sources in parallel
      const [powerData, gpmData, smapData] = await Promise.all([
        this.powerService.getWeatherData(lat, lon, dates.startDate, dates.endDate, 'daily'),
        this.earthdataService.getGpmPrecipitationData(lat, lon, dates.startDateISO, dates.endDateISO),
        this.earthdataService.getSmapSoilMoistureData(lat, lon, dates.startDateISO, dates.endDateISO)
      ]);

      // Analyze the data for agricultural insights
      const analysis = this.analyzeAgriculturalConditions(powerData, gpmData, smapData, crop, currentStage);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(analysis, crop, currentStage);
      
      // Calculate risk assessments
      const risks = this.assessAgriculturalRisks(analysis, crop, currentStage);
      
      return {
        location: { lat, lon },
        crop: crop,
        currentStage: currentStage,
        targetDate: targetDate,
        nasaData: {
          power: powerData,
          gpm: gpmData,
          smap: smapData
        },
        analysis: analysis,
        recommendations: recommendations,
        risks: risks,
        metadata: {
          analysisDate: new Date().toISOString(),
          dataSources: ['NASA POWER', 'NASA GPM IMERG', 'NASA SMAP'],
          version: '1.0'
        }
      };

    } catch (error) {
      console.error('Agricultural analysis error:', error);
      throw new Error(`Failed to analyze agricultural conditions: ${error.message}`);
    }
  }

  /**
   * Calculate date ranges for analysis
   */
  calculateAnalysisDates(targetDate) {
    const target = new Date(targetDate);
    const start = new Date(target);
    start.setDate(target.getDate() - 7); // 7 days before
    const end = new Date(target);
    end.setDate(target.getDate() + 7); // 7 days after

    return {
      startDate: this.formatDateForPower(start),
      endDate: this.formatDateForPower(end),
      startDateISO: start.toISOString().split('T')[0],
      endDateISO: end.toISOString().split('T')[0]
    };
  }

  /**
   * Format date for NASA POWER API
   */
  formatDateForPower(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * Analyze agricultural conditions from NASA data
   */
  analyzeAgriculturalConditions(powerData, gpmData, smapData, crop, currentStage) {
    const analysis = {
      temperature: this.analyzeTemperature(powerData.daily, crop),
      precipitation: this.analyzePrecipitation(gpmData.data, crop),
      soilMoisture: this.analyzeSoilMoisture(smapData.data, crop),
      solarRadiation: this.analyzeSolarRadiation(powerData.daily, crop),
      humidity: this.analyzeHumidity(powerData.daily, crop),
      windConditions: this.analyzeWind(powerData.daily, crop),
      overallConditions: 'calculating...'
    };

    // Calculate overall conditions score
    analysis.overallConditions = this.calculateOverallScore(analysis);
    
    return analysis;
  }

  /**
   * Analyze temperature conditions
   */
  analyzeTemperature(dailyData, crop) {
    if (!dailyData.T2M) return { status: 'no_data', score: 0 };

    const temperatures = Object.values(dailyData.T2M);
    const avgTemp = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);

    let score = 50;
    let status = 'moderate';
    const issues = [];

    // Check against crop optimal range
    if (avgTemp >= crop.temperatureOptimal.min && avgTemp <= crop.temperatureOptimal.max) {
      score += 30;
      status = 'optimal';
    } else if (avgTemp < crop.temperatureOptimal.min - 5 || avgTemp > crop.temperatureOptimal.max + 5) {
      score -= 30;
      status = 'poor';
      issues.push(avgTemp < crop.temperatureOptimal.min ? 'Too cold' : 'Too hot');
    } else {
      score -= 10;
      status = 'suboptimal';
    }

    // Check for extreme temperatures
    if (minTemp < 10) {
      issues.push('Risk of cold damage');
      score -= 15;
    }
    if (maxTemp > 40) {
      issues.push('Risk of heat stress');
      score -= 15;
    }

    return {
      status,
      score: Math.max(0, Math.min(100, score)),
      avgTemperature: Math.round(avgTemp * 10) / 10,
      minTemperature: Math.round(minTemp * 10) / 10,
      maxTemperature: Math.round(maxTemp * 10) / 10,
      optimal: crop.temperatureOptimal,
      issues
    };
  }

  /**
   * Analyze precipitation conditions
   */
  analyzePrecipitation(gpmData, crop) {
    if (!gpmData || Object.keys(gpmData).length === 0) {
      return { status: 'no_data', score: 0 };
    }

    const precipValues = Object.values(gpmData).map(day => day.precipitation);
    const totalPrecip = precipValues.reduce((sum, precip) => sum + precip, 0);
    const avgDailyPrecip = totalPrecip / precipValues.length;
    const daysWithRain = precipValues.filter(p => p > 0.1).length;

    let score = 50;
    let status = 'moderate';
    const issues = [];

    // Assess based on crop water needs
    if (crop.waterNeeds === 'high') {
      if (avgDailyPrecip >= 3) {
        score += 25;
        status = 'excellent';
      } else if (avgDailyPrecip < 1) {
        score -= 25;
        status = 'insufficient';
        issues.push('Insufficient rainfall for high water-need crop');
      }
    } else if (crop.waterNeeds === 'medium') {
      if (avgDailyPrecip >= 1.5 && avgDailyPrecip <= 5) {
        score += 20;
        status = 'good';
      } else if (avgDailyPrecip > 8) {
        score -= 15;
        issues.push('Excessive rainfall may cause waterlogging');
      }
    } else { // low water needs
      if (avgDailyPrecip <= 2) {
        score += 15;
        status = 'suitable';
      } else if (avgDailyPrecip > 6) {
        score -= 20;
        issues.push('Too much rain for drought-tolerant crop');
      }
    }

    // Check for extreme conditions
    const maxDailyPrecip = Math.max(...precipValues);
    if (maxDailyPrecip > 15) {
      issues.push('Risk of flooding from heavy rainfall');
      score -= 20;
    }

    return {
      status,
      score: Math.max(0, Math.min(100, score)),
      totalPrecipitation: Math.round(totalPrecip * 10) / 10,
      avgDailyPrecipitation: Math.round(avgDailyPrecip * 10) / 10,
      daysWithRain,
      maxDailyPrecipitation: Math.round(maxDailyPrecip * 10) / 10,
      issues
    };
  }

  /**
   * Analyze soil moisture conditions
   */
  analyzeSoilMoisture(smapData, crop) {
    if (!smapData || Object.keys(smapData).length === 0) {
      return { status: 'no_data', score: 0 };
    }

    const moistureValues = Object.values(smapData).map(day => day.soilMoisture);
    const avgMoisture = moistureValues.reduce((sum, moisture) => sum + moisture, 0) / moistureValues.length;
    const minMoisture = Math.min(...moistureValues);
    const maxMoisture = Math.max(...moistureValues);

    let score = 50;
    let status = 'moderate';
    const issues = [];

    // Check against crop optimal range
    if (avgMoisture >= crop.soilMoistureOptimal.min && avgMoisture <= crop.soilMoistureOptimal.max) {
      score += 35;
      status = 'optimal';
    } else if (avgMoisture < crop.soilMoistureOptimal.min) {
      const deficit = crop.soilMoistureOptimal.min - avgMoisture;
      if (deficit > 0.1) {
        score -= 30;
        status = 'too_dry';
        issues.push('Soil moisture critically low - irrigation needed');
      } else {
        score -= 15;
        status = 'dry';
        issues.push('Soil moisture below optimal - consider irrigation');
      }
    } else {
      const excess = avgMoisture - crop.soilMoistureOptimal.max;
      if (excess > 0.1) {
        score -= 25;
        status = 'waterlogged';
        issues.push('Soil waterlogged - improve drainage');
      } else {
        score -= 10;
        status = 'wet';
        issues.push('Soil moisture high - monitor for waterlogging');
      }
    }

    return {
      status,
      score: Math.max(0, Math.min(100, score)),
      avgSoilMoisture: Math.round(avgMoisture * 1000) / 1000,
      minSoilMoisture: Math.round(minMoisture * 1000) / 1000,
      maxSoilMoisture: Math.round(maxMoisture * 1000) / 1000,
      optimal: crop.soilMoistureOptimal,
      issues
    };
  }

  /**
   * Analyze solar radiation conditions
   */
  analyzeSolarRadiation(dailyData, crop) {
    if (!dailyData.ALLSKY_SFC_SW_DWN) return { status: 'no_data', score: 0 };

    const solarValues = Object.values(dailyData.ALLSKY_SFC_SW_DWN);
    const avgSolar = solarValues.reduce((sum, solar) => sum + solar, 0) / solarValues.length;

    let score = 50;
    let status = 'moderate';
    const issues = [];

    // Assess solar radiation (typical range: 10-30 MJ/m²/day)
    if (avgSolar >= 15 && avgSolar <= 25) {
      score += 20;
      status = 'excellent';
    } else if (avgSolar < 10) {
      score -= 20;
      status = 'insufficient';
      issues.push('Low solar radiation may affect photosynthesis');
    } else if (avgSolar > 30) {
      score -= 15;
      status = 'excessive';
      issues.push('Very high solar radiation - may cause heat stress');
    }

    return {
      status,
      score: Math.max(0, Math.min(100, score)),
      avgSolarRadiation: Math.round(avgSolar * 10) / 10,
      issues
    };
  }

  /**
   * Analyze humidity conditions
   */
  analyzeHumidity(dailyData, crop) {
    if (!dailyData.RH2M) return { status: 'no_data', score: 0 };

    const humidityValues = Object.values(dailyData.RH2M);
    const avgHumidity = humidityValues.reduce((sum, humidity) => sum + humidity, 0) / humidityValues.length;

    let score = 50;
    let status = 'moderate';
    const issues = [];

    // Optimal humidity range: 50-70%
    if (avgHumidity >= 50 && avgHumidity <= 70) {
      score += 15;
      status = 'optimal';
    } else if (avgHumidity < 30) {
      score -= 15;
      status = 'too_dry';
      issues.push('Low humidity may increase water stress');
    } else if (avgHumidity > 85) {
      score -= 20;
      status = 'too_humid';
      issues.push('High humidity increases disease risk');
    }

    return {
      status,
      score: Math.max(0, Math.min(100, score)),
      avgHumidity: Math.round(avgHumidity * 10) / 10,
      issues
    };
  }

  /**
   * Analyze wind conditions
   */
  analyzeWind(dailyData, crop) {
    if (!dailyData.WS2M) return { status: 'no_data', score: 0 };

    const windValues = Object.values(dailyData.WS2M);
    const avgWind = windValues.reduce((sum, wind) => sum + wind, 0) / windValues.length;
    const maxWind = Math.max(...windValues);

    let score = 50;
    let status = 'moderate';
    const issues = [];

    // Assess wind conditions
    if (avgWind <= 5) {
      score += 10;
      status = 'calm';
    } else if (avgWind > 10) {
      score -= 15;
      status = 'windy';
      issues.push('Strong winds may damage crops');
    }

    if (maxWind > 15) {
      score -= 25;
      issues.push('Very strong winds detected - risk of crop damage');
    }

    return {
      status,
      score: Math.max(0, Math.min(100, score)),
      avgWindSpeed: Math.round(avgWind * 10) / 10,
      maxWindSpeed: Math.round(maxWind * 10) / 10,
      issues
    };
  }

  /**
   * Calculate overall conditions score
   */
  calculateOverallScore(analysis) {
    const scores = [
      analysis.temperature.score,
      analysis.precipitation.score,
      analysis.soilMoisture.score,
      analysis.solarRadiation.score,
      analysis.humidity.score,
      analysis.windConditions.score
    ].filter(score => score > 0);

    if (scores.length === 0) return { status: 'no_data', score: 0 };

    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    let status;
    if (avgScore >= 80) status = 'excellent';
    else if (avgScore >= 70) status = 'good';
    else if (avgScore >= 60) status = 'moderate';
    else if (avgScore >= 40) status = 'poor';
    else status = 'very_poor';

    return {
      status,
      score: Math.round(avgScore),
      factors: scores.length
    };
  }

  /**
   * Generate agricultural recommendations
   */
  generateRecommendations(analysis, crop, currentStage) {
    const recommendations = [];

    // Soil moisture recommendations
    if (analysis.soilMoisture.status === 'too_dry') {
      recommendations.push({
        type: 'irrigation',
        priority: 'urgent',
        title: 'Irrigation Needed',
        message: `Soil moisture is ${Math.round(analysis.soilMoisture.avgSoilMoisture * 100)}%, below optimal range. Immediate irrigation recommended.`,
        actions: [
          'Apply irrigation immediately',
          'Monitor soil moisture daily',
          'Consider drip irrigation for efficiency'
        ]
      });
    } else if (analysis.soilMoisture.status === 'waterlogged') {
      recommendations.push({
        type: 'drainage',
        priority: 'high',
        title: 'Improve Drainage',
        message: 'Soil is waterlogged. Improve drainage to prevent root rot.',
        actions: [
          'Create drainage channels',
          'Avoid additional watering',
          'Monitor for signs of root rot'
        ]
      });
    }

    // Temperature recommendations
    if (analysis.temperature.status === 'poor') {
      if (analysis.temperature.avgTemperature > crop.temperatureOptimal.max) {
        recommendations.push({
          type: 'heat_protection',
          priority: 'high',
          title: 'Heat Stress Protection',
          message: 'Temperatures are too high for optimal crop growth.',
          actions: [
            'Provide shade during hottest hours',
            'Increase irrigation frequency',
            'Apply mulch to cool soil'
          ]
        });
      } else {
        recommendations.push({
          type: 'cold_protection',
          priority: 'high',
          title: 'Cold Protection',
          message: 'Temperatures are too low for optimal crop growth.',
          actions: [
            'Use row covers or plastic tunnels',
            'Delay planting if possible',
            'Monitor for frost damage'
          ]
        });
      }
    }

    // Precipitation recommendations
    if (analysis.precipitation.status === 'insufficient') {
      recommendations.push({
        type: 'water_management',
        priority: 'high',
        title: 'Supplement Rainfall',
        message: 'Rainfall is insufficient for crop water needs.',
        actions: [
          'Increase irrigation to compensate',
          'Implement water conservation practices',
          'Consider drought-resistant varieties'
        ]
      });
    }

    // Stage-specific recommendations
    const stageRecommendations = this.getStageSpecificRecommendations(currentStage, analysis, crop);
    recommendations.push(...stageRecommendations);

    // Overall condition recommendations
    if (analysis.overallConditions.score >= 80) {
      recommendations.unshift({
        type: 'optimal',
        priority: 'info',
        title: 'Excellent Growing Conditions',
        message: 'Weather conditions are excellent for your crop. Continue current practices.',
        actions: [
          'Maintain current farming practices',
          'Consider expanding planting area',
          'Monitor for any changes'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Get stage-specific recommendations
   */
  getStageSpecificRecommendations(stage, analysis, crop) {
    const recommendations = [];

    switch (stage) {
      case 'planting':
        if (analysis.soilMoisture.score >= 70 && analysis.temperature.score >= 60) {
          recommendations.push({
            type: 'planting',
            priority: 'info',
            title: 'Good Planting Conditions',
            message: 'Soil and temperature conditions are favorable for planting.',
            actions: ['Proceed with planting as scheduled', 'Ensure proper seed spacing']
          });
        } else {
          recommendations.push({
            type: 'planting',
            priority: 'caution',
            title: 'Consider Delaying Planting',
            message: 'Current conditions may not be optimal for planting.',
            actions: ['Wait for better conditions', 'Prepare soil amendments']
          });
        }
        break;

      case 'flowering':
        if (analysis.temperature.maxTemperature > 35) {
          recommendations.push({
            type: 'flowering',
            priority: 'high',
            title: 'Protect During Flowering',
            message: 'High temperatures during flowering can reduce yield.',
            actions: ['Provide afternoon shade', 'Increase irrigation', 'Monitor pollen viability']
          });
        }
        break;

      case 'harvesting':
        if (analysis.precipitation.daysWithRain > 5) {
          recommendations.push({
            type: 'harvesting',
            priority: 'urgent',
            title: 'Harvest Before Rain',
            message: 'Frequent rain may delay harvest and affect quality.',
            actions: ['Harvest immediately if crops are ready', 'Ensure proper drying facilities']
          });
        }
        break;
    }

    return recommendations;
  }

  /**
   * Assess agricultural risks
   */
  assessAgriculturalRisks(analysis, crop, currentStage) {
    const risks = [];

    // Drought risk
    if (analysis.soilMoisture.score < 40 || analysis.precipitation.score < 30) {
      risks.push({
        type: 'drought',
        severity: analysis.soilMoisture.score < 20 ? 'high' : 'medium',
        probability: 100 - Math.max(analysis.soilMoisture.score, analysis.precipitation.score),
        impact: crop.waterNeeds === 'high' ? 'critical' : 'moderate',
        description: 'Low soil moisture and insufficient rainfall increase drought risk'
      });
    }

    // Flood risk
    if (analysis.precipitation.maxDailyPrecipitation > 10) {
      risks.push({
        type: 'flood',
        severity: analysis.precipitation.maxDailyPrecipitation > 20 ? 'high' : 'medium',
        probability: Math.min(90, analysis.precipitation.maxDailyPrecipitation * 4),
        impact: currentStage === 'planting' ? 'critical' : 'moderate',
        description: 'Heavy rainfall may cause flooding and waterlogging'
      });
    }

    // Heat stress risk
    if (analysis.temperature.maxTemperature > crop.temperatureOptimal.max + 5) {
      risks.push({
        type: 'heat_stress',
        severity: analysis.temperature.maxTemperature > 40 ? 'high' : 'medium',
        probability: Math.min(95, (analysis.temperature.maxTemperature - crop.temperatureOptimal.max) * 10),
        impact: currentStage === 'flowering' ? 'critical' : 'moderate',
        description: 'High temperatures may cause heat stress and reduce yield'
      });
    }

    // Disease risk (high humidity + moderate temperature)
    if (analysis.humidity.avgHumidity > 80 && analysis.temperature.avgTemperature > 20) {
      risks.push({
        type: 'disease',
        severity: 'medium',
        probability: Math.min(80, analysis.humidity.avgHumidity - 50),
        impact: 'moderate',
        description: 'High humidity and warm temperatures favor disease development'
      });
    }

    return risks;
  }
}

export default NasaAgriculturalService;
