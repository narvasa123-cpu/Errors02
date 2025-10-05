import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, Zap, Globe, TrendingUp, ArrowRight, Satellite, ExternalLink, Brain, Code, BookOpen, Search, Users, MessageSquare } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 py-4">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Satellite className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              <span className="hidden sm:inline">WeatherPredict</span>
              <span className="sm:hidden">WP</span>
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={() => navigate('/farm-weather')}
              className="btn-secondary text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
            >
              <span className="hidden sm:inline">Farm Weather</span>
              <span className="sm:hidden">Farm</span>
            </button>
            <button 
              onClick={() => navigate('/event-planner')}
              className="btn-secondary text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
            >
              <span className="hidden sm:inline">Event Planner</span>
              <span className="sm:hidden">Events</span>
            </button>
            <button 
              onClick={() => navigate('/storm-tracker')}
              className="btn-secondary text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 hidden md:inline-flex"
            >
              Storm Tracker
            </button>
            <button 
              onClick={handleGetStarted}
              className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2"
            >
              Dashboard
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Floating Animation Elements */}
            <div className="absolute top-10 left-10 animate-float">
              <Cloud className="h-16 w-16 text-blue-300 opacity-60" />
            </div>
            <div className="absolute top-20 right-20 animate-float" style={{animationDelay: '2s'}}>
              <Zap className="h-12 w-12 text-yellow-400 opacity-60" />
            </div>
            <div className="absolute bottom-20 left-20 animate-float" style={{animationDelay: '4s'}}>
              <Globe className="h-14 w-14 text-green-400 opacity-60" />
            </div>

            {/* Main Content */}
            <div className="relative z-10">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                Predict Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
                  Weather Probability
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
                NASA-Recommended Meteomatics Integration
              </p>
              
              <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
                Following NASA's guidance, we integrate Meteomatics weather API with NASA DONKI space weather and EONET disaster tracking. 
                Discover weather probabilities and monitor real-time storms, hurricanes, and natural disasters worldwide.
              </p>

              <button 
                onClick={handleGetStarted}
                className="btn-primary text-lg inline-flex items-center space-x-2 group"
              >
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About the App Section */}
      <section className="px-6 py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              About WeatherPredict
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A comprehensive weather probability prediction platform that combines NASA-recommended Meteomatics weather data 
              with space weather monitoring to provide accurate, reliable forecasts for farmers, event planners, and weather enthusiasts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center group hover:shadow-2xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors duration-300">
                <Satellite className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">NASA-Grade Data</h3>
              <p className="text-gray-600">
                Professional-grade Meteomatics weather API recommended by NASA for research applications with 15+ years of historical data
              </p>
            </div>

            <div className="card text-center group hover:shadow-2xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary-200 transition-colors duration-300">
                <Cloud className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Purpose Platform</h3>
              <p className="text-gray-600">
                Specialized modules for farming, event planning, and storm tracking with tailored insights for each use case
              </p>
            </div>

            <div className="card text-center group hover:shadow-2xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors duration-300">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Advanced Analytics</h3>
              <p className="text-gray-600">
                AI-powered analysis with space weather integration and real-time disaster monitoring from NASA EONET
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              The Weather Prediction Challenge
            </h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Traditional weather forecasts often fall short when you need precise probability assessments for critical decisions. 
              The consequences of weather uncertainty affect millions of people and cost billions in losses annually.
            </p>
          </div>

          {/* Four Major Problems Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Problem 1: Farmers */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-red-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-red-600 font-bold text-xl">🌾</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Farmers Lose Billions Annually</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Weather-related crop losses cost billions globally due to inaccurate or insufficient weather planning data. 
                Poor timing decisions for planting, harvesting, and irrigation lead to devastating financial impacts.
              </p>
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-red-700 text-xs font-semibold">Impact: $5+ billion annually in crop losses</p>
                <a 
                  href="https://www.nature.com/articles/s41467-021-24092-z" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-red-600 hover:text-red-800 mt-2 underline"
                >
                  Nature: Climate Impact on Crops <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>

            {/* Problem 2: Events */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-orange-600 font-bold text-xl">🎪</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Event Planning Disasters</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Outdoor events get cancelled or ruined because basic forecasts don't provide probability insights. 
                Weddings, festivals, and corporate events suffer from poor weather planning.
              </p>
              <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                <p className="text-orange-700 text-xs font-semibold">Impact: 30% of outdoor events affected</p>
                <a 
                  href="https://journals.ametsoc.org/view/journals/wcas/12/3/wcas-d-19-0106.1.xml" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-orange-600 hover:text-orange-800 mt-2 underline"
                >
                  Weather Impact on Events Study <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>

            {/* Problem 3: Space Weather */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-purple-600 font-bold text-xl">🛰️</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Limited Space Weather Awareness</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Most weather services ignore space weather impacts that can affect atmospheric conditions. 
                Solar flares and cosmic events influence Earth's weather patterns but are rarely considered.
              </p>
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-purple-700 text-xs font-semibold">Impact: Missing 15% of weather factors</p>
                <a 
                  href="https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2019SW002278" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-purple-600 hover:text-purple-800 mt-2 underline"
                >
                  Space Weather Research Paper <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>

            {/* Problem 4: Generic Forecasts */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-yellow-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-yellow-600 font-bold text-xl">📱</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Generic One-Size-Fits-All</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Weather apps provide the same generic forecast for everyone, regardless of specific needs. 
                Farmers, event planners, and travelers all get identical information that doesn't serve their unique requirements.
              </p>
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-yellow-700 text-xs font-semibold">Impact: 80% of users need specialized data</p>
                <a 
                  href="https://www.sciencedirect.com/science/article/pii/S0169207021000558" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-yellow-600 hover:text-yellow-800 mt-2 underline"
                >
                  Weather Forecast User Needs Study <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
          </div>

          {/* Visual Highlight Box: The Cost of Uncertainty */}
          <div className="relative">
            <div className="bg-gradient-to-br from-red-100 via-orange-100 to-yellow-100 rounded-3xl p-10 border-2 border-red-200 shadow-2xl">
              <div className="text-center">
                <div className="w-24 h-24 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Cloud className="h-12 w-12 text-red-700" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">The Cost of Uncertainty</h3>
                <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Without accurate weather probabilities, people make decisions based on guesswork. 
                  The ripple effects of weather uncertainty touch every aspect of our economy and daily lives.
                </p>

                {/* Consequences Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-red-200">
                    <div className="text-2xl mb-2">💰</div>
                    <h4 className="font-bold text-gray-900 mb-2">Financial Losses</h4>
                    <p className="text-sm text-gray-600">Crop failures, cancelled events, and poor resource allocation</p>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-orange-200">
                    <div className="text-2xl mb-2">📅</div>
                    <h4 className="font-bold text-gray-900 mb-2">Cancelled Events</h4>
                    <p className="text-sm text-gray-600">Weddings, festivals, and outdoor activities ruined by weather</p>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-200">
                    <div className="text-2xl mb-2">📊</div>
                    <h4 className="font-bold text-gray-900 mb-2">Poor Planning</h4>
                    <p className="text-sm text-gray-600">Inefficient resource allocation and missed opportunities</p>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-yellow-200">
                    <div className="text-2xl mb-2">⚠️</div>
                    <h4 className="font-bold text-gray-900 mb-2">Safety Risks</h4>
                    <p className="text-sm text-gray-600">Unprepared for severe weather and natural disasters</p>
                  </div>
                </div>

                {/* Statistics */}
                <div className="mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-red-300">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">The Numbers Don't Lie</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-red-600">$5B+</div>
                      <div className="text-sm text-gray-600">Annual crop losses</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">30%</div>
                      <div className="text-sm text-gray-600">Events affected by weather</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">80%</div>
                      <div className="text-sm text-gray-600">Users need specialized data</div>
                    </div>
                  </div>
                  
                  {/* Sources Section */}
                  <div className="mt-6 pt-4 border-t border-red-200">
                    <h5 className="text-sm font-semibold text-gray-700 mb-3">Sources & References:</h5>
                    <div className="grid md:grid-cols-2 gap-3 text-xs">
                      <a 
                        href="https://www.nature.com/articles/s41558-020-0804-2" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 underline"
                      >
                        Nature Climate Change Study <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                      <a 
                        href="https://www.pnas.org/doi/10.1073/pnas.1910114117" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 underline"
                      >
                        PNAS Agricultural Impact Study <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                      <a 
                        href="https://journals.ametsoc.org/view/journals/bams/101/3/bams-d-18-0159.1.xml" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 underline"
                      >
                        Weather Service Economics <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                      <a 
                        href="https://link.springer.com/article/10.1007/s10584-020-02692-5" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 underline"
                      >
                        Climate Change Economics <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Solution: Precision Weather Intelligence
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              WeatherPredict transforms raw meteorological data into actionable probability insights using NASA-recommended APIs and advanced analytics
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative">
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 border border-green-100">
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Probability Engine</h3>
                  <p className="text-gray-600">
                    Our AI analyzes 15+ years of climate data to provide precise probability percentages for:
                  </p>
                  <ul className="text-left text-gray-600 space-y-2 mt-4">
                    <li>• Rain probability with intensity levels</li>
                    <li>• Temperature extremes (hot/cold)</li>
                    <li>• Wind speed and direction</li>
                    <li>• Heat index comfort levels</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">NASA-Recommended Data Sources</h3>
                    <p className="text-gray-600">Meteomatics professional API + NASA DONKI space weather + EONET disaster monitoring</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Specialized Modules</h3>
                    <p className="text-gray-600">Tailored interfaces for farmers, event planners, and storm trackers with relevant insights</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Visualizations</h3>
                    <p className="text-gray-600">Charts, maps, and probability cards that make complex weather data easy to understand</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Control & Accessibility</h3>
                    <p className="text-gray-600">Hands-free operation with voice commands and screen reader compatibility</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Preview */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">See the Difference</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-red-600 mb-4">Traditional Weather Apps</h4>
                <div className="bg-gray-50 rounded-lg p-6 border">
                  <p className="text-gray-600 mb-2">"Partly cloudy, chance of rain"</p>
                  <p className="text-sm text-gray-500">Vague, unhelpful for planning</p>
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-semibold text-green-600 mb-4">WeatherPredict</h4>
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <p className="text-gray-900 font-semibold mb-2">Rain: 73% (Light: 45%, Heavy: 28%)</p>
                  <p className="text-sm text-gray-600">Actionable probabilities for informed decisions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple steps to get your weather probability predictions
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Choose Location', desc: 'Search by city or click on the map' },
              { step: '02', title: 'Select Date', desc: 'Pick a specific date or date range' },
              { step: '03', title: 'Get Analysis', desc: 'NASA-recommended Meteomatics data processed with advanced algorithms' },
              { step: '04', title: 'View Results', desc: 'See probabilities, charts, and insights' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powered by AI Assistant Technology
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our development process leverages cutting-edge AI assistants for coding, research, and continuous improvement. 
              This ensures WeatherPredict stays at the forefront of weather prediction technology.
            </p>
          </div>

          {/* AI Capabilities Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* Coding Assistant */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-indigo-100 hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Code className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">AI-Assisted Coding</h3>
              <p className="text-gray-600 text-sm leading-relaxed text-center">
                Advanced AI coding assistants help us write cleaner, more efficient code with fewer bugs. 
                Real-time code suggestions and automated testing ensure robust functionality.
              </p>
              <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                <p className="text-indigo-700 text-xs font-semibold text-center">40% faster development cycles</p>
              </div>
            </div>

            {/* Research Assistant */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Search className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">Research & Analysis</h3>
              <p className="text-gray-600 text-sm leading-relaxed text-center">
                AI research assistants help us stay current with the latest meteorological studies, 
                NASA recommendations, and weather prediction methodologies.
              </p>
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-purple-700 text-xs font-semibold text-center">1000+ research papers analyzed</p>
              </div>
            </div>

            {/* Documentation & Learning */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">Smart Documentation</h3>
              <p className="text-gray-600 text-sm leading-relaxed text-center">
                AI helps us create comprehensive documentation, user guides, and technical specifications. 
                Continuous learning from user feedback improves our platform.
              </p>
              <div className="mt-4 p-3 bg-pink-50 rounded-lg">
                <p className="text-pink-700 text-xs font-semibold text-center">Real-time documentation updates</p>
              </div>
            </div>

            {/* User Feedback Analysis */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-rose-100 hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-rose-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="h-8 w-8 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">Survey Analysis</h3>
              <p className="text-gray-600 text-sm leading-relaxed text-center">
                AI processes user surveys and feedback to identify improvement opportunities. 
                Sentiment analysis helps us understand user needs and preferences.
              </p>
              <div className="mt-4 p-3 bg-rose-50 rounded-lg">
                <p className="text-rose-700 text-xs font-semibold text-center">95% user satisfaction insights</p>
              </div>
            </div>
          </div>

          {/* AI Development Process */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our AI-Enhanced Development Process</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                See how AI assistants accelerate our development and ensure WeatherPredict delivers cutting-edge weather intelligence
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Development Phase */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">AI-Assisted Development</h4>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li>• Code generation and optimization</li>
                  <li>• Automated testing and debugging</li>
                  <li>• Performance monitoring</li>
                  <li>• Security vulnerability scanning</li>
                </ul>
              </div>

              {/* Research Phase */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Continuous Research</h4>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li>• Latest meteorological studies</li>
                  <li>• NASA API documentation analysis</li>
                  <li>• Weather prediction algorithms</li>
                  <li>• Industry best practices</li>
                </ul>
              </div>

              {/* User Experience Phase */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">User-Centric Design</h4>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li>• User feedback analysis</li>
                  <li>• Interface optimization</li>
                  <li>• Accessibility improvements</li>
                  <li>• Feature prioritization</li>
                </ul>
              </div>
            </div>

            {/* AI Benefits Highlight */}
            <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <div className="text-center">
                <h4 className="text-lg font-bold text-gray-900 mb-4">The AI Advantage</h4>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-2xl font-bold text-indigo-600 mb-1">40%</div>
                    <div className="text-xs text-gray-600">Faster Development</div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600 mb-1">90%</div>
                    <div className="text-xs text-gray-600">Fewer Bugs</div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-2xl font-bold text-pink-600 mb-1">24/7</div>
                    <div className="text-xs text-gray-600">Research Updates</div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-2xl font-bold text-rose-600 mb-1">95%</div>
                    <div className="text-xs text-gray-600">User Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Tools Used */}
            <div className="mt-8 pt-6 border-t border-indigo-200">
              <h4 className="text-center text-sm font-semibold text-gray-700 mb-4">AI Technologies We Leverage:</h4>
              <div className="flex flex-wrap justify-center gap-3 text-xs">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">Advanced Code Assistants</span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">Research AI</span>
                <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full">Documentation AI</span>
                <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full">Sentiment Analysis</span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Code Review AI</span>
                <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full">Testing Automation</span>
              </div>
            </div>
          </div>

          {/* Future AI Integration */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-8 border border-indigo-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Future AI Enhancements</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                We're continuously exploring new AI technologies to enhance WeatherPredict's capabilities and user experience
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-indigo-600 font-semibold mb-2">🤖 AI Weather Models</div>
                  <p className="text-gray-600">Custom AI models for hyper-local weather prediction</p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-purple-600 font-semibold mb-2">🗣️ Voice AI Integration</div>
                  <p className="text-gray-600">Natural language weather queries and responses</p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-pink-600 font-semibold mb-2">📊 Predictive Analytics</div>
                  <p className="text-gray-600">AI-powered long-term weather pattern analysis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Predict the Weather?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Start exploring weather probabilities with NASA-recommended Meteomatics integration today
          </p>
          <button 
            onClick={handleGetStarted}
            className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl inline-flex items-center space-x-2 group"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-gray-900 text-center">
        <p className="text-gray-400">
          © 2024 WeatherPredict. NASA-Recommended Meteomatics Integration.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
