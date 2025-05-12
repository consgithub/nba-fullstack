import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ShotTrend } from '../../features/shots/shotSlice';
import '../../styles/TrendChart.css';

interface TrendChartProps {
  data: ShotTrend[];
  colors: { [key: string]: string };
  dataKey: 'frequency' | 'percentage';
  yAxisLabel: string;
  yAxisDomain?: [number, number];
}

const TrendChart: React.FC<TrendChartProps> = ({ 
  data, 
  colors, 
  dataKey, 
  yAxisLabel,
  yAxisDomain 
}) => {
  // Format the data for Recharts
  // We need to transform from array of zones to array of years
  const formatData = () => {
    // Find all unique years
    const allYears = new Set<number>();
    data.forEach(trend => {
      trend.trend.forEach(point => {
        allYears.add(point.year);
      });
    });
    
    const sortedYears = Array.from(allYears).sort((a, b) => a - b);
    
    // Create data points for each year
    return sortedYears.map(year => {
      const dataPoint: Record<string, any> = { year };
      
      // Add value for each zone
      data.forEach(trend => {
        const yearData = trend.trend.find(point => point.year === year);
        if (yearData) {
          dataPoint[trend.zone] = yearData[dataKey];
        }
      });
      
      return dataPoint;
    });
  };
  
  const chartData = formatData();
  
  // Custom tooltip to show percentages with one decimal
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="trend-tooltip">
          <p className="trend-tooltip-label">{`Year: ${label}`}</p>
          <div className="trend-tooltip-content">
            {payload.map((entry: any) => (
              <div key={entry.name} className="trend-tooltip-item">
                <span 
                  className="trend-tooltip-color" 
                  style={{ backgroundColor: entry.color }}
                ></span>
                <span className="trend-tooltip-name">{entry.name}:</span>
                <span className="trend-tooltip-value">
                  {entry.value.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="trend-chart">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="year" 
            label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }}
          />
          <YAxis 
            domain={yAxisDomain}
            label={{ 
              value: yAxisLabel, 
              angle: -90, 
              position: 'insideLeft',
              offset: -5
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {data.map(zone => (
            <Line
              key={zone.zone}
              type="monotone"
              dataKey={zone.zone}
              name={zone.zone}
              stroke={colors[zone.zone]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;