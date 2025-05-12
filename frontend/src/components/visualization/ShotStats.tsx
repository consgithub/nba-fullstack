import React from 'react';
import { ShotDistribution } from '../../features/shots/shotSlice';
import '../../styles/ShotStats.css';

interface ShotStatsProps {
  distribution: ShotDistribution;
}

const ShotStats: React.FC<ShotStatsProps> = ({ distribution }) => {
  // Sort zones by frequency (descending)
  const sortedZones = Object.keys(distribution.zoneFrequency).sort(
    (a, b) => distribution.zoneFrequency[b] - distribution.zoneFrequency[a]
  );
  
  // Colors for different shot zones (should match BasketballCourt.tsx)
  const zoneColors: { [key: string]: string } = {
    'Restricted Area': '#FF5733',
    'Paint': '#FFC300',
    'Mid-Range': '#36A2EB',
    'Corner 3': '#4BC0C0',
    'Above Break 3': '#9966FF',
    'Backcourt': '#C9CBCF'
  };
  
  // Format percentage with one decimal
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  
  return (
    <div className="shot-stats">
      <h2>Shot Distribution Stats ({distribution.year})</h2>
      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-label">Total Shots:</span>
          <span className="stat-value">{distribution.totalShots.toLocaleString()}</span>
        </div>
      </div>
      
      <h3>Shot Distribution by Zone</h3>
      <div className="zone-stats">
        <table className="zone-table">
          <thead>
            <tr>
              <th>Zone</th>
              <th>Frequency</th>
              <th>% of Total</th>
              <th>FG%</th>
            </tr>
          </thead>
          <tbody>
            {sortedZones.map(zone => (
              <tr key={zone}>
                <td>
                  <span 
                    className="zone-color" 
                    style={{ backgroundColor: zoneColors[zone] }}
                  ></span>
                  {zone}
                </td>
                <td>{distribution.shotZones[zone].total.toLocaleString()}</td>
                <td>
                  <div className="percentage-bar-container">
                    <div 
                      className="percentage-bar" 
                      style={{ 
                        width: `${distribution.zoneFrequency[zone]}%`,
                        backgroundColor: zoneColors[zone]
                      }}
                    ></div>
                    <span>{formatPercentage(distribution.zoneFrequency[zone])}</span>
                  </div>
                </td>
                <td>{formatPercentage(distribution.zonePercentage[zone])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="shot-insights">
        <h3>Key Insights</h3>
        <ul>
          <li>
            Most shots came from the {sortedZones[0]} ({formatPercentage(distribution.zoneFrequency[sortedZones[0]])}).
          </li>
          <li>
            Highest shooting percentage was in the {
              Object.keys(distribution.zonePercentage).reduce(
                (a, b) => distribution.zonePercentage[a] > distribution.zonePercentage[b] ? a : b
              )
            } at {
              formatPercentage(
                distribution.zonePercentage[
                  Object.keys(distribution.zonePercentage).reduce(
                    (a, b) => distribution.zonePercentage[a] > distribution.zonePercentage[b] ? a : b
                  )
                ]
              )
            }.
          </li>
          <li>
            {
              distribution.zoneFrequency['Mid-Range'] < 20 
                ? 'Mid-range shots have decreased significantly as teams prioritize 3-pointers and shots at the rim.'
                : 'Mid-range shots still make up a significant portion of shot attempts.'
            }
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ShotStats;