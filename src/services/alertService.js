/**
 * Alert Service for Farmers
 * Provides SMS and Voice notifications for weather alerts
 * PWD-friendly with audio support
 */

class AlertService {
  constructor() {
    this.subscribers = new Map();
    this.alertHistory = [];
    
    // Initialize speech synthesis for voice alerts
    this.speechSynthesis = window.speechSynthesis;
    this.voiceEnabled = 'speechSynthesis' in window;
  }

  /**
   * Subscribe to weather alerts
   * @param {string} farmerId - Unique farmer identifier
   * @param {Object} preferences - Alert preferences
   */
  subscribe(farmerId, preferences = {}) {
    const defaultPreferences = {
      sms: false, // Would require SMS service integration
      voice: true,
      email: false,
      severity: ['high', 'urgent'], // Only high priority alerts
      crops: ['all'],
      location: null,
      language: 'en-PH' // Filipino English
    };

    this.subscribers.set(farmerId, {
      ...defaultPreferences,
      ...preferences,
      subscribedAt: new Date().toISOString()
    });

    console.log(`Farmer ${farmerId} subscribed to alerts`);
    return true;
  }

  /**
   * Send weather alert to farmers
   * @param {Object} alert - Alert data
   */
  async sendAlert(alert) {
    const alertData = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: alert.type || 'weather',
      severity: alert.severity || 'medium',
      title: alert.title,
      message: alert.message,
      location: alert.location,
      crop: alert.crop,
      actions: alert.actions || [],
      expiresAt: alert.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    // Store alert in history
    this.alertHistory.unshift(alertData);
    if (this.alertHistory.length > 100) {
      this.alertHistory = this.alertHistory.slice(0, 100);
    }

    // Send to all relevant subscribers
    const sentCount = await this.broadcastAlert(alertData);
    
    console.log(`Alert sent to ${sentCount} farmers:`, alertData.title);
    return { success: true, sentCount, alertId: alertData.id };
  }

  /**
   * Broadcast alert to relevant subscribers
   */
  async broadcastAlert(alert) {
    let sentCount = 0;

    for (const [farmerId, preferences] of this.subscribers) {
      // Check if farmer should receive this alert
      if (!this.shouldReceiveAlert(preferences, alert)) {
        continue;
      }

      // Send via enabled channels
      if (preferences.voice && this.voiceEnabled) {
        this.sendVoiceAlert(alert, preferences.language);
        sentCount++;
      }

      if (preferences.sms) {
        // In production, integrate with SMS service like Twilio
        this.sendSMSAlert(farmerId, alert);
        sentCount++;
      }

      if (preferences.email) {
        // In production, integrate with email service
        this.sendEmailAlert(farmerId, alert);
        sentCount++;
      }
    }

    return sentCount;
  }

  /**
   * Check if farmer should receive alert based on preferences
   */
  shouldReceiveAlert(preferences, alert) {
    // Check severity level
    if (!preferences.severity.includes(alert.severity)) {
      return false;
    }

    // Check crop relevance
    if (preferences.crops.length > 0 && 
        !preferences.crops.includes('all') && 
        !preferences.crops.includes(alert.crop)) {
      return false;
    }

    // Check location proximity (simplified)
    if (preferences.location && alert.location) {
      // In production, implement proper geolocation distance calculation
      const locationMatch = preferences.location.toLowerCase().includes(
        alert.location.toLowerCase()
      ) || alert.location.toLowerCase().includes(
        preferences.location.toLowerCase()
      );
      if (!locationMatch) {
        return false;
      }
    }

    return true;
  }

  /**
   * Send voice alert using speech synthesis
   */
  sendVoiceAlert(alert, language = 'en-PH') {
    if (!this.voiceEnabled) {
      console.warn('Voice alerts not supported in this browser');
      return false;
    }

    // Create voice message
    const message = this.formatVoiceMessage(alert, language);
    
    // Configure speech
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = language;
    utterance.rate = 0.8; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Find appropriate voice
    const voices = this.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && voice.name.includes('Female')
    ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Speak the alert
    this.speechSynthesis.speak(utterance);
    
    console.log('Voice alert sent:', message);
    return true;
  }

  /**
   * Format message for voice synthesis
   */
  formatVoiceMessage(alert, language) {
    let message = `Weather Alert. ${alert.severity} priority. `;
    
    if (alert.location) {
      message += `For ${alert.location}. `;
    }
    
    if (alert.crop) {
      message += `Affecting ${alert.crop} crops. `;
    }
    
    message += alert.message;
    
    if (alert.actions && alert.actions.length > 0) {
      message += ` Recommended actions: ${alert.actions.slice(0, 2).join('. ')}.`;
    }
    
    return message;
  }

  /**
   * Send SMS alert (placeholder for SMS service integration)
   */
  sendSMSAlert(farmerId, alert) {
    // In production, integrate with SMS service like Twilio, Semaphore, or local SMS gateway
    const smsMessage = this.formatSMSMessage(alert);
    
    console.log(`SMS Alert to ${farmerId}:`, smsMessage);
    
    // Placeholder for actual SMS sending
    // await smsService.send(farmerPhone, smsMessage);
    
    return true;
  }

  /**
   * Format message for SMS
   */
  formatSMSMessage(alert) {
    let message = `🌾 FARM ALERT [${alert.severity.toUpperCase()}]\n`;
    
    if (alert.location) {
      message += `📍 ${alert.location}\n`;
    }
    
    if (alert.crop) {
      message += `🌱 ${alert.crop}\n`;
    }
    
    message += `⚠️ ${alert.message}\n`;
    
    if (alert.actions && alert.actions.length > 0) {
      message += `✅ Actions: ${alert.actions[0]}`;
    }
    
    return message;
  }

  /**
   * Send email alert (placeholder)
   */
  sendEmailAlert(farmerId, alert) {
    console.log(`Email Alert to ${farmerId}:`, alert.title);
    // Placeholder for email service integration
    return true;
  }

  /**
   * Generate weather alerts from NASA analysis
   */
  generateWeatherAlerts(nasaAnalysis, location, crop) {
    const alerts = [];

    // Soil moisture alerts
    if (nasaAnalysis.analysis.soilMoisture.status === 'too_dry') {
      alerts.push({
        type: 'irrigation',
        severity: 'urgent',
        title: 'Immediate Irrigation Needed',
        message: `Soil moisture is critically low at ${Math.round(nasaAnalysis.analysis.soilMoisture.avgSoilMoisture * 100)}%. Crops may suffer without immediate watering.`,
        location: location,
        crop: crop,
        actions: [
          'Apply 25-30mm of water immediately',
          'Check irrigation systems',
          'Monitor soil moisture daily'
        ]
      });
    }

    // Temperature alerts
    if (nasaAnalysis.analysis.temperature.status === 'poor') {
      const isHot = nasaAnalysis.analysis.temperature.avgTemperature > 35;
      alerts.push({
        type: 'temperature',
        severity: 'high',
        title: isHot ? 'Heat Stress Warning' : 'Cold Weather Alert',
        message: `Temperature is ${nasaAnalysis.analysis.temperature.avgTemperature}°C, ${isHot ? 'above' : 'below'} optimal range for ${crop}.`,
        location: location,
        crop: crop,
        actions: isHot ? [
          'Provide shade during hottest hours',
          'Increase irrigation frequency'
        ] : [
          'Use row covers or plastic tunnels',
          'Monitor for frost damage'
        ]
      });
    }

    // Precipitation alerts
    if (nasaAnalysis.analysis.precipitation.maxDailyPrecipitation > 15) {
      alerts.push({
        type: 'flood',
        severity: 'high',
        title: 'Flood Risk Alert',
        message: `Heavy rainfall detected (${nasaAnalysis.analysis.precipitation.maxDailyPrecipitation}mm). Risk of flooding and waterlogging.`,
        location: location,
        crop: crop,
        actions: [
          'Improve drainage systems',
          'Avoid field activities',
          'Monitor water levels'
        ]
      });
    }

    return alerts;
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit = 10) {
    return this.alertHistory.slice(0, limit);
  }

  /**
   * Get subscriber count
   */
  getSubscriberCount() {
    return this.subscribers.size;
  }

  /**
   * Test voice alert system
   */
  testVoiceAlert() {
    const testAlert = {
      severity: 'medium',
      title: 'Test Alert',
      message: 'This is a test of the voice alert system for farmers.',
      location: 'Test Location',
      crop: 'rice',
      actions: ['This is a test action']
    };

    return this.sendVoiceAlert(testAlert);
  }
}

// Export singleton instance
export const alertService = new AlertService();
export default AlertService;
