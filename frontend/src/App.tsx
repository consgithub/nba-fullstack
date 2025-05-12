import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
// import Navbar from './components/layout/Navbar';
// import Spinner from './components/ui/Spinner';
import './App.css';

// Lazy-loaded components
// const Dashboard = lazy(() => import('./pages/Dashboard'));
// const TrendAnalysis = lazy(() => import('./pages/TrendAnalysis'));
// const NotFound = lazy(() => import('./pages/NotFound'));

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <h1>NBA Shot Visualization</h1>
        <p>Testing with Router</p>
      </div>
    </Router>
  );
};

export default App;