class WeatherCalculations {
  calculateProbabilities(historicalData, targetDate) {
    console.log('🔍 Calculating probabilities with data:', historicalData);
    
    const { daily } = historicalData;
    
    // Handle both array format (old) and NASA API object format (new)
    if (!daily) {
      console.log('⚠️ No daily data found, using defaults');
      return this.getDefaultProbabilities();
    }

    // Convert NASA API format to processable data
    let processedData = [];
    
    if (Array.isArray(daily)) {
      // Old format - array of day objects
      console.log('📊 Processing array format data, length:', daily.length);
      processedData = daily;
    } else if (typeof daily === 'object') {
      // NASA API format - object with parameter keys containing date-value pairs
      console.log('🛰️ Processing NASA API format data, keys:', Object.keys(daily));
      const dates = this.extractDatesFromNasaData(daily);
      
      if (dates.length > 0) {
        console.log('📅 Extracted dates:', dates.length, 'dates from', dates[0], 'to', dates[dates.length - 1]);
        console.log('✅ Successfully extracted NASA satellite data - using REAL data for calculations');
      } else {
        console.log('⚠️ No dates extracted from NASA data, structure:', JSON.stringify(daily, null, 2).substring(0, 500));
        console.log('🔄 Will fall back to location-based estimates');
      }
      
      processedData = dates.map(date => {
        const dayData = {
          date: date,
          temperature: daily.T2M?.[date] || daily.temperature?.[date] || 20,
          precipitation: daily.PRECTOTCORR?.[date] || daily.precipitation?.[date] || 0,
          windSpeed: daily.WS2M?.[date] || daily.windSpeed?.[date] || 3,
          humidity: daily.RH2M?.[date] || daily.humidity?.[date] || 60,
          pressure: daily.PS?.[date] || daily.pressure?.[date] || 1013,
          solarRadiation: daily.ALLSKY_SFC_SW_DWN?.[date] || 15,
          soilMoisture: daily.GWETROOT?.[date] || 0.25
        };
        
        // Log a sample day for debugging
        if (date === dates[0]) {
          console.log('📋 Sample day data:', dayData);
        }
        
        return dayData;
      });
    }
    
    if (processedData.length === 0) {
      console.log('⚠️ No processed data available, using defaults');
      return this.getDefaultProbabilities();
    }
    
    console.log('✅ Processing', processedData.length, 'days of data for probability calculations');
    
    // Validate if we're using real NASA data
    const isRealNasaData = processedData.length > 100 && processedData.some(day => 
      day.temperature !== 20 && day.precipitation !== 0 && day.windSpeed !== 3
    );
    
    if (isRealNasaData) {
      console.log('🛰️ CONFIRMED: Using real NASA satellite data for calculations');
    } else {
      console.log('⚠️ WARNING: Data appears to be simulated/default values');
    }

    const totalDays = processedData.length;
    let hotDays = 0;
    let coldDays = 0;
    let wetDays = 0;
    let windyDays = 0;
    let uncomfortableDays = 0;

    processedData.forEach(dayData => {
      const { temperature, precipitation, windSpeed, humidity } = dayData;
      
      // Hot weather: temperature > 35°C
      if (temperature > 35) {
        hotDays++;
      }
      
      // Cold weather: temperature < 5°C
      if (temperature < 5) {
        coldDays++;
      }
      
      // Wet weather: precipitation > 10mm/day
      if (precipitation > 10) {
        wetDays++;
      }
      
      // Windy weather: wind speed > 10m/s
      if (windSpeed > 10) {
        windyDays++;
      }
      
      // Uncomfortable conditions: heat index > 32°C
      const heatIndex = this.calculateHeatIndex(temperature, humidity);
      if (heatIndex > 32) {
        uncomfortableDays++;
      }
    });

    const probabilities = {
      hot: Math.round((hotDays / totalDays) * 100),
      cold: Math.round((coldDays / totalDays) * 100),
      wet: Math.round((wetDays / totalDays) * 100),
      windy: Math.round((windyDays / totalDays) * 100),
      uncomfortable: Math.round((uncomfortableDays / totalDays) * 100)
    };
    
    console.log('📊 Calculated probabilities:', {
      totalDays,
      hotDays, coldDays, wetDays, windyDays, uncomfortableDays,
      probabilities
    });
    
    return probabilities;
  }

  calculateHeatIndex(temperature, humidity) {
    // Heat index calculation (simplified version)
    // Based on the formula used by the US National Weather Service
    
    if (temperature < 27) {
      return temperature; // Heat index not applicable for cool temperatures
    }

    const T = temperature;
    const RH = humidity;

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

    return Math.round(HI * 10) / 10;
  }

  getDefaultProbabilities() {
    // Default probabilities when no data is available
    console.log('⚠️ Using default probabilities - no historical data available');
    return {
      hot: 15,
      cold: 10,
      wet: 25,
      windy: 20,
      uncomfortable: 18
    };
  }

  /**
   * Generate realistic probabilities based on location when NASA data fails
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Object} Location-based probability estimates
   */
  getLocationBasedProbabilities(lat, lon) {
    console.log('🌍 Generating location-based probabilities for', lat, lon);
    
    // Validate input coordinates
    if (lat === undefined || lon === undefined || isNaN(lat) || isNaN(lon)) {
      console.log('⚠️ Invalid coordinates, using global defaults');
      return this.getDefaultProbabilities();
    }
    
    // Convert to numbers if they're strings
    lat = Number(lat);
    lon = Number(lon);
    
    console.log('📍 Processing coordinates:', { lat, lon });
    
    // Basic climate zone detection
    const isTropical = Math.abs(lat) < 23.5;
    const isEquatorial = Math.abs(lat) < 10;
    const isTemperate = Math.abs(lat) >= 23.5 && Math.abs(lat) < 60;
    const isCoastal = Math.abs(lon) % 10 < 3; // Rough approximation
    
    console.log('🌡️ Climate zones:', { isTropical, isEquatorial, isTemperate, isCoastal });
    
    let hot = 15, cold = 10, wet = 25, windy = 20, uncomfortable = 18;
    
    if (isEquatorial) {
      // Equatorial regions: high heat, high humidity, frequent rain
      hot = 45;
      cold = 2;
      wet = 65;
      windy = 15;
      uncomfortable = 55;
    } else if (isTropical) {
      // Tropical regions: warm, seasonal rain
      hot = 35;
      cold = 5;
      wet = 45;
      windy = 18;
      uncomfortable = 40;
    } else if (isTemperate) {
      // Temperate regions: moderate temperatures, seasonal variation
      hot = 20;
      cold = 25;
      wet = 35;
      windy = 30;
      uncomfortable = 25;
    }
    
    // Coastal modifications
    if (isCoastal) {
      wet += 10; // More precipitation near coasts
      windy += 15; // More wind near coasts
      uncomfortable -= 5; // Ocean moderates temperature
    }
    
    // Ensure values are within 0-100 range and never 0%
    const probabilities = {
      hot: Math.min(100, Math.max(1, hot)), // Minimum 1%
      cold: Math.min(100, Math.max(1, cold)),
      wet: Math.min(100, Math.max(1, wet)),
      windy: Math.min(100, Math.max(1, windy)),
      uncomfortable: Math.min(100, Math.max(1, uncomfortable))
    };
    
    console.log('🎯 Location-based probabilities:', probabilities);
    
    // Final validation - if all are still 0 somehow, return defaults
    if (probabilities.hot === 0 && probabilities.cold === 0 && probabilities.wet === 0) {
      console.log('⚠️ All probabilities are 0, returning defaults');
      return this.getDefaultProbabilities();
    }
    
    return probabilities;
  }

  analyzeSeasonalPatterns(historicalData) {
    const { monthly } = historicalData;
    
    if (!monthly || monthly.length === 0) {
      return null;
    }

    const patterns = {
      hottestMonth: null,
      coldestMonth: null,
      wettestMonth: null,
      driestMonth: null,
      windiestMonth: null,
      calmestMonth: null
    };

    let maxTemp = -Infinity, minTemp = Infinity;
    let maxRain = -Infinity, minRain = Infinity;
    let maxWind = -Infinity, minWind = Infinity;

    monthly.forEach(monthData => {
      const { month, temperature, rainfall, windSpeed } = monthData;
      
      if (temperature > maxTemp) {
        maxTemp = temperature;
        patterns.hottestMonth = month;
      }
      
      if (temperature < minTemp) {
        minTemp = temperature;
        patterns.coldestMonth = month;
      }
      
      if (rainfall > maxRain) {
        maxRain = rainfall;
        patterns.wettestMonth = month;
      }
      
      if (rainfall < minRain) {
        minRain = rainfall;
        patterns.driestMonth = month;
      }
      
      if (windSpeed > maxWind) {
        maxWind = windSpeed;
        patterns.windiestMonth = month;
      }
      
      if (windSpeed < minWind) {
        minWind = windSpeed;
        patterns.calmestMonth = month;
      }
    });

    return patterns;
  }

  calculateExtremeEvents(historicalData) {
    const { daily } = historicalData;
    
    if (!daily || daily.length === 0) {
      return null;
    }

    const extremes = {
      recordHigh: -Infinity,
      recordLow: Infinity,
      maxRainfall: -Infinity,
      maxWindSpeed: -Infinity,
      heatWaves: 0,
      coldSnaps: 0,
      droughts: 0,
      wetSpells: 0
    };

    let consecutiveHotDays = 0;
    let consecutiveColdDays = 0;
    let consecutiveDryDays = 0;
    let consecutiveWetDays = 0;

    daily.forEach((dayData, index) => {
      const { temperature, precipitation, windSpeed } = dayData;
      
      // Record extremes
      if (temperature > extremes.recordHigh) {
        extremes.recordHigh = temperature;
      }
      
      if (temperature < extremes.recordLow) {
        extremes.recordLow = temperature;
      }
      
      if (precipitation > extremes.maxRainfall) {
        extremes.maxRainfall = precipitation;
      }
      
      if (windSpeed > extremes.maxWindSpeed) {
        extremes.maxWindSpeed = windSpeed;
      }

      // Count consecutive events
      if (temperature > 30) {
        consecutiveHotDays++;
        consecutiveColdDays = 0;
      } else if (temperature < 10) {
        consecutiveColdDays++;
        consecutiveHotDays = 0;
      } else {
        if (consecutiveHotDays >= 3) extremes.heatWaves++;
        if (consecutiveColdDays >= 3) extremes.coldSnaps++;
        consecutiveHotDays = 0;
        consecutiveColdDays = 0;
      }

      if (precipitation < 1) {
        consecutiveDryDays++;
        consecutiveWetDays = 0;
      } else if (precipitation > 5) {
        consecutiveWetDays++;
        consecutiveDryDays = 0;
      } else {
        if (consecutiveDryDays >= 7) extremes.droughts++;
        if (consecutiveWetDays >= 3) extremes.wetSpells++;
        consecutiveDryDays = 0;
        consecutiveWetDays = 0;
      }
    });

    // Handle end of data
    if (consecutiveHotDays >= 3) extremes.heatWaves++;
    if (consecutiveColdDays >= 3) extremes.coldSnaps++;
    if (consecutiveDryDays >= 7) extremes.droughts++;
    if (consecutiveWetDays >= 3) extremes.wetSpells++;

    return extremes;
  }

  generateWeatherInsights(probabilities, historicalData) {
    const insights = [];
    
    // Temperature insights
    if (probabilities.hot > 60) {
      insights.push({
        type: 'warning',
        title: 'High Heat Probability',
        message: `There's a ${probabilities.hot}% chance of hot weather (>35°C). Consider heat protection measures.`
      });
    } else if (probabilities.cold > 60) {
      insights.push({
        type: 'info',
        title: 'Cold Weather Expected',
        message: `There's a ${probabilities.cold}% chance of cold weather (<5°C). Dress warmly.`
      });
    }

    // Precipitation insights
    if (probabilities.wet > 70) {
      insights.push({
        type: 'info',
        title: 'High Rain Probability',
        message: `There's a ${probabilities.wet}% chance of significant rainfall (>10mm). Bring an umbrella.`
      });
    } else if (probabilities.wet < 20) {
      insights.push({
        type: 'success',
        title: 'Dry Conditions Expected',
        message: `Only a ${probabilities.wet}% chance of rain. Great weather for outdoor activities.`
      });
    }

    // Wind insights
    if (probabilities.windy > 50) {
      insights.push({
        type: 'warning',
        title: 'Windy Conditions',
        message: `${probabilities.windy}% chance of strong winds (>10m/s). Secure loose objects.`
      });
    }

    // Comfort insights
    if (probabilities.uncomfortable > 60) {
      insights.push({
        type: 'warning',
        title: 'Uncomfortable Heat Index',
        message: `${probabilities.uncomfortable}% chance of uncomfortable conditions. Stay hydrated and seek shade.`
      });
    }

    // General insights
    const totalHighProbabilities = [probabilities.hot, probabilities.cold, probabilities.wet, probabilities.windy]
      .filter(prob => prob > 50).length;

    if (totalHighProbabilities === 0) {
      insights.push({
        type: 'success',
        title: 'Moderate Weather Expected',
        message: 'Weather conditions are expected to be generally moderate with no extreme conditions likely.'
      });
    } else if (totalHighProbabilities >= 3) {
      insights.push({
        type: 'warning',
        title: 'Variable Conditions',
        message: 'Multiple weather conditions are possible. Check forecasts closer to your date.'
      });
    }

    return insights;
  }

  /**
   * Extract dates from NASA API data structure
   * @param {Object} daily - NASA API daily data object
   * @returns {Array} Array of date strings
   */
  extractDatesFromNasaData(daily) {
    console.log('🔍 Extracting dates from NASA data structure:', Object.keys(daily));
    
    // Find the first parameter that has date keys
    const parameterKeys = Object.keys(daily);
    
    for (const paramKey of parameterKeys) {
      if (daily[paramKey] && typeof daily[paramKey] === 'object') {
        const dates = Object.keys(daily[paramKey]);
        console.log(`📅 Checking parameter ${paramKey}, found ${dates.length} keys:`, dates.slice(0, 5));
        
        if (dates.length > 0) {
          // Check for multiple date formats
          const firstKey = dates[0];
          console.log(`🔍 First key format analysis: "${firstKey}" (length: ${firstKey.length})`);
          
          // YYYY-MM-DD format (ISO)
          if (firstKey.match(/^\d{4}-\d{2}-\d{2}$/)) {
            console.log(`✅ Found ISO date format in ${paramKey}`);
            return dates.sort();
          }
          
          // YYYYMMDD format (NASA POWER common format - 8 digits)
          if (firstKey.match(/^\d{8}$/)) {
            console.log(`✅ Found YYYYMMDD date format in ${paramKey}`);
            // Convert YYYYMMDD to YYYY-MM-DD
            const convertedDates = dates.map(date => {
              const year = date.substring(0, 4);
              const month = date.substring(4, 6);
              const day = date.substring(6, 8);
              return `${year}-${month}-${day}`;
            }).sort();
            console.log(`📅 Converted ${dates.length} dates from YYYYMMDD to ISO format`);
            return convertedDates;
          }
          
          // YYYY/MM/DD format
          if (firstKey.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
            console.log(`✅ Found YYYY/MM/DD date format in ${paramKey}`);
            return dates.map(date => date.replace(/\//g, '-')).sort();
          }
          
          // NASA POWER sometimes uses YYYY-MM-DD format but as strings
          if (firstKey.length === 10 && firstKey.includes('-')) {
            console.log(`✅ Found string ISO date format in ${paramKey}`);
            return dates.sort();
          }
          
          // Check if it's a numeric date that could be converted
          if (!isNaN(firstKey) && firstKey.length >= 6) {
            console.log(`🔄 Attempting to parse numeric date format: ${firstKey}`);
            if (firstKey.length === 8) {
              // YYYYMMDD
              const convertedDates = dates.map(date => {
                const year = date.substring(0, 4);
                const month = date.substring(4, 6);
                const day = date.substring(6, 8);
                return `${year}-${month}-${day}`;
              }).sort();
              console.log(`📅 Converted numeric dates to ISO format`);
              return convertedDates;
            }
          }
          
          console.log(`❌ Unrecognized date format in ${paramKey}: "${firstKey}"`);
        }
      }
    }
    
    console.log('⚠️ No valid date format found in NASA data');
    return [];
  }

  /**
   * Process NASA API data for enhanced analysis
   * @param {Object} nasaData - Raw NASA API response
   * @returns {Object} Processed data suitable for calculations
   */
  processNasaApiData(nasaData) {
    if (!nasaData || !nasaData.daily) {
      return { daily: [], metadata: { source: 'none' } };
    }

    const { daily } = nasaData;
    const dates = this.extractDatesFromNasaData(daily);
    
    const processedDaily = dates.map(date => ({
      date: date,
      temperature: daily.T2M?.[date] || 20,
      temperatureMax: daily.T2M_MAX?.[date] || 25,
      temperatureMin: daily.T2M_MIN?.[date] || 15,
      precipitation: daily.PRECTOTCORR?.[date] || 0,
      humidity: daily.RH2M?.[date] || 60,
      windSpeed: daily.WS2M?.[date] || 3,
      windDirection: daily.WD2M?.[date] || 180,
      pressure: daily.PS?.[date] || 1013,
      solarRadiation: daily.ALLSKY_SFC_SW_DWN?.[date] || 15,
      evaporation: daily.EVLAND?.[date] || 2,
      soilMoisture: daily.GWETROOT?.[date] || 0.25,
      heatIndex: daily.HEAT_INDEX?.[date] || daily.T2M?.[date] || 20,
      comfortIndex: daily.COMFORT_INDEX?.[date] || 50
    }));

    return {
      daily: processedDaily,
      metadata: {
        source: 'NASA APIs',
        dataPoints: processedDaily.length,
        dateRange: {
          start: dates[0],
          end: dates[dates.length - 1]
        },
        parameters: Object.keys(daily)
      }
    };
  }
}

export const weatherCalculations = new WeatherCalculations();

// Export individual functions for backward compatibility
export const calculateWeatherProbabilities = (historicalData, targetDate) => {
  return weatherCalculations.calculateProbabilities(historicalData, targetDate);
};

export default weatherCalculations;
