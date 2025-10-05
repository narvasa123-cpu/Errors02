// Main services export file
// This provides a clean interface for importing services throughout the app

// Main orchestrating service
export { weatherService as default, weatherService } from './weatherService.js';

// Individual API services (for direct access if needed)
export { default as SpaceWeatherService } from './api/spaceWeatherService.js';
export { default as DisasterTrackingService } from './api/disasterTrackingService.js';
export { default as MeteomaticsService } from './api/meteomaticsService.js';
export { default as BaseApiService } from './api/baseApiService.js';

// Utility functions
export {
  processHistoricalData,
  mergeDataSources,
  formatForExport,
  validateDataIntegrity
} from './utils/dataProcessor.js';

// Legacy export for backward compatibility
// This maintains compatibility with existing imports
export { weatherService as nasaApiService } from './weatherService.js';
