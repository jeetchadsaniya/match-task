import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home.jsx';
import HowToAchieveGoal from './components/HowToAchieveGoal.jsx';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="nav-title">Cricheroes</h1>
            <div className="nav-links">
              <Link 
                to="/" 
                className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => setActiveTab('home')}
              >
                Home
              </Link>
              <Link 
                to="/how-to-achieve-goal" 
                className={`nav-link ${activeTab === 'goal' ? 'active' : ''}`}
                onClick={() => setActiveTab('goal')}
              >
                How to Achieve Goal
              </Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/how-to-achieve-goal" element={<HowToAchieveGoal />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
