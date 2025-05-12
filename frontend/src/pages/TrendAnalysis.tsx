import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import { 
  fetchShotTrends, 
  selectShotTrends, 
  selectShotLoading, 
  selectShotError 
} from '../features/shots/shotSlice';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import TrendChart from '../components/visualization/TrendChart';
import '../TrendAnalysis.css';

const TrendAnalysis: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const trends = useSelector(selectShotTrends);
  const isLoading = useSelector(selectShotLoading);
  const error = useSelector(selectShotError);
  
  useEffect(() => {
    dispatch(fetchShotTrends());
  }, [dispatch]);
  
  // Colors for different shot zones (should match other components)
  const zoneColors: { [key: string]: string } = {
    'Restricted Area': '#FF5733',
    'Paint': '#FFC300',
    'Mid-Range': '#36A2EB',
    'Corner 3': '#4BC0C0',
    'Above Break 3': '#9966FF',
    'Backcourt': '#C9CBCF'
  };
  
  // Group zones by category for better visualization
  const frequencyTrends = trends.filter(trend => 
    ['Restricted Area', 'Paint', 'Mid-Range', 'Corner 3', 'Above Break 3'].includes(trend.zone)
  );
  
  // Efficiency trends for key zones
  const efficiencyTrends = trends.filter(trend => 
    ['Restricted Area', 'Mid-Range', 'Corner 3', 'Above Break 3'].includes(trend.zone)
  );
  
  return (
    <div className="trend-analysis">
      <div className="trend-header">
        <h1>NBA Shot Trend Analysis (2017-2025)</h1>
        <p>
          This visualization shows how NBA shooting patterns have evolved over time.
          The charts below highlight changes in both shot frequency and shooting efficiency.
        </p>
      </div>
      
      {error && <Alert type="error" message={error} />}
      
      {isLoading ? (
        <div className="loader-container">
          <Spinner size="large" />
          <p>Loading trend data...</p>
        </div>
      ) : trends.length > 0 ? (
        <div className="trend-charts">
          <div className="chart-container">
            <h2>Shot Frequency by Zone</h2>
            <p>How the distribution of shots has changed over time</p>
            <TrendChart 
              data={frequencyTrends} 
              colors={zoneColors}
              dataKey="frequency"
              yAxisLabel="Frequency (%)"
              yAxisDomain={[0, 40]}
            />
            
            <div className="trend-insights">
              <h3>Key Observations</h3>
              <ul>
                <li>Three-point attempts (Corner 3 and Above Break 3) have steadily increased over time.</li>
                <li>Mid-range shots have significantly decreased as teams focus on more efficient shots.</li>
                <li>Shots at the rim (Restricted Area) remain a high priority due to their efficiency.</li>
              </ul>
            </div>
          </div>
          
          <div className="chart-container">
            <h2>Shooting Efficiency by Zone</h2>
            <p>How shooting percentages have changed over time</p>
            <TrendChart 
              data={efficiencyTrends} 
              colors={zoneColors}
              dataKey="percentage"
              yAxisLabel="FG%"
              yAxisDomain={[30, 70]}
            />
            
            <div className="trend-insights">
              <h3>Key Observations</h3>
              <ul>
                <li>Shooting efficiency has improved across almost all zones as player skill development advances.</li>
                <li>The gap between rim efficiency and other zones remains significant.</li>
                <li>Three-point shooting has shown the most improvement, particularly from the corners.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-data-message">
          <p>No trend data available. Please check back later.</p>
        </div>
      )}
    </div>
  );
};

export default TrendAnalysis;