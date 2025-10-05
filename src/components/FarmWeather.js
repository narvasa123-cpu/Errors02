import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Search,
  MapPin,
  Calendar,
  Droplets,
  Sun,
  Wind,
  Thermometer,
  Sprout,
  Wheat,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  CloudRain,
  Zap,
  Leaf,
  BarChart3,
  Satellite,
  Activity,
  Target,
  Bell,
  Users,
  Smartphone,
  Volume2,
  Gauge,
  Beaker,
  Compass
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import weatherApiService from '../services/weatherApiService';
import { weatherCalculations } from '../utils/weatherCalculations';
import NasaAgriculturalService from '../services/api/nasaAgriculturalService';
import { alertService } from '../services/alertService';
import VoiceControl from './VoiceControl';

const FarmWeather = () => {
  const navigate = useNavigate();
  const [farmData, setFarmData] = useState({
    location: '',
    coordinates: { lat: null, lon: null },
    cropType: 'rice',
    farmSize: 'small',
    currentStage: 'planting',
    targetDate: ''
  });

  const [analysis, setAnalysis] = useState(null);
  const [nasaAnalysis, setNasaAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [communityReports, setCommunityReports] = useState([]);
  
  // Initialize NASA Agricultural Service
  const nasaAgriculturalService = new NasaAgriculturalService();

  // Crop database with Philippines focus
  const cropDatabase = [
    { 
      id: 'rice', 
      name: 'Rice (Palay)', 
      icon: Wheat,
      seasons: ['wet', 'dry'],
      plantingMonths: [5, 6, 7, 11, 12, 1],
      harvestMonths: [9, 10, 11, 3, 4, 5],
      risks: ['flood', 'drought', 'wind'],
      optimalTemp: { min: 20, max: 35 },
      waterNeeds: 'high'
    },
    { 
      id: 'corn', 
      name: 'Corn (Mais)', 
      icon: Sprout,
      seasons: ['wet', 'dry'],
      plantingMonths: [3, 4, 5, 8, 9, 10],
      harvestMonths: [7, 8, 9, 12, 1, 2],
      risks: ['drought', 'wind', 'heat'],
      optimalTemp: { min: 18, max: 32 },
      waterNeeds: 'medium'
    },
    { 
      id: 'sugarcane', 
      name: 'Sugarcane', 
      icon: Wheat,
      seasons: ['wet'],
      plantingMonths: [9, 10, 11, 12],
      harvestMonths: [11, 12, 1, 2, 3, 4],
      risks: ['drought', 'flood', 'wind'],
      optimalTemp: { min: 20, max: 30 },
      waterNeeds: 'high'
    },
    { 
      id: 'coconut', 
      name: 'Coconut', 
      icon: Leaf,
      seasons: ['year-round'],
      plantingMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      harvestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      risks: ['wind', 'drought'],
      optimalTemp: { min: 20, max: 32 },
      waterNeeds: 'medium'
    },
    { 
      id: 'banana', 
      name: 'Banana (Saging)', 
      icon: Leaf,
      seasons: ['year-round'],
      plantingMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      harvestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      risks: ['wind', 'flood'],
      optimalTemp: { min: 15, max: 35 },
      waterNeeds: 'high'
    },
    { 
      id: 'vegetables', 
      name: 'Vegetables (Gulay)', 
      icon: Sprout,
      seasons: ['dry', 'wet'],
      plantingMonths: [10, 11, 12, 1, 2, 3],
      harvestMonths: [12, 1, 2, 3, 4, 5],
      risks: ['flood', 'heat', 'drought'],
      optimalTemp: { min: 15, max: 30 },
      waterNeeds: 'medium'
    }
  ];

  // Global agricultural regions database with major farming areas worldwide
  const getGlobalAgriculturalRegions = () => {
    return [
      // Philippines
      { name: 'Bukidnon', country: 'Philippines', lat: 8.1390, lon: 125.1277, type: 'province', crops: ['corn', 'rice', 'vegetables'], climate: 'tropical' },
      { name: 'Nueva Ecija', country: 'Philippines', lat: 15.5784, lon: 121.1113, type: 'province', crops: ['rice', 'corn'], climate: 'tropical' },
      { name: 'Isabela', country: 'Philippines', lat: 16.9754, lon: 121.8077, type: 'province', crops: ['rice', 'corn', 'vegetables'], climate: 'tropical' },
      { name: 'Pangasinan', country: 'Philippines', lat: 15.8949, lon: 120.2863, type: 'province', crops: ['rice', 'corn'], climate: 'tropical' },
      { name: 'Negros Occidental', country: 'Philippines', lat: 10.6767, lon: 122.9511, type: 'province', crops: ['sugarcane', 'rice'], climate: 'tropical' },
      { name: 'Davao del Sur', country: 'Philippines', lat: 6.7763, lon: 125.6050, type: 'province', crops: ['banana', 'coconut', 'corn'], climate: 'tropical' },
      { name: 'Cotabato', country: 'Philippines', lat: 7.2231, lon: 124.2452, type: 'province', crops: ['rice', 'corn', 'coconut'], climate: 'tropical' },
      { name: 'Valencia City', country: 'Philippines', lat: 7.9064, lon: 125.0945, type: 'city', crops: ['corn', 'vegetables', 'rice'], climate: 'tropical' },
      { name: 'Cagayan Valley', country: 'Philippines', lat: 17.6129, lon: 121.7270, type: 'region', crops: ['rice', 'corn', 'vegetables'], climate: 'tropical' },
      { name: 'Central Luzon', country: 'Philippines', lat: 15.4817, lon: 120.9718, type: 'region', crops: ['rice', 'corn', 'sugarcane'], climate: 'tropical' },

      // United States - Major Agricultural Regions
      { name: 'Iowa', country: 'United States', lat: 41.8780, lon: -93.0977, type: 'state', crops: ['corn', 'soybeans', 'pork'], climate: 'continental' },
      { name: 'Nebraska', country: 'United States', lat: 41.4925, lon: -99.9018, type: 'state', crops: ['corn', 'soybeans', 'beef'], climate: 'continental' },
      { name: 'Illinois', country: 'United States', lat: 40.3363, lon: -89.0022, type: 'state', crops: ['corn', 'soybeans'], climate: 'continental' },
      { name: 'Kansas', country: 'United States', lat: 38.5266, lon: -96.7265, type: 'state', crops: ['wheat', 'corn', 'soybeans'], climate: 'continental' },
      { name: 'California Central Valley', country: 'United States', lat: 36.7378, lon: -119.7871, type: 'region', crops: ['almonds', 'grapes', 'tomatoes', 'citrus'], climate: 'mediterranean' },
      { name: 'Texas Panhandle', country: 'United States', lat: 35.2211, lon: -101.8313, type: 'region', crops: ['cotton', 'wheat', 'corn'], climate: 'semi-arid' },
      { name: 'Florida', country: 'United States', lat: 27.7663, lon: -82.6404, type: 'state', crops: ['citrus', 'sugarcane', 'vegetables'], climate: 'subtropical' },

      // Brazil - Agricultural Powerhouse
      { name: 'Mato Grosso', country: 'Brazil', lat: -15.6014, lon: -56.0979, type: 'state', crops: ['soybeans', 'corn', 'cotton'], climate: 'tropical' },
      { name: 'Rio Grande do Sul', country: 'Brazil', lat: -30.0346, lon: -51.2177, type: 'state', crops: ['soybeans', 'rice', 'wheat'], climate: 'subtropical' },
      { name: 'Paraná', country: 'Brazil', lat: -24.8941, lon: -51.4233, type: 'state', crops: ['soybeans', 'corn', 'wheat'], climate: 'subtropical' },
      { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333, type: 'state', crops: ['sugarcane', 'citrus', 'coffee'], climate: 'subtropical' },
      { name: 'Cerrado', country: 'Brazil', lat: -15.7801, lon: -47.9292, type: 'region', crops: ['soybeans', 'corn', 'cotton'], climate: 'tropical_savanna' },

      // Argentina - Pampas Region
      { name: 'Buenos Aires Province', country: 'Argentina', lat: -36.6769, lon: -60.5588, type: 'province', crops: ['soybeans', 'wheat', 'corn', 'beef'], climate: 'temperate' },
      { name: 'Córdoba', country: 'Argentina', lat: -31.4201, lon: -64.1888, type: 'province', crops: ['soybeans', 'corn', 'wheat'], climate: 'temperate' },
      { name: 'Santa Fe', country: 'Argentina', lat: -31.6333, lon: -60.7000, type: 'province', crops: ['soybeans', 'wheat', 'corn'], climate: 'temperate' },

      // India - Major Agricultural States
      { name: 'Punjab', country: 'India', lat: 31.1471, lon: 75.3412, type: 'state', crops: ['wheat', 'rice', 'cotton'], climate: 'semi-arid' },
      { name: 'Uttar Pradesh', country: 'India', lat: 26.8467, lon: 80.9462, type: 'state', crops: ['wheat', 'rice', 'sugarcane'], climate: 'subtropical' },
      { name: 'Haryana', country: 'India', lat: 29.0588, lon: 76.0856, type: 'state', crops: ['wheat', 'rice', 'cotton'], climate: 'semi-arid' },
      { name: 'Maharashtra', country: 'India', lat: 19.7515, lon: 75.7139, type: 'state', crops: ['cotton', 'sugarcane', 'soybeans'], climate: 'tropical' },
      { name: 'West Bengal', country: 'India', lat: 22.9868, lon: 87.8550, type: 'state', crops: ['rice', 'jute', 'tea'], climate: 'tropical' },

      // China - Major Agricultural Regions
      { name: 'Heilongjiang', country: 'China', lat: 47.8620, lon: 127.7615, type: 'province', crops: ['soybeans', 'corn', 'rice'], climate: 'continental' },
      { name: 'Henan', country: 'China', lat: 33.8818, lon: 113.6140, type: 'province', crops: ['wheat', 'corn', 'rice'], climate: 'temperate' },
      { name: 'Shandong', country: 'China', lat: 36.3427, lon: 118.1498, type: 'province', crops: ['wheat', 'corn', 'vegetables'], climate: 'temperate' },
      { name: 'Jiangsu', country: 'China', lat: 32.9711, lon: 119.4550, type: 'province', crops: ['rice', 'wheat', 'cotton'], climate: 'subtropical' },

      // Europe - Major Agricultural Areas
      { name: 'Île-de-France', country: 'France', lat: 48.8499, lon: 2.6370, type: 'region', crops: ['wheat', 'barley', 'sugar_beet'], climate: 'temperate' },
      { name: 'Normandy', country: 'France', lat: 49.1829, lon: -0.3707, type: 'region', crops: ['wheat', 'dairy', 'apples'], climate: 'oceanic' },
      { name: 'Bavaria', country: 'Germany', lat: 49.0134, lon: 10.9698, type: 'state', crops: ['wheat', 'barley', 'hops'], climate: 'temperate' },
      { name: 'Lower Saxony', country: 'Germany', lat: 52.6367, lon: 9.8451, type: 'state', crops: ['wheat', 'sugar_beet', 'potatoes'], climate: 'temperate' },
      { name: 'Andalusia', country: 'Spain', lat: 37.3891, lon: -5.9845, type: 'region', crops: ['olives', 'citrus', 'wheat'], climate: 'mediterranean' },
      { name: 'Po Valley', country: 'Italy', lat: 45.0703, lon: 9.6869, type: 'region', crops: ['rice', 'corn', 'wheat'], climate: 'continental' },

      // Australia - Agricultural Regions
      { name: 'Western Australia Wheatbelt', country: 'Australia', lat: -31.9505, lon: 117.3616, type: 'region', crops: ['wheat', 'barley', 'canola'], climate: 'mediterranean' },
      { name: 'New South Wales', country: 'Australia', lat: -31.2532, lon: 146.9211, type: 'state', crops: ['wheat', 'cotton', 'rice'], climate: 'temperate' },
      { name: 'Queensland', country: 'Australia', lat: -20.9176, lon: 142.7028, type: 'state', crops: ['sugarcane', 'cotton', 'wheat'], climate: 'subtropical' },

      // Canada - Prairie Provinces
      { name: 'Saskatchewan', country: 'Canada', lat: 52.9399, lon: -106.4509, type: 'province', crops: ['wheat', 'canola', 'lentils'], climate: 'continental' },
      { name: 'Alberta', country: 'Canada', lat: 53.9333, lon: -116.5765, type: 'province', crops: ['wheat', 'canola', 'barley'], climate: 'continental' },
      { name: 'Manitoba', country: 'Canada', lat: 53.7609, lon: -98.8139, type: 'province', crops: ['wheat', 'canola', 'soybeans'], climate: 'continental' },

      // Africa - Major Agricultural Areas
      { name: 'Nile Delta', country: 'Egypt', lat: 30.8025, lon: 31.1848, type: 'region', crops: ['rice', 'cotton', 'wheat'], climate: 'arid' },
      { name: 'KwaZulu-Natal', country: 'South Africa', lat: -28.5305, lon: 30.8958, type: 'province', crops: ['sugarcane', 'corn', 'soybeans'], climate: 'subtropical' },
      { name: 'Western Cape', country: 'South Africa', lat: -33.2277, lon: 21.8569, type: 'province', crops: ['wheat', 'wine_grapes', 'citrus'], climate: 'mediterranean' },
      { name: 'Rift Valley', country: 'Kenya', lat: -0.0236, lon: 37.9062, type: 'region', crops: ['coffee', 'tea', 'wheat'], climate: 'tropical_highland' },

      // Southeast Asia
      { name: 'Mekong Delta', country: 'Vietnam', lat: 10.0452, lon: 105.7469, type: 'region', crops: ['rice', 'aquaculture', 'fruits'], climate: 'tropical' },
      { name: 'Central Thailand', country: 'Thailand', lat: 14.0583, lon: 100.6014, type: 'region', crops: ['rice', 'sugarcane', 'cassava'], climate: 'tropical' },
      { name: 'Java', country: 'Indonesia', lat: -7.6145, lon: 110.7122, type: 'island', crops: ['rice', 'tea', 'coffee'], climate: 'tropical' },
      { name: 'Peninsular Malaysia', country: 'Malaysia', lat: 4.2105, lon: 101.9758, type: 'region', crops: ['palm_oil', 'rubber', 'rice'], climate: 'tropical' }
    ];
  };

  // Get agricultural regions (can be extended with API calls)
  const agriculturalRegions = getGlobalAgriculturalRegions();

  // API-enhanced location search with worldwide coverage
  const searchLocation = async (query) => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    
    // First, search in our comprehensive local database
    const localResults = agriculturalRegions.filter(location => 
      location.name.toLowerCase().includes(searchTerm) ||
      location.country.toLowerCase().includes(searchTerm) ||
      location.crops.some(crop => crop.toLowerCase().includes(searchTerm))
    ).slice(0, 4);

    // If we have good local results, return them
    if (localResults.length >= 3) {
      return localResults;
    }

    // Otherwise, try to fetch additional results from APIs
    try {
      const apiResults = await fetchAdditionalAgriculturalRegions(query);
      
      // Combine local and API results, removing duplicates
      const combinedResults = [...localResults];
      
      apiResults.forEach(apiResult => {
        const isDuplicate = combinedResults.some(local => 
          Math.abs(local.lat - apiResult.lat) < 0.1 && 
          Math.abs(local.lon - apiResult.lon) < 0.1
        );
        
        if (!isDuplicate && combinedResults.length < 6) {
          combinedResults.push(apiResult);
        }
      });
      
      return combinedResults;
      
    } catch (error) {
      console.warn('API search failed, using local results:', error);
      return localResults;
    }
  };

  // Fetch additional agricultural regions from APIs
  const fetchAdditionalAgriculturalRegions = async (query) => {
    try {
      // Use OpenStreetMap Nominatim API for worldwide location search
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query + ' agricultural region')}`;
      
      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'FarmWeather-App/1.0'
        }
      });
      
      if (!response.ok) throw new Error('Nominatim API failed');
      
      const data = await response.json();
      
      // Process and enhance the results with agricultural context
      return data.map(item => ({
        name: item.display_name.split(',')[0],
        country: item.display_name.split(',').pop().trim(),
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: item.type || 'location',
        crops: inferCropsFromLocation(parseFloat(item.lat), parseFloat(item.lon)),
        climate: inferClimateFromLocation(parseFloat(item.lat)),
        source: 'api'
      }));
      
    } catch (error) {
      console.warn('Failed to fetch additional regions:', error);
      return [];
    }
  };

  // Infer likely crops based on geographic location
  const inferCropsFromLocation = (lat, lon) => {
    // Tropical regions (between 23.5°N and 23.5°S)
    if (Math.abs(lat) < 23.5) {
      return ['rice', 'corn', 'sugarcane', 'tropical_fruits', 'vegetables'];
    }
    
    // Temperate regions
    if (Math.abs(lat) >= 23.5 && Math.abs(lat) < 50) {
      // Northern hemisphere temperate
      if (lat > 0) {
        return ['wheat', 'corn', 'soybeans', 'vegetables'];
      }
      // Southern hemisphere temperate
      return ['wheat', 'corn', 'wine_grapes', 'vegetables'];
    }
    
    // Cold regions (above 50° latitude)
    if (Math.abs(lat) >= 50) {
      return ['wheat', 'barley', 'potatoes', 'canola'];
    }
    
    return ['mixed_crops'];
  };

  // Infer climate type based on latitude
  const inferClimateFromLocation = (lat) => {
    if (Math.abs(lat) < 10) return 'tropical';
    if (Math.abs(lat) < 23.5) return 'subtropical';
    if (Math.abs(lat) < 35) return 'temperate';
    if (Math.abs(lat) < 50) return 'continental';
    return 'cold';
  };

  const handleLocationInputChange = async (value) => {
    setFarmData({...farmData, location: value});
    if (value.trim().length > 0) {
      try {
        const searchResults = await searchLocation(value);
        setSuggestions(searchResults);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Location search error:', error);
        // Fallback to local search only
        const localResults = agriculturalRegions.filter(location => 
          location.name.toLowerCase().includes(value.toLowerCase()) ||
          location.country.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 6);
        setSuggestions(localResults);
        setShowSuggestions(true);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setFarmData({
      ...farmData, 
      location: suggestion.name,
      coordinates: { lat: suggestion.lat, lon: suggestion.lon }
    });
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Voice control handlers
  const handleVoiceLocationSelect = (location) => {
    setFarmData({
      ...farmData,
      location: location.name,
      coordinates: { lat: location.lat, lon: location.lon }
    });
  };

  const handleVoiceCropSelect = (cropType) => {
    setFarmData({
      ...farmData,
      cropType: cropType
    });
  };

  const handleVoiceAnalyze = () => {
    analyzeFarmWeather();
  };

  const analyzeFarmWeather = async () => {
    if (!farmData.location || !farmData.coordinates.lat) {
      setError('Please select a farming location');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const targetDate = farmData.targetDate || new Date().toISOString().split('T')[0];
      
      // Get both traditional weather data and NASA agricultural analysis
      const [weatherData, nasaAgricultural] = await Promise.all([
        weatherApiService.getWeatherAnalysis(
          farmData.coordinates.lat, 
          farmData.coordinates.lon, 
          targetDate
        ),
        nasaAgriculturalService.getAgriculturalAnalysis(
          farmData.coordinates.lat,
          farmData.coordinates.lon,
          farmData.cropType,
          farmData.currentStage,
          targetDate
        )
      ]);
      
      const probabilities = weatherCalculations.calculateProbabilities(weatherData, targetDate);
      
      // Calculate farm-specific risks
      const farmRisks = calculateFarmRisks(probabilities, farmData.cropType, farmData.currentStage);
      
      setAnalysis({
        location: farmData.coordinates,
        date: targetDate,
        probabilities,
        farmRisks,
        recommendations: generateFarmRecommendations(farmRisks, farmData),
        plantingCalendar: getPlantingCalendar(farmData.cropType)
      });
      
      setNasaAnalysis(nasaAgricultural);
      
      // Generate community report
      generateCommunityReport(nasaAgricultural);
      
      // Generate and send weather alerts
      if (alertsEnabled) {
        const weatherAlerts = alertService.generateWeatherAlerts(
          nasaAgricultural, 
          farmData.location, 
          farmData.cropType
        );
        
        // Send alerts if any critical conditions detected
        weatherAlerts.forEach(alert => {
          if (alert.severity === 'urgent' || alert.severity === 'high') {
            alertService.sendAlert(alert);
          }
        });
      }
      
    } catch (err) {
      setError('Failed to analyze farm weather data');
      console.error('Farm weather analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFarmRisks = (probabilities, cropType, stage) => {
    const crop = cropDatabase.find(c => c.id === cropType);
    if (!crop) return {};

    const risks = {};

    // Flood risk (heavy rain)
    if (crop.risks.includes('flood')) {
      risks.flood = {
        level: probabilities.wet > 60 ? 'high' : probabilities.wet > 30 ? 'medium' : 'low',
        probability: probabilities.wet,
        impact: stage === 'planting' ? 'critical' : stage === 'harvesting' ? 'high' : 'medium'
      };
    }

    // Drought risk
    if (crop.risks.includes('drought')) {
      const droughtRisk = probabilities.hot > 50 && probabilities.wet < 20 ? 'high' : 
                         probabilities.hot > 30 && probabilities.wet < 40 ? 'medium' : 'low';
      risks.drought = {
        level: droughtRisk,
        probability: probabilities.hot,
        impact: crop.waterNeeds === 'high' ? 'critical' : 'medium'
      };
    }

    // Wind risk
    if (crop.risks.includes('wind')) {
      risks.wind = {
        level: probabilities.windy > 50 ? 'high' : probabilities.windy > 25 ? 'medium' : 'low',
        probability: probabilities.windy,
        impact: cropType === 'banana' || cropType === 'coconut' ? 'critical' : 'medium'
      };
    }

    // Heat stress
    if (crop.risks.includes('heat')) {
      risks.heatStress = {
        level: probabilities.uncomfortable > 60 ? 'high' : probabilities.uncomfortable > 30 ? 'medium' : 'low',
        probability: probabilities.uncomfortable,
        impact: stage === 'flowering' ? 'critical' : 'medium'
      };
    }

    return risks;
  };

  const generateFarmRecommendations = (risks, farmData) => {
    const recommendations = [];
    const crop = cropDatabase.find(c => c.id === farmData.cropType);

    Object.entries(risks).forEach(([riskType, riskData]) => {
      if (riskData.level === 'high') {
        switch (riskType) {
          case 'flood':
            recommendations.push({
              type: 'warning',
              icon: CloudRain,
              title: 'Flood Risk Alert',
              message: 'High chance of flooding. Consider drainage and delay planting if possible.',
              actions: ['Improve drainage systems', 'Delay planting by 3-5 days', 'Prepare flood barriers']
            });
            break;
          case 'drought':
            recommendations.push({
              type: 'warning',
              icon: Sun,
              title: 'Drought Risk Alert',
              message: 'Hot and dry conditions expected. Increase irrigation planning.',
              actions: ['Increase irrigation frequency', 'Apply mulching', 'Consider drought-resistant varieties']
            });
            break;
          case 'wind':
            recommendations.push({
              type: 'warning',
              icon: Wind,
              title: 'Strong Wind Alert',
              message: 'High winds may damage crops. Secure and protect plants.',
              actions: ['Install windbreaks', 'Stake tall plants', 'Harvest early if near maturity']
            });
            break;
          case 'heatStress':
            recommendations.push({
              type: 'warning',
              icon: Thermometer,
              title: 'Heat Stress Alert',
              message: 'Extreme heat may stress plants and livestock.',
              actions: ['Provide shade for livestock', 'Increase water supply', 'Avoid midday activities']
            });
            break;
        }
      }
    });

    // Add positive recommendations
    const lowRiskCount = Object.values(risks).filter(r => r.level === 'low').length;
    if (lowRiskCount >= 3) {
      recommendations.unshift({
        type: 'success',
        icon: CheckCircle,
        title: 'Favorable Conditions',
        message: 'Weather conditions are favorable for farming activities.',
        actions: ['Good time for planting', 'Proceed with scheduled activities', 'Consider expanding operations']
      });
    }

    return recommendations;
  };

  const getPlantingCalendar = (cropType) => {
    const crop = cropDatabase.find(c => c.id === cropType);
    if (!crop) return null;

    const currentMonth = new Date().getMonth() + 1;
    const isPlantingSeason = crop.plantingMonths.includes(currentMonth);
    const isHarvestSeason = crop.harvestMonths.includes(currentMonth);

    return {
      crop: crop.name,
      currentSeason: isPlantingSeason ? 'planting' : isHarvestSeason ? 'harvest' : 'maintenance',
      nextPlanting: getNextSeason(crop.plantingMonths, currentMonth),
      nextHarvest: getNextSeason(crop.harvestMonths, currentMonth),
      optimalTemp: crop.optimalTemp,
      waterNeeds: crop.waterNeeds
    };
  };

  const getNextSeason = (months, currentMonth) => {
    const nextMonth = months.find(m => m > currentMonth) || months[0];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[nextMonth - 1];
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'high': return XCircle;
      case 'medium': return AlertTriangle;
      case 'low': return CheckCircle;
      default: return AlertTriangle;
    }
  };

  // Generate community report for sharing
  const generateCommunityReport = (nasaData) => {
    const report = {
      id: Date.now(),
      location: farmData.location,
      crop: farmData.cropType,
      date: new Date().toISOString().split('T')[0],
      conditions: nasaData.analysis.overallConditions.status,
      soilMoisture: nasaData.analysis.soilMoisture.avgSoilMoisture,
      temperature: nasaData.analysis.temperature.avgTemperature,
      precipitation: nasaData.analysis.precipitation.avgDailyPrecipitation,
      farmer: 'Anonymous', // In real app, would use user data
      verified: false
    };
    
    setCommunityReports(prev => [report, ...prev.slice(0, 4)]); // Keep last 5 reports
  };

  // Get status color for NASA analysis
  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-700 bg-green-50 border-green-200';
      case 'good': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'optimal': return 'text-green-700 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-700 bg-red-50 border-red-200';
      case 'too_dry': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'waterlogged': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  // Get recommendation priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'info': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-14">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              <span className="hidden sm:inline">Farm Weather Assistant</span>
              <span className="sm:hidden">Farm Weather</span>
            </h1>
            <p className="text-sm text-gray-600 hidden md:block">NASA satellite data for Philippine agriculture</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="mb-6 sm:mb-8">
          <p className="text-sm sm:text-base text-gray-600">Get weather insights tailored for Philippine agriculture using NASA satellite data</p>
        </div>

        {/* NASA Data Tabs */}
        {nasaAnalysis && (
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', name: 'Overview', icon: BarChart3 },
                  { id: 'soil', name: 'Soil Analysis', icon: Beaker },
                  { id: 'irrigation', name: 'Irrigation', icon: Droplets },
                  { id: 'alerts', name: 'Alerts & Community', icon: Bell }
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <TabIcon className="h-4 w-4" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Farm Details Form */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Farm Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Farm Location</label>
                <div className="relative">
                  <input
                    type="text"
                    value={farmData.location}
                    onChange={(e) => handleLocationInputChange(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 150);
                    }}
                    placeholder="Search agricultural regions..."
                    className="input-field"
                  />
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionSelect(suggestion)}
                          className="w-full px-4 py-3 text-left hover:bg-primary-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                        >
                          <MapPin className="h-4 w-4 text-primary-600" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{suggestion.name}</div>
                            <div className="text-sm text-gray-500">
                              {suggestion.type} • Crops: {suggestion.crops?.join(', ')}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Crop Type</label>
                <select
                  value={farmData.cropType}
                  onChange={(e) => setFarmData({...farmData, cropType: e.target.value})}
                  className="input-field"
                >
                  {cropDatabase.map(crop => (
                    <option key={crop.id} value={crop.id}>{crop.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Farm Size</label>
                  <select
                    value={farmData.farmSize}
                    onChange={(e) => setFarmData({...farmData, farmSize: e.target.value})}
                    className="input-field"
                  >
                    <option value="small">Small (&lt; 3 hectares)</option>
                    <option value="medium">Medium (3-10 hectares)</option>
                    <option value="large">Large (&gt; 10 hectares)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Stage</label>
                  <select
                    value={farmData.currentStage}
                    onChange={(e) => setFarmData({...farmData, currentStage: e.target.value})}
                    className="input-field"
                  >
                    <option value="planting">Planting</option>
                    <option value="growing">Growing</option>
                    <option value="flowering">Flowering</option>
                    <option value="harvesting">Harvesting</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
                <input
                  type="date"
                  value={farmData.targetDate}
                  onChange={(e) => setFarmData({...farmData, targetDate: e.target.value})}
                  className="input-field"
                />
              </div>

              <button
                onClick={analyzeFarmWeather}
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? 'Analyzing Farm Weather...' : 'Get Farm Weather Analysis'}
              </button>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Analysis Results */}
          <div className="space-y-6">
            {/* NASA Agricultural Analysis */}
            {nasaAnalysis && activeTab === 'overview' && (
              <div className="card">
                <div className="flex items-center space-x-3 mb-4">
                  <Satellite className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">NASA Agricultural Analysis</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {/* Overall Score */}
                  <div className={`p-4 rounded-lg border ${getStatusColor(nasaAnalysis.analysis.overallConditions.status)}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Gauge className="h-5 w-5" />
                      <span className="font-medium">Overall Score</span>
                    </div>
                    <div className="text-2xl font-bold">{nasaAnalysis.analysis.overallConditions.score}/100</div>
                    <div className="text-sm capitalize">{nasaAnalysis.analysis.overallConditions.status}</div>
                  </div>

                  {/* Temperature */}
                  <div className={`p-4 rounded-lg border ${getStatusColor(nasaAnalysis.analysis.temperature.status)}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Thermometer className="h-5 w-5" />
                      <span className="font-medium">Temperature</span>
                    </div>
                    <div className="text-2xl font-bold">{nasaAnalysis.analysis.temperature.avgTemperature}°C</div>
                    <div className="text-sm capitalize">{nasaAnalysis.analysis.temperature.status}</div>
                  </div>

                  {/* Soil Moisture */}
                  <div className={`p-4 rounded-lg border ${getStatusColor(nasaAnalysis.analysis.soilMoisture.status)}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Droplets className="h-5 w-5" />
                      <span className="font-medium">Soil Moisture</span>
                    </div>
                    <div className="text-2xl font-bold">{Math.round(nasaAnalysis.analysis.soilMoisture.avgSoilMoisture * 100)}%</div>
                    <div className="text-sm capitalize">{nasaAnalysis.analysis.soilMoisture.status.replace('_', ' ')}</div>
                  </div>
                </div>

                {/* NASA Recommendations */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">NASA-Based Recommendations</h4>
                  {nasaAnalysis.recommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${getPriorityColor(rec.priority)}`}>
                      <div className="flex items-start space-x-3">
                        <Target className="h-5 w-5 mt-0.5 text-gray-600" />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{rec.title}</h5>
                          <p className="text-sm text-gray-600 mt-1">{rec.message}</p>
                          {rec.actions && (
                            <ul className="mt-2 text-sm space-y-1">
                              {rec.actions.slice(0, 2).map((action, i) => (
                                <li key={i} className="flex items-center space-x-2">
                                  <span className="w-1 h-1 bg-current rounded-full"></span>
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Soil Analysis Tab */}
            {nasaAnalysis && activeTab === 'soil' && (
              <div className="card">
                <div className="flex items-center space-x-3 mb-4">
                  <Beaker className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">NASA SMAP Soil Analysis</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Soil Moisture Levels</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Current</span>
                        <span className="font-medium">{Math.round(nasaAnalysis.analysis.soilMoisture.avgSoilMoisture * 100)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Optimal Range</span>
                        <span className="font-medium">
                          {Math.round(nasaAnalysis.crop.soilMoistureOptimal.min * 100)}% - {Math.round(nasaAnalysis.crop.soilMoistureOptimal.max * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            nasaAnalysis.analysis.soilMoisture.status === 'optimal' ? 'bg-green-500' :
                            nasaAnalysis.analysis.soilMoisture.status === 'too_dry' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`}
                          style={{ width: `${Math.min(100, nasaAnalysis.analysis.soilMoisture.avgSoilMoisture * 200)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Soil Conditions</h4>
                    <div className="space-y-2">
                      {nasaAnalysis.analysis.soilMoisture.issues.map((issue, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span>{issue}</span>
                        </div>
                      ))}
                      {nasaAnalysis.analysis.soilMoisture.issues.length === 0 && (
                        <div className="flex items-center space-x-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>No soil moisture issues detected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Irrigation Tab */}
            {nasaAnalysis && activeTab === 'irrigation' && (
              <div className="card">
                <div className="flex items-center space-x-3 mb-4">
                  <Droplets className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Irrigation Recommendations</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">GPM Precipitation Data</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Daily Average</span>
                        <span className="font-medium">{nasaAnalysis.analysis.precipitation.avgDailyPrecipitation} mm</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Days with Rain</span>
                        <span className="font-medium">{nasaAnalysis.analysis.precipitation.daysWithRain} days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Precipitation</span>
                        <span className="font-medium">{nasaAnalysis.analysis.precipitation.totalPrecipitation} mm</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Irrigation Schedule</h4>
                    {nasaAnalysis.analysis.soilMoisture.status === 'too_dry' ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <span className="font-medium text-red-800">Immediate Irrigation Needed</span>
                        </div>
                        <p className="text-sm text-red-700">Apply 25-30mm of water immediately</p>
                      </div>
                    ) : nasaAnalysis.analysis.soilMoisture.status === 'optimal' ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-800">Optimal Moisture</span>
                        </div>
                        <p className="text-sm text-green-700">No irrigation needed for 2-3 days</p>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Droplets className="h-5 w-5 text-yellow-600" />
                          <span className="font-medium text-yellow-800">Monitor Closely</span>
                        </div>
                        <p className="text-sm text-yellow-700">Light irrigation may be needed in 1-2 days</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Alerts & Community Tab */}
            {nasaAnalysis && activeTab === 'alerts' && (
              <div className="space-y-6">
                {/* Alert System */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-6 w-6 text-orange-600" />
                      <h3 className="text-lg font-semibold text-gray-900">SMS/Voice Alerts</h3>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setAlertsEnabled(!alertsEnabled)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          alertsEnabled 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                      >
                        {alertsEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                      <button
                        onClick={() => alertService.testVoiceAlert()}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200"
                      >
                        Test Voice
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">SMS Alerts</p>
                        <p className="text-sm text-blue-700">Get weather warnings via text</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <Volume2 className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-purple-900">Voice Alerts</p>
                        <p className="text-sm text-purple-700">Audio notifications for PWD users</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Community Reports */}
                <div className="card">
                  <div className="flex items-center space-x-3 mb-4">
                    <Users className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Community Field Reports</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {communityReports.map((report) => (
                      <div key={report.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{report.location}</span>
                          <span className="text-sm text-gray-500">{report.date}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Crop:</span>
                            <span className="ml-1 capitalize">{report.crop}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Conditions:</span>
                            <span className="ml-1 capitalize">{report.conditions}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Farmer:</span>
                            <span className="ml-1">{report.farmer}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {communityReports.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No community reports available</p>
                    )}
                  </div>
                </div>

                {/* Space Weather Warning */}
                <div className="card">
                  <div className="flex items-center space-x-3 mb-4">
                    <Compass className="h-6 w-6 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">GPS/Drone Operations</h3>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Satellite className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Space Weather Status: Normal</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      GPS accuracy is optimal. Safe for drone spraying and precision agriculture.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Current Crop Info */}
            {farmData.cropType && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Crop Information</h3>
                {(() => {
                  const crop = cropDatabase.find(c => c.id === farmData.cropType);
                  const CropIcon = crop?.icon || Wheat;
                  return (
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CropIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{crop?.name}</h4>
                        <p className="text-sm text-gray-500">
                          Water needs: {crop?.waterNeeds} • Optimal temp: {crop?.optimalTemp.min}°C - {crop?.optimalTemp.max}°C
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Weather Analysis */}
            {analysis && (
              <>
                {/* Farm Risk Assessment */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Risk Assessment</h3>
                  <div className="space-y-3">
                    {Object.entries(analysis.farmRisks).map(([riskType, riskData]) => {
                      const RiskIcon = getRiskIcon(riskData.level);
                      return (
                        <div key={riskType} className={`p-4 rounded-lg border ${getRiskColor(riskData.level)}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <RiskIcon className="h-5 w-5" />
                              <div>
                                <h4 className="font-medium capitalize">{riskType.replace(/([A-Z])/g, ' $1').trim()}</h4>
                                <p className="text-sm opacity-75">{riskData.probability}% probability</p>
                              </div>
                            </div>
                            <span className="text-sm font-medium capitalize">{riskData.level} Risk</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recommendations */}
                {analysis.recommendations.length > 0 && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Recommendations</h3>
                    <div className="space-y-4">
                      {analysis.recommendations.map((rec, index) => {
                        const RecIcon = rec.icon;
                        return (
                          <div key={index} className={`p-4 rounded-lg border ${
                            rec.type === 'warning' ? 'bg-red-50 border-red-200' :
                            rec.type === 'caution' ? 'bg-yellow-50 border-yellow-200' :
                            'bg-green-50 border-green-200'
                          }`}>
                            <div className="flex items-start space-x-3">
                              <RecIcon className={`h-5 w-5 mt-0.5 ${
                                rec.type === 'warning' ? 'text-red-600' :
                                rec.type === 'caution' ? 'text-yellow-600' :
                                'text-green-600'
                              }`} />
                              <div className="flex-1">
                                <h4 className={`font-medium ${
                                  rec.type === 'warning' ? 'text-red-800' :
                                  rec.type === 'caution' ? 'text-yellow-800' :
                                  'text-green-800'
                                }`}>{rec.title}</h4>
                                <p className={`text-sm mt-1 ${
                                  rec.type === 'warning' ? 'text-red-700' :
                                  rec.type === 'caution' ? 'text-yellow-700' :
                                  'text-green-700'
                                }`}>{rec.message}</p>
                                {rec.actions && (
                                  <ul className="mt-2 text-sm space-y-1">
                                    {rec.actions.map((action, i) => (
                                      <li key={i} className="flex items-center space-x-2">
                                        <span className="w-1 h-1 bg-current rounded-full"></span>
                                        <span>{action}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Planting Calendar */}
                {analysis.plantingCalendar && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Agricultural Calendar</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900">Current Season</h4>
                        <p className="text-sm text-blue-700 capitalize">{analysis.plantingCalendar.currentSeason}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900">Next Planting</h4>
                        <p className="text-sm text-green-700">{analysis.plantingCalendar.nextPlanting}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!analysis && (
              <div className="card text-center py-16">
                <div className="mb-6">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Ready to Analyze Farm Weather
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Enter your farm location and crop details to get weather insights 
                    tailored for Philippine agriculture.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                  {[
                    { icon: CloudRain, label: 'Flood Risk', color: 'text-blue-500' },
                    { icon: Sun, label: 'Drought Risk', color: 'text-orange-500' },
                    { icon: Wind, label: 'Wind Damage', color: 'text-gray-600' },
                    { icon: Thermometer, label: 'Heat Stress', color: 'text-red-500' }
                  ].map((item, index) => (
                    <div key={index} className="text-center">
                      <item.icon className={`h-8 w-8 ${item.color} mx-auto mb-2`} />
                      <p className="text-xs text-gray-500">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Voice Control Integration */}
      <VoiceControl 
        onLocationSelect={handleVoiceLocationSelect}
        onCropSelect={handleVoiceCropSelect}
        onAnalyze={handleVoiceAnalyze}
        currentPage="farm-weather"
        results={analysis}
        nasaResults={nasaAnalysis}
      />
    </div>
  );
};

export default FarmWeather;
