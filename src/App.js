import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import StormTracker from './components/StormTracker';
import EventPlanner from './components/EventPlanner';
import FarmWeather from './components/FarmWeather';
import AccessibilityPanel from './components/AccessibilityPanel';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
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
    </Router>
  );
}

export default App;
