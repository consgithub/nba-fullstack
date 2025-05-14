import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Try with explicit file extensions
import Navbar from './components/layout/Navbar.tsx';
import Spinner from './components/ui/Spinner.tsx';
import './App.css';

// For lazy-loaded components
const Dashboard = lazy(() => import('./pages/Dashboard.tsx'));
const TrendAnalysis = lazy(() => import('./pages/TrendAnalysis.tsx'));
const NotFound = lazy(() => import('./pages/NotFound.tsx'));

// Remove the React.FC type annotation as it might be causing issues with React 19
function App() {
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
}

export default App;