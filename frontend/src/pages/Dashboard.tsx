import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import { 
  fetchShotsByYear, 
  fetchShotTrends,
  setSelectedYear, 
  selectSelectedYear, 
  selectShotDistribution, 
  selectAvailableYears,
  selectShotLoading,
  selectShotError
} from '../features/shots/shotSlice';
import BasketballCourt from '../components/visualization/BasketballCourt';
import YearSelector from '../components/controls/YearSelector';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import ShotStats from '../components/visualization/ShotStats';
import MathematicalAnalysis from '../components/visualization/MathematicalAnalysis';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedYear = useSelector(selectSelectedYear);
  const shotDistribution = useSelector(selectShotDistribution);
  const availableYears = useSelector(selectAvailableYears);
  const isLoading = useSelector(selectShotLoading);
  const error = useSelector(selectShotError);
  
  useEffect(() => {
    if (selectedYear) {
      dispatch(fetchShotsByYear(selectedYear));
    }
    
    // Fetch trend data for mathematical analysis
    dispatch(fetchShotTrends());
  }, [dispatch, selectedYear]);
  
  const handleYearChange = (year: number) => {
    dispatch(setSelectedYear(year));
  };
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>NBA Shot Distribution Dashboard</h1>
        <p>
          Visualize how NBA shot patterns have evolved from 2017 to 2025. 
          Use the selector below to choose a specific year.
        </p>
        
        <div className="year-selector-container">
          <YearSelector 
            years={availableYears} 
            selectedYear={selectedYear} 
            onChange={handleYearChange} 
          />
        </div>
      </div>
      
      {error && <Alert type="error" message={error} />}
      
      <div className="dashboard-content">
        {isLoading ? (
          <div className="loader-container">
            <Spinner size="large" />
            <p>Loading shot data...</p>
          </div>
        ) : shotDistribution ? (
          <>
            <div className="visualization-container">
              <BasketballCourt 
                coordinates={shotDistribution.coordinates} 
                year={selectedYear}
              />
            </div>
            
            <div className="stats-container">
              <ShotStats distribution={shotDistribution} />
            </div>
            
            {/* Add full-width Mathematical Analysis section */}
            <div className="mathematical-analysis-wrapper">
              <MathematicalAnalysis />
            </div>
          </>
        ) : (
          <div className="no-data-message">
            <p>Select a year to view shot distribution data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;