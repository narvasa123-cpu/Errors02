import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import StormTracker from './components/StormTracker';
import EventPlanner from './components/EventPlanner';
import FarmWeather from './components/FarmWeather';
import AccessibilityPanel from './components/AccessibilityPanel';
import './App.css';

// Component to conditionally show navigation
const AppContent = () => {
  const location = useLocation();
  const showNavigation = location.pathname !== '/';

  return (
    <div className="App">
      {showNavigation && <Navigation />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/storm-tracker" element={<StormTracker />} />
        <Route path="/event-planner" element={<EventPlanner />} />
        <Route path="/farm-weather" element={<FarmWeather />} />
      </Routes>
      
      {/* Global Accessibility Panel */}
      <AccessibilityPanel />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
