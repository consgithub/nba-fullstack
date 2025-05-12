import React from 'react';
import '../../styles/YearSelector.css';

interface YearSelectorProps {
  years: number[];
  selectedYear: number;
  onChange: (year: number) => void;
}

const YearSelector: React.FC<YearSelectorProps> = ({ years, selectedYear, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(parseInt(e.target.value, 10));
  };
  
  return (
    <div className="year-selector">
      <label htmlFor="year-select">Select Year:</label>
      <select 
        id="year-select"
        value={selectedYear}
        onChange={handleChange}
        className="year-select"
      >
        {years.map(year => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};

export default YearSelector;