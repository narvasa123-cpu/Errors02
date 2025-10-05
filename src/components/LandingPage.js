import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, Zap, Globe, TrendingUp, ArrowRight, Satellite } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Satellite className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">WeatherPredict</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/farm-weather')}
              className="btn-secondary"
            >
              Farm Weather
            </button>
            <button 
              onClick={() => navigate('/event-planner')}
              className="btn-secondary"
            >
              Event Planner
            </button>
            <button 
              onClick={() => navigate('/storm-tracker')}
              className="btn-secondary"
            >
              Storm Tracker
            </button>
            <button 
              onClick={handleGetStarted}
              className="btn-primary"
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

      {/* Features Section */}
      <section className="px-6 py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Makes Us Different
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Following NASA's recommendation, we integrate Meteomatics weather API with NASA DONKI space weather data for comprehensive analysis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center group hover:shadow-2xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors duration-300">
                <Satellite className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">NASA-Recommended API</h3>
              <p className="text-gray-600">
                Meteomatics professional weather data as recommended by NASA for research applications
              </p>
            </div>

            <div className="card text-center group hover:shadow-2xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary-200 transition-colors duration-300">
                <Cloud className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Analysis</h3>
              <p className="text-gray-600">
                Machine learning algorithms analyze 15+ years of climate patterns for accurate predictions
              </p>
            </div>

            <div className="card text-center group hover:shadow-2xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors duration-300">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Space Weather Integration</h3>
              <p className="text-gray-600">
                NASA DONKI space weather data integration for comprehensive atmospheric analysis
              </p>
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
