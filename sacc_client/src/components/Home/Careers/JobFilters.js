import React from 'react';
import './CareerPage.css';

const ANDHRA_PRADESH_LOCATIONS = [
  'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 
  'Rajahmundry', 'Tirupati', 'Kakinada', 'Kadapa', 'Anantapur',
  'Eluru', 'Ongole', 'Chittoor', 'Hindupur', 'Machilipatnam'
];

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];

const JobFilters = ({ filters, onFilterChange }) => {
  const handleLocationChange = (e) => {
    onFilterChange('location', e.target.value);
  };

  const handleEmploymentTypeChange = (e) => {
    onFilterChange('employmentType', e.target.value);
  };

  const clearFilters = () => {
    onFilterChange('location', '');
    onFilterChange('employmentType', '');
  };

  return (
    <div className="careerpage_filters">
      <h3 className="careerpage_filters-title">Filters</h3>
      
      <div className="careerpage_filter-group">
        <label htmlFor="location" className="careerpage_filter-label">
          Location
        </label>
        <select
          id="location"
          value={filters.location}
          onChange={handleLocationChange}
          className="careerpage_filter-select"
        >
          <option value="">All Locations</option>
          {ANDHRA_PRADESH_LOCATIONS.map(location => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>
      
      <div className="careerpage_filter-group">
        <label htmlFor="employmentType" className="careerpage_filter-label">
          Employment Type
        </label>
        <select
          id="employmentType"
          value={filters.employmentType}
          onChange={handleEmploymentTypeChange}
          className="careerpage_filter-select"
        >
          <option value="">All Types</option>
          {EMPLOYMENT_TYPES.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      
      <button onClick={clearFilters} className="careerpage_clear-filters-btn">
        Clear Filters
      </button>
    </div>
  );
};

export default JobFilters;