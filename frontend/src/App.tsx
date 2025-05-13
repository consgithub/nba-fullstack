import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Spinner from './components/ui/Spinner';
import './App.css';

// Lazy-loaded components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TrendAnalysis = lazy(() => import('./pages/TrendAnalysis'));
const NotFound = lazy(() => import('./pages/NotFound'));

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="container">
          <Suspense fallback={<div className="loader-container"><Spinner /></div>}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/trends" element={<TrendAnalysis />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
};

export default App;