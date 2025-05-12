import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectShotTrends } from '../../features/shots/shotSlice';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Label
} from 'recharts';
import '../../styles/MathematicalAnalysis.css';

// Define a type for the regression data points
interface RegressionDataPoint {
  year: number;
  'Mid-Range (Actual)': number | null;  // Changed from "number | undefined"
  'Mid-Range (Trend)': number;
  '3PT (Actual)': number | null;  // Changed from "number | undefined"
  '3PT (Trend)': number;
}

const MathematicalAnalysis: React.FC = () => {
  const trends = useSelector(selectShotTrends);
  
  // This computes complex trend analysis metrics
  const analysisResults = useMemo(() => {
    if (!trends || trends.length === 0) return null;
    
    // Calculate exponentially weighted moving averages for each zone
    const calculateEWMA = (data: number[], alpha: number = 0.3): number[] => {
      let ewma: number[] = [];
      let currentEWMA = data[0];
      
      for (let i = 0; i < data.length; i++) {
        currentEWMA = alpha * data[i] + (1 - alpha) * (i > 0 ? ewma[i-1] : data[i]);
        ewma.push(currentEWMA);
      }
      
      return ewma;
    };
    
    // Linear regression to find trend slope
    const linearRegression = (years: number[], values: number[]): { slope: number; intercept: number; r2: number } => {
      const n = years.length;
      let sumX = 0;
      let sumY = 0;
      let sumXY = 0;
      let sumXX = 0;
      let sumYY = 0;
      
      for (let i = 0; i < n; i++) {
        sumX += years[i];
        sumY += values[i];
        sumXY += years[i] * values[i];
        sumXX += years[i] * years[i];
        sumYY += values[i] * values[i];
      }
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      // Calculate r-squared (coefficient of determination)
      const yMean = sumY / n;
      let totalVariation = 0;
      let explainedVariation = 0;
      
      for (let i = 0; i < n; i++) {
        totalVariation += Math.pow(values[i] - yMean, 2);
        explainedVariation += Math.pow((slope * years[i] + intercept) - yMean, 2);
      }
      
      const r2 = explainedVariation / totalVariation;
      
      return { slope, intercept, r2 };
    };
    
    // Rate of change calculation
    const calculateRateOfChange = (values: number[]): number[] => {
      return values.slice(1).map((val, i) => ((val - values[i]) / values[i]) * 100);
    };
    
    // Extract zone data
    const midRangeTrend = trends.find(trend => trend.zone === 'Mid-Range');
    const cornerThreeTrend = trends.find(trend => trend.zone === 'Corner 3');
    const aboveBreakThreeTrend = trends.find(trend => trend.zone === 'Above Break 3');
    const restrictedAreaTrend = trends.find(trend => trend.zone === 'Restricted Area');
    
    if (!midRangeTrend || !cornerThreeTrend || !aboveBreakThreeTrend || !restrictedAreaTrend) {
      return null;
    }
    
    // Process data for each zone
    const processZoneData = (zoneTrend: typeof midRangeTrend) => {
      const years = zoneTrend.trend.map(t => t.year);
      const frequencies = zoneTrend.trend.map(t => t.frequency);
      const percentages = zoneTrend.trend.map(t => t.percentage);
      
      // Get frequency metrics
      const freqRegression = linearRegression(years, frequencies);
      const freqROC = calculateRateOfChange(frequencies);
      const freqEWMA = calculateEWMA(frequencies);
      
      // Get percentage metrics
      const pctRegression = linearRegression(years, percentages);
      const pctROC = calculateRateOfChange(percentages);
      const pctEWMA = calculateEWMA(percentages);
      
      // Calculate 2-year forecast
      const freqForecast = years.slice(-1)[0] + 1;
      const freqPrediction = freqRegression.slope * freqForecast + freqRegression.intercept;
      
      // Calculate compound annual growth rate (CAGR)
      const startYear = years[0];
      const endYear = years[years.length - 1];
      const startFreq = frequencies[0];
      const endFreq = frequencies[frequencies.length - 1];
      const cagr = Math.pow(endFreq / startFreq, 1 / (endYear - startYear)) - 1;
      
      return {
        years,
        frequencies,
        percentages,
        freqRegression,
        pctRegression,
        freqROC,
        pctROC,
        freqEWMA,
        pctEWMA,
        freqPrediction,
        cagr
      };
    };
    
    // Analyze each zone
    const midRangeAnalysis = processZoneData(midRangeTrend);
    const cornerThreeAnalysis = processZoneData(cornerThreeTrend);
    const aboveBreakThreeAnalysis = processZoneData(aboveBreakThreeTrend);
    const restrictedAreaAnalysis = processZoneData(restrictedAreaTrend);
    
    // Calculate correlation matrix between zones
    const calculateCorrelation = (x: number[], y: number[]): number => {
      const n = x.length;
      let sumX = 0;
      let sumY = 0;
      let sumXY = 0;
      let sumXX = 0;
      let sumYY = 0;
      
      for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumXX += x[i] * x[i];
        sumYY += y[i] * y[i];
      }
      
      return (n * sumXY - sumX * sumY) / Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    };
    
    // Calculate displacement matrix (how much mid-range is replaced by 3pt)
    const midRangeToThreeCorrelation = calculateCorrelation(
      midRangeAnalysis.frequencies, 
      aboveBreakThreeAnalysis.frequencies.map((v, i) => v + cornerThreeAnalysis.frequencies[i])
    );
    
    // Calculate efficiency differential
    const midRangeEfficiency = midRangeAnalysis.percentages[midRangeAnalysis.percentages.length - 1] * 2; // Points per 100 shots
    const aboveBreakThreeEfficiency = aboveBreakThreeAnalysis.percentages[aboveBreakThreeAnalysis.percentages.length - 1] * 3;
    const cornerThreeEfficiency = cornerThreeAnalysis.percentages[cornerThreeAnalysis.percentages.length - 1] * 3;
    const weightedThreeEfficiency = 
      (aboveBreakThreeAnalysis.frequencies[aboveBreakThreeAnalysis.frequencies.length - 1] * aboveBreakThreeEfficiency +
      cornerThreeAnalysis.frequencies[cornerThreeAnalysis.frequencies.length - 1] * cornerThreeEfficiency) / 
      (aboveBreakThreeAnalysis.frequencies[aboveBreakThreeAnalysis.frequencies.length - 1] +
      cornerThreeAnalysis.frequencies[cornerThreeAnalysis.frequencies.length - 1]);
    
    const efficiencyDifferential = (weightedThreeEfficiency - midRangeEfficiency).toFixed(1);
    
    // Create time series for regression visualization
    const regressionData: RegressionDataPoint[] = midRangeAnalysis.years.map((year, i) => ({
      year,
      'Mid-Range (Actual)': midRangeAnalysis.frequencies[i],
      'Mid-Range (Trend)': midRangeAnalysis.freqRegression.slope * year + midRangeAnalysis.freqRegression.intercept,
      '3PT (Actual)': aboveBreakThreeAnalysis.frequencies[i] + cornerThreeAnalysis.frequencies[i],
      '3PT (Trend)': 
        (aboveBreakThreeAnalysis.freqRegression.slope * year + aboveBreakThreeAnalysis.freqRegression.intercept) +
        (cornerThreeAnalysis.freqRegression.slope * year + cornerThreeAnalysis.freqRegression.intercept)
    }));

    // Add forecast years
    const lastYear = midRangeAnalysis.years[midRangeAnalysis.years.length - 1];
    for (let year = lastYear + 1; year <= lastYear + 2; year++) {
      regressionData.push({
        year,
        'Mid-Range (Actual)': null,  // Use null, not undefined
        'Mid-Range (Trend)': midRangeAnalysis.freqRegression.slope * year + midRangeAnalysis.freqRegression.intercept,
        '3PT (Actual)': null,  // Use null, not undefined
        '3PT (Trend)': 
          (aboveBreakThreeAnalysis.freqRegression.slope * year + aboveBreakThreeAnalysis.freqRegression.intercept) +
          (cornerThreeAnalysis.freqRegression.slope * year + cornerThreeAnalysis.freqRegression.intercept)
      });
    }
    
    return {
      midRange: midRangeAnalysis,
      cornerThree: cornerThreeAnalysis,
      aboveBreakThree: aboveBreakThreeAnalysis,
      restrictedArea: restrictedAreaAnalysis,
      correlations: {
        midRangeToThree: midRangeToThreeCorrelation,
      },
      efficiency: {
        midRange: midRangeEfficiency,
        aboveBreakThree: aboveBreakThreeEfficiency,
        cornerThree: cornerThreeEfficiency,
        weightedThree: weightedThreeEfficiency,
        differential: efficiencyDifferential
      },
      regressionData
    };
  }, [trends]);
  
  if (!analysisResults) {
    return (
      <div className="math-analysis-container">
        <h2>Advanced Mathematical Analysis</h2>
        <p>No data available for analysis. Please ensure shot trend data is loaded.</p>
      </div>
    );
  }
  
  // Format as percentage with proper sign
  const formatPercentChange = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };
  
  // Format as percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  
  return (
    <div className="math-analysis-container">
      <h2>Advanced Mathematical Analysis</h2>
      <p className="analysis-intro">
        Using statistical methods to quantify the evolution of NBA shooting patterns over time.
      </p>
      
      <div className="analysis-section">
        <h3>Regression Analysis of Shot Distribution Trends</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={analysisResults.regressionData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="year" 
                label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }}
                domain={[
                  analysisResults.midRange.years[0],
                  analysisResults.midRange.years[analysisResults.midRange.years.length - 1] + 2
                ]}
              />
              <YAxis 
                label={{ value: 'Frequency (%)', angle: -90, position: 'insideLeft', offset: -5 }}
                domain={[0, 60]}
              />
              <Tooltip formatter={(value: any) => `${value.toFixed(2)}%`} />
              <Legend verticalAlign="top" />
              
              <Line 
                type="monotone" 
                dataKey="Mid-Range (Actual)" 
                stroke="#36A2EB" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="Mid-Range (Trend)" 
                stroke="#36A2EB" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="3PT (Actual)" 
                stroke="#9966FF" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="3PT (Trend)" 
                stroke="#9966FF" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              
              <ReferenceLine 
                x={analysisResults.midRange.years[analysisResults.midRange.years.length - 1]} 
                stroke="#666" 
                strokeDasharray="3 3"
              >
                <Label value="Forecast" position="top" />
              </ReferenceLine>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Mid-Range Shots</h3>
          <div className="metric-value negative">{formatPercentChange(analysisResults.midRange.freqRegression.slope * 100)}</div>
          <div className="metric-label">Annual Change</div>
          <div className="metric-detail">
            <strong>R²:</strong> {analysisResults.midRange.freqRegression.r2.toFixed(3)}
          </div>
          <div className="metric-detail">
            <strong>CAGR:</strong> {(analysisResults.midRange.cagr * 100).toFixed(2)}%
          </div>
          <div className="metric-detail">
            <strong>2026 Forecast:</strong> {formatPercentage(analysisResults.midRange.freqPrediction)}
          </div>
        </div>
        
        <div className="metric-card">
          <h3>Corner 3PT Shots</h3>
          <div className="metric-value positive">{formatPercentChange(analysisResults.cornerThree.freqRegression.slope * 100)}</div>
          <div className="metric-label">Annual Change</div>
          <div className="metric-detail">
            <strong>R²:</strong> {analysisResults.cornerThree.freqRegression.r2.toFixed(3)}
          </div>
          <div className="metric-detail">
            <strong>CAGR:</strong> {(analysisResults.cornerThree.cagr * 100).toFixed(2)}%
          </div>
          <div className="metric-detail">
            <strong>2026 Forecast:</strong> {formatPercentage(analysisResults.cornerThree.freqPrediction)}
          </div>
        </div>
        
        <div className="metric-card">
          <h3>Above-Break 3PT Shots</h3>
          <div className="metric-value positive">{formatPercentChange(analysisResults.aboveBreakThree.freqRegression.slope * 100)}</div>
          <div className="metric-label">Annual Change</div>
          <div className="metric-detail">
            <strong>R²:</strong> {analysisResults.aboveBreakThree.freqRegression.r2.toFixed(3)}
          </div>
          <div className="metric-detail">
            <strong>CAGR:</strong> {(analysisResults.aboveBreakThree.cagr * 100).toFixed(2)}%
          </div>
          <div className="metric-detail">
            <strong>2026 Forecast:</strong> {formatPercentage(analysisResults.aboveBreakThree.freqPrediction)}
          </div>
        </div>
        
        <div className="metric-card">
          <h3>Shots at the Rim</h3>
          <div className="metric-value positive">{formatPercentChange(analysisResults.restrictedArea.freqRegression.slope * 100)}</div>
          <div className="metric-label">Annual Change</div>
          <div className="metric-detail">
            <strong>R²:</strong> {analysisResults.restrictedArea.freqRegression.r2.toFixed(3)}
          </div>
          <div className="metric-detail">
            <strong>CAGR:</strong> {(analysisResults.restrictedArea.cagr * 100).toFixed(2)}%
          </div>
          <div className="metric-detail">
            <strong>2026 Forecast:</strong> {formatPercentage(analysisResults.restrictedArea.freqPrediction)}
          </div>
        </div>
      </div>
      
      <div className="analysis-section">
        <h3>Efficiency Analysis</h3>
        <div className="efficiency-comparison">
          <div className="efficiency-card">
            <h4>Mid-Range Shots</h4>
            <div className="efficiency-value">{analysisResults.efficiency.midRange.toFixed(1)}</div>
            <div className="efficiency-label">Points per 100 shots</div>
          </div>
          
          <div className="efficiency-card">
            <h4>3-Point Shots (Weighted)</h4>
            <div className="efficiency-value">{analysisResults.efficiency.weightedThree.toFixed(1)}</div>
            <div className="efficiency-label">Points per 100 shots</div>
          </div>
          
          <div className="efficiency-card highlight">
            <h4>Efficiency Differential</h4>
            <div className="efficiency-value positive">+{analysisResults.efficiency.differential}</div>
            <div className="efficiency-label">Additional points per 100 shots</div>
          </div>
        </div>
        
        <div className="correlation-section">
          <h3>Statistical Correlations</h3>
          <p>
            <strong>Mid-Range to 3PT Correlation:</strong> {analysisResults.correlations.midRangeToThree.toFixed(3)} 
            <span className="correlation-explanation">
              {analysisResults.correlations.midRangeToThree < -0.7 
                ? " (Strong negative correlation indicating direct replacement)" 
                : analysisResults.correlations.midRangeToThree < -0.3 
                  ? " (Moderate negative correlation suggesting partial replacement)"
                  : " (Weak correlation suggesting independent trends)"}
            </span>
          </p>
          
          <div className="insight-box">
            <h4>Key Mathematical Insights</h4>
            <ul>
              <li>
                The linear regression model shows a {Math.abs(analysisResults.midRange.freqRegression.slope * 100).toFixed(2)}% annual 
                decrease in mid-range attempts, with a very high R² value of {analysisResults.midRange.freqRegression.r2.toFixed(3)} 
                indicating a consistent trend.
              </li>
              <li>
                The correlation coefficient between mid-range and three-point frequencies ({analysisResults.correlations.midRangeToThree.toFixed(3)}) 
                demonstrates a {Math.abs(analysisResults.correlations.midRangeToThree) > 0.7 ? "strong" : "moderate"} negative relationship,
                confirming the direct substitution effect.
              </li>
              <li>
                The weighted efficiency differential of {analysisResults.efficiency.differential} points per 100 shots translates 
                to approximately {(parseFloat(analysisResults.efficiency.differential) * 0.1).toFixed(1)} points per game in offensive efficiency.
              </li>
              <li>
                Forecasting models predict mid-range frequency will drop to {analysisResults.midRange.freqPrediction.toFixed(1)}% by 2026,
                while combined three-point attempts will rise to 
                {(analysisResults.cornerThree.freqPrediction + analysisResults.aboveBreakThree.freqPrediction).toFixed(1)}%.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathematicalAnalysis;