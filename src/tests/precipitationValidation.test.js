/**
 * Test file to demonstrate the precipitation cross-validation fix
 * This shows how the system now handles missing NASA API data gracefully
 */

import weatherService from '../services/weatherApiService.js';

// Test the precipitation validation with different scenarios
function testPrecipitationValidation() {
  console.log('🧪 Testing Precipitation Cross-Validation Fix');
  console.log('=' .repeat(50));

  // Scenario 1: Both APIs missing (what you were seeing)
  console.log('\n📊 Test 1: Both NASA POWER and GPM IMERG unavailable');
  const result1 = weatherService.validatePrecipitationData(null, null);
  console.log('Result:', result1);
  console.log('Expected: Shows "no data available" with helpful message');

  // Scenario 2: Only NASA POWER missing
  console.log('\n📊 Test 2: NASA POWER missing, GPM IMERG available');
  const mockGpmData = {
    '2024-01-01': { precipitation: 5.2 },
    '2024-01-02': { precipitation: 0.0 },
    '2024-01-03': { precipitation: 12.8 }
  };
  const result2 = weatherService.validatePrecipitationData(null, mockGpmData);
  console.log('Result:', result2);
  console.log('Expected: Shows "partial data" with GPM-only message');

  // Scenario 3: Only GPM IMERG missing
  console.log('\n📊 Test 3: GPM IMERG missing, NASA POWER available');
  const mockPowerData = {
    '2024-01-01': 4.8,
    '2024-01-02': 0.1,
    '2024-01-03': 11.5
  };
  const result3 = weatherService.validatePrecipitationData(mockPowerData, null);
  console.log('Result:', result3);
  console.log('Expected: Shows "partial data" with POWER-only message');

  // Scenario 4: Both APIs working (ideal case)
  console.log('\n📊 Test 4: Both APIs working - cross-validation possible');
  const result4 = weatherService.validatePrecipitationData(mockPowerData, mockGpmData);
  console.log('Result:', result4);
  console.log('Expected: Shows actual correlation percentage and agreement level');

  console.log('\n✅ All tests completed!');
  console.log('\n💡 The fix now provides:');
  console.log('   • Clear status messages explaining what data is available');
  console.log('   • Different agreement levels (no data, partial data, etc.)');
  console.log('   • Helpful context about which NASA APIs are working');
  console.log('   • Better user experience when APIs are unavailable');
}

// Export for use in other files
export { testPrecipitationValidation };

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - can be called from console
  window.testPrecipitationValidation = testPrecipitationValidation;
  console.log('🧪 Precipitation validation tests loaded. Run testPrecipitationValidation() to test.');
}
