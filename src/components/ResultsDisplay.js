import { 
  TrendingUp, 
  TrendingDown, 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  AlertTriangle,
  Download,
  BarChart3,
  Zap,
  Satellite,
  MapPin,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const ResultsDisplay = ({ results }) => {
  const { probabilities, location, date, summary, historicalData } = results;

  // Prepare data for charts
  const probabilityData = [
    { name: 'Hot (>35°C)', value: probabilities.hot, color: '#ef4444' },
    { name: 'Cold (<5°C)', value: probabilities.cold, color: '#3b82f6' },
    { name: 'Wet (>10mm)', value: probabilities.wet, color: '#06b6d4' },
    { name: 'Windy (>10m/s)', value: probabilities.windy, color: '#6b7280' },
    { name: 'Uncomfortable', value: probabilities.uncomfortable, color: '#f59e0b' }
  ];

  const monthlyData = historicalData?.monthly || [];
  const COLORS = ['#ef4444', '#3b82f6', '#06b6d4', '#6b7280', '#f59e0b'];

  const getProbabilityLevel = (value) => {
    if (value >= 70) return { level: 'High', color: 'text-red-600', bg: 'bg-red-50' };
    if (value >= 40) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'Low', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Weather Probability Results</h2>
          <div className="text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{location.lat.toFixed(4)}, {location.lon.toFixed(4)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(date)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Summary</h3>
          <p className="text-blue-800">{summary}</p>
        </div>
      </div>

      {/* Probability Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[
          { 
            key: 'hot', 
            label: 'Hot Weather', 
            description: 'Temperature > 35°C',
            icon: Thermometer, 
            color: 'text-red-500',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200'
          },
          { 
            key: 'cold', 
            label: 'Cold Weather', 
            description: 'Temperature < 5°C',
            icon: Thermometer, 
            color: 'text-blue-500',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200'
          },
          { 
            key: 'wet', 
            label: 'Rainfall', 
            description: 'Precipitation > 10mm',
            icon: Droplets, 
            color: 'text-cyan-500',
            bgColor: 'bg-cyan-50',
            borderColor: 'border-cyan-200'
          },
          { 
            key: 'windy', 
            label: 'Windy', 
            description: 'Wind speed > 10m/s',
            icon: Wind, 
            color: 'text-gray-500',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200'
          },
          { 
            key: 'uncomfortable', 
            label: 'Heat Index', 
            description: 'Feels like > 32°C',
            icon: Sun, 
            color: 'text-orange-500',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200'
          }
        ].map((condition) => {
          const probability = probabilities[condition.key];
          const level = getProbabilityLevel(probability);
          
          return (
            <div key={condition.key} className={`card border-2 ${condition.borderColor} ${condition.bgColor}`}>
              <div className="flex items-center justify-between mb-3">
                <condition.icon className={`h-6 w-6 ${condition.color}`} />
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${level.color} ${level.bg}`}>
                  {level.level}
                </span>
              </div>
              
              <div className="mb-2">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {probability}%
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {condition.label}
                </div>
                <div className="text-xs text-gray-500">
                  {condition.description}
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    condition.key === 'hot' ? 'bg-red-500' :
                    condition.key === 'cold' ? 'bg-blue-500' :
                    condition.key === 'wet' ? 'bg-cyan-500' :
                    condition.key === 'windy' ? 'bg-gray-500' :
                    'bg-orange-500'
                  }`}
                  style={{ width: `${probability}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Probability Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={probabilityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Probability']}
                labelStyle={{ color: '#374151' }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Condition Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={probabilityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {probabilityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Probability']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Trends */}
      {monthlyData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Historical Monthly Trends
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Avg Temperature (°C)"
              />
              <Line 
                type="monotone" 
                dataKey="rainfall" 
                stroke="#06b6d4" 
                strokeWidth={2}
                name="Avg Rainfall (mm)"
              />
              <Line 
                type="monotone" 
                dataKey="windSpeed" 
                stroke="#6b7280" 
                strokeWidth={2}
                name="Avg Wind Speed (m/s)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Space Weather Integration */}
      {results.spaceWeather && (
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Satellite className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">NASA Space Weather Analysis</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <h4 className="font-medium text-purple-900">Space Weather Impact</h4>
              </div>
              <p className="text-sm text-purple-700 capitalize">
                <strong>Level:</strong> {results.spaceWeather.impactLevel}
              </p>
              <p className="text-sm text-purple-700">
                <strong>Events:</strong> {results.spaceWeather.eventCount} detected
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-blue-900">Atmospheric Conditions</h4>
              </div>
              <p className="text-xs text-blue-700">
                {results.spaceWeather.description}
              </p>
            </div>
          </div>

          {results.spaceWeather.hasEvents && results.spaceWeather.events.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Recent Space Weather Events</h4>
              <div className="space-y-2">
                {results.spaceWeather.events.slice(0, 2).map((event, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          CME Event {event.activityID}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(event.startTime).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        Solar Activity
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* NASA Data Sources Integration */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Satellite className="h-5 w-5 mr-2 text-blue-600" />
          NASA Data Sources Integration
        </h3>
        
        {/* Active Data Sources */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {results.dataSources?.map((source, index) => {
            const isActive = !source.includes('simulated');
            return (
              <div key={index} className={`p-3 sm:p-4 rounded-lg border-2 ${
                isActive 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center mb-2">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    isActive ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <h4 className={`font-medium text-sm ${
                    isActive ? 'text-green-900' : 'text-yellow-900'
                  }`}>
                    {source.replace(' (simulated)', '')}
                  </h4>
                </div>
                <p className={`text-xs ${
                  isActive ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {isActive ? 'Live NASA Data' : 'Simulated Data'}
                </p>
              </div>
            );
          })}
        </div>

        {/* Detailed NASA API Information */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2 text-sm">NASA POWER API</h4>
            <p className="text-xs text-blue-700 mb-2">
              Prediction Of Worldwide Energy Resources - Temperature, precipitation, humidity, solar radiation
            </p>
            <div className="text-xs text-blue-600">
              <p>• 15+ years historical data</p>
              <p>• Daily/Monthly resolution</p>
              <p>• Global coverage</p>
            </div>
          </div>
          
          <div className="p-3 sm:p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <h4 className="font-medium text-cyan-900 mb-2 text-sm">NASA GPM IMERG</h4>
            <p className="text-xs text-cyan-700 mb-2">
              Global Precipitation Measurement - High-resolution rainfall data from satellite constellation
            </p>
            <div className="text-xs text-cyan-600">
              <p>• 0.1° x 0.1° resolution</p>
              <p>• 30-minute temporal</p>
              <p>• Multi-satellite data</p>
            </div>
          </div>
          
          <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2 text-sm">NASA SMAP</h4>
            <p className="text-xs text-green-700 mb-2">
              Soil Moisture Active Passive - L-band microwave soil moisture measurements
            </p>
            <div className="text-xs text-green-600">
              <p>• 36km resolution</p>
              <p>• 2-3 day revisit</p>
              <p>• Root zone moisture</p>
            </div>
          </div>
          
          <div className="p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-medium text-purple-900 mb-2 text-sm">NASA DONKI</h4>
            <p className="text-xs text-purple-700 mb-2">
              Database Of Notifications, Knowledge, Information - Space weather events and solar activity
            </p>
            <div className="text-xs text-purple-600">
              <p>• Real-time CME data</p>
              <p>• Solar flare monitoring</p>
              <p>• Atmospheric impact</p>
            </div>
          </div>
        </div>
        
        {/* Enhanced Analysis with NASA Data */}
        {results.enhancedAnalysis && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Zap className="h-4 w-4 mr-2 text-blue-600" />
              Enhanced NASA Data Analysis
            </h4>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="bg-white p-3 rounded-lg border">
                <h5 className="font-medium text-gray-900 mb-2 text-sm">Data Integration</h5>
                <div className="space-y-1 text-xs">
                  <p className={`${results.enhancedAnalysis.dataIntegration.nasaPowerAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                    ✓ NASA POWER: {results.enhancedAnalysis.dataIntegration.nasaPowerAvailable ? 'Active' : 'Unavailable'}
                  </p>
                  <p className={`${results.enhancedAnalysis.dataIntegration.gpmPrecipitationAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                    ✓ GPM Precipitation: {results.enhancedAnalysis.dataIntegration.gpmPrecipitationAvailable ? 'Active' : 'Unavailable'}
                  </p>
                  <p className={`${results.enhancedAnalysis.dataIntegration.smapSoilMoistureAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                    ✓ SMAP Soil Moisture: {results.enhancedAnalysis.dataIntegration.smapSoilMoistureAvailable ? 'Active' : 'Unavailable'}
                  </p>
                  <p className={`${results.enhancedAnalysis.dataIntegration.spaceWeatherAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                    ✓ Space Weather: {results.enhancedAnalysis.dataIntegration.spaceWeatherAvailable ? 'Active' : 'Unavailable'}
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border">
                <h5 className="font-medium text-gray-900 mb-2 text-sm">Data Confidence</h5>
                <div className="flex items-center mb-2">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    results.enhancedAnalysis.confidence === 'very_high' ? 'bg-green-500' :
                    results.enhancedAnalysis.confidence === 'high' ? 'bg-blue-500' :
                    results.enhancedAnalysis.confidence === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium capitalize">
                    {results.enhancedAnalysis.confidence.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Based on {Object.values(results.enhancedAnalysis.dataIntegration).filter(Boolean).length} active NASA data sources
                </p>
              </div>
              
              {results.enhancedAnalysis.enhancedMetrics?.soilWaterBalance && (
                <div className="bg-white p-3 rounded-lg border">
                  <h5 className="font-medium text-gray-900 mb-2 text-sm">Soil Water Balance</h5>
                  <div className="text-xs">
                    <p className={`font-medium ${
                      results.enhancedAnalysis.enhancedMetrics.soilWaterBalance.balanceStatus === 'surplus' ? 'text-blue-600' :
                      results.enhancedAnalysis.enhancedMetrics.soilWaterBalance.balanceStatus === 'deficit' ? 'text-red-600' :
                      'text-green-600'
                    }`}>
                      Status: {results.enhancedAnalysis.enhancedMetrics.soilWaterBalance.balanceStatus}
                    </p>
                    {results.enhancedAnalysis.enhancedMetrics.soilWaterBalance.recommendations.map((rec, i) => (
                      <p key={i} className="text-gray-600 mt-1">• {rec}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Cross-validation Results */}
            {results.enhancedAnalysis.crossValidation?.precipitation && (
              <div className="bg-white p-3 rounded-lg border">
                <h5 className="font-medium text-gray-900 mb-2 text-sm">Precipitation Data Cross-Validation</h5>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-gray-600">NASA POWER vs GPM IMERG</p>
                    <p className="font-medium">
                      Correlation: {(results.enhancedAnalysis.crossValidation.precipitation.correlation * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Data Agreement</p>
                    <p className={`font-medium capitalize ${
                      results.enhancedAnalysis.crossValidation.precipitation.agreement === 'excellent' ? 'text-green-600' :
                      results.enhancedAnalysis.crossValidation.precipitation.agreement === 'good' ? 'text-blue-600' :
                      results.enhancedAnalysis.crossValidation.precipitation.agreement === 'moderate' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {results.enhancedAnalysis.crossValidation.precipitation.agreement}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <div className="text-sm text-blue-800">
              <p><strong>NASA Integration:</strong> Multi-source validation using {results.dataSources?.length || 4} NASA APIs</p>
              <p><strong>Methodology:</strong> Cross-validated satellite and ground-based measurements</p>
              <p><strong>Data Quality:</strong> {results.metadata?.dataQuality || 'High'} - Professional research-grade accuracy</p>
              <p><strong>Coverage:</strong> Global analysis with 15+ years historical context</p>
            </div>
          </div>
        </div>
        
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Probabilities are calculated based on 15+ years of historical patterns. 
              Actual weather conditions may vary due to climate change and local factors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
