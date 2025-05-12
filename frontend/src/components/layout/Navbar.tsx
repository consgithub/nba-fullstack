import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <span className="nba-logo">🏀</span> NBA Shot Visualization
        </Link>
        
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/trends" className={`nav-link ${location.pathname === '/trends' ? 'active' : ''}`}>
              Trend Analysis
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;