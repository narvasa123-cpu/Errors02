# Weather Probability Predictor

A comprehensive weather prediction application built with React that provides weather probability analysis using NASA satellite data and meteorological APIs.

## Features

### Dual-Purpose Application
- **For Citizens/Events**: "Will it rain on my parade?" - Event planning with weather risk assessment
- **For Farmers**: "Will it rain on my crops?" - Agricultural decision support with crop-specific insights

### Weather Probabilities
- **Hot Weather** (>35°C)
- **Cold Weather** (<5°C) 
- **Wet Weather** (>10mm precipitation)
- **Windy Conditions** (>10m/s)
- **Uncomfortable Heat Index** (>32°C)

### NASA Data Integration
- **NASA POWER**: Temperature, precipitation, humidity, wind data
- **NASA GPM IMERG**: High-resolution precipitation data
- **NASA SMAP**: Soil moisture analysis
- **NASA DONKI**: Space weather monitoring

### Agricultural Features
- Crop-specific weather risk analysis (rice, corn, sugarcane, coconut, banana, vegetables)
- Farm risk assessment: flood, drought, wind damage, heat stress
- Agricultural calendar with planting/harvesting windows
- Philippines agricultural regions database
- NASA Earth observation data integration

### Event Planning
- Multi-day weather analysis for outdoor events
- Risk assessment and recommendations
- Interactive date selection and location search

## Tech Stack

- **Frontend**: React 18 + React Router
- **Styling**: TailwindCSS with custom components
- **Charts**: Recharts (bar charts, pie charts, line graphs)
- **Maps**: Leaflet.js for interactive maps
- **Backend**: Supabase for authentication and data storage
- **APIs**: 
  - Meteomatics Weather API (NASA-recommended)
  - NASA DONKI Space Weather API
  - NASA POWER Database
  - NASA GPM IMERG
  - NASA SMAP

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/weather-probability-predictor.git
   cd weather-probability-predictor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Weather API Configuration
   REACT_APP_METEOMATICS_USERNAME=your_username
   REACT_APP_METEOMATICS_PASSWORD=your_password
   REACT_APP_NASA_API_KEY=your_nasa_api_key
   
   # Supabase Configuration
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## API Keys Setup

### Meteomatics Weather API
1. Sign up at [Meteomatics](https://www.meteomatics.com/)
2. Get your username and password
3. Add to `.env` file

### NASA APIs
1. Get NASA API key from [NASA Open Data](https://api.nasa.gov/)
2. Add to `.env` file
3. NASA POWER, GPM, and SMAP APIs use the same key

### Supabase (Optional - for authentication)
1. Create account at [Supabase](https://supabase.com/)
2. Create new project
3. Get URL and anon key from project settings

## Usage

### Dashboard Mode
1. Enter location (city name or coordinates)
2. Select target date
3. View weather probabilities and insights
4. Export data as JSON

### Farm Weather Mode
1. Select agricultural region in Philippines
2. Choose crop type
3. View crop-specific weather risks
4. Get farmer recommendations

### Event Planning Mode
1. Enter event location and dates
2. View multi-day weather analysis
3. Get risk assessment for outdoor activities

## Project Structure

```
src/
├── components/
│   ├── LandingPage.js      # Homepage with features
│   ├── Dashboard.js        # Main weather search interface
│   ├── ResultsDisplay.js   # Weather probability results
│   ├── WeatherMap.js       # Interactive map component
│   ├── EventPlanner.js     # Event planning assistant
│   ├── FarmWeather.js      # Agricultural weather insights
│   └── VoiceControl.js     # Voice command functionality
├── services/
│   ├── weatherApiService.js    # NASA APIs integration
│   ├── weatherService.js       # Main weather service
│   └── api/
│       ├── spaceWeatherService.js      # NASA DONKI integration
│       └── nasaAgriculturalService.js  # Agricultural analysis
├── utils/
│   └── weatherCalculations.js  # Probability calculations
├── hooks/
│   └── useAuth.js          # Authentication hook
└── config/
    └── supabase.js         # Supabase configuration
```

## Key Features

- **15+ years of historical data** analysis with intelligent fallback mechanisms
- **Professional-grade meteorological data** used by researchers worldwide
- **Philippines-focused agricultural insights** with local crop databases
- **Space weather integration** for comprehensive atmospheric analysis
- **Voice control** for accessibility and hands-free operation
- **Mobile-responsive design** optimized for farmers and field use
- **Real-time data** from multiple NASA satellitemissions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **NASA** for providing free access to satellite data and APIs
- **Meteomatics** for professional weather data services
- **Philippine Department of Agriculture** for agricultural region data
- **React** and **TailwindCSS** communities for excellent documentation

## Support

For support, email your-email@example.com or create an issue on GitHub.

---

**Built with ❤️ for farmers, event planners, and weather enthusiasts in the Philippines and beyond.**
