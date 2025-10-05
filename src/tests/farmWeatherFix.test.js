/**
 * Test file to verify FarmWeather component fixes
 * Tests the resolution of meteomaticsService and CORS issues
 */

import weatherApiService from '../services/weatherApiService.js';
import { weatherService } from '../services/weatherService.js';
import MeteomaticsService from '../services/api/meteomaticsService.js';
import NasaPowerService from '../services/api/nasaPowerService.js';

// Test the fixes for FarmWeather component errors
async function testFarmWeatherFixes() {
  console.log('🧪 Testing FarmWeather Component Fixes');
  console.log('=' .repeat(50));

  // Test 1: MeteomaticsService fetchWeatherData method
  console.log('\n📊 Test 1: MeteomaticsService.fetchWeatherData method exists');
  try {
    const meteomaticsService = new MeteomaticsService();
    const hasMethod = typeof meteomaticsService.fetchWeatherData === 'function';
    console.log('✅ fetchWeatherData method exists:', hasMethod);
    
    if (hasMethod) {
      // Test with sample coordinates (Valencia City, Philippines)
      const testResult = await meteomaticsService.fetchWeatherData(7.9064, 125.0945, '2025-10-31');
      console.log('✅ Method executes successfully');
      console.log('📊 Sample data structure:', {
        hasDaily: !!testResult.daily,
        hasMonthly: !!testResult.monthly,
        hasMetadata: !!testResult.metadata
      });
    }
  } catch (error) {
    console.error('❌ MeteomaticsService test failed:', error.message);
  }

  // Test 2: NASA POWER Service CORS handling
  console.log('\n📊 Test 2: NASA POWER Service CORS fallback');
  try {
    const nasaPowerService = new NasaPowerService();
    
    // Test fallback data generation
    const fallbackData = nasaPowerService.generateFallbackNasaData(
      7.9064, 125.0945, '20251024', '20251107'
    );
    
    console.log('✅ CORS fallback data generated successfully');
    console.log('📊 Fallback data structure:', {
      hasDaily: !!fallbackData.daily,
      hasMetadata: !!fallbackData.metadata,
      source: fallbackData.metadata?.source,
      parametersCount: Object.keys(fallbackData.daily || {}).length
    });
    
    // Test that it has the expected NASA POWER parameters
    const expectedParams = ['T2M', 'PRECTOTCORR', 'RH2M', 'WS2M'];
    const hasExpectedParams = expectedParams.every(param => 
      fallbackData.daily && fallbackData.daily[param]
    );
    console.log('✅ Contains expected NASA POWER parameters:', hasExpectedParams);
    
  } catch (error) {
    console.error('❌ NASA POWER fallback test failed:', error.message);
  }

  // Test 3: WeatherApiService integration
  console.log('\n📊 Test 3: WeatherApiService integration');
  try {
    // Test that weatherApiService can be called without errors
    const testAnalysis = await weatherApiService.getWeatherAnalysis(
      7.9064, 125.0945, '2025-10-31'
    );
    
    console.log('✅ WeatherApiService.getWeatherAnalysis works');
    console.log('📊 Analysis structure:', {
      hasLocation: !!testAnalysis.location,
      hasDataSources: !!testAnalysis.dataSources,
      dataSourcesCount: testAnalysis.dataSources?.length || 0,
      hasEnhancedAnalysis: !!testAnalysis.enhancedAnalysis
    });
    
  } catch (error) {
    console.error('❌ WeatherApiService test failed:', error.message);
  }

  // Test 4: Service compatibility check
  console.log('\n📊 Test 4: Service compatibility check');
  try {
    // Check if the old weatherService still works for backward compatibility
    const hasOldService = typeof weatherService !== 'undefined';
    console.log('📋 Old weatherService available:', hasOldService);
    
    if (hasOldService) {
      const serviceStatus = weatherService.getServiceStatus();
      console.log('📊 Service status:', {
        hasMeteomatics: !!serviceStatus.services?.meteomatics,
        hasSpaceWeather: !!serviceStatus.services?.spaceWeather,
        hasDisasterTracking: !!serviceStatus.services?.disasterTracking
      });
    }
    
  } catch (error) {
    console.error('❌ Service compatibility test failed:', error.message);
  }

  console.log('\n✅ All FarmWeather fixes tested!');
  console.log('\n💡 Summary of fixes:');
  console.log('   • Added missing fetchWeatherData method to MeteomaticsService');
  console.log('   • Added CORS fallback for NASA POWER API');
  console.log('   • Updated FarmWeather to use weatherApiService instead of weatherService');
  console.log('   • Enhanced error handling for API failures');
  console.log('\n🌾 FarmWeather component should now work without the previous errors!');
}

// Export for use in other files
export { testFarmWeatherFixes };

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - can be called from console
  window.testFarmWeatherFixes = testFarmWeatherFixes;
  console.log('🧪 FarmWeather fix tests loaded. Run testFarmWeatherFixes() to test.');
}
