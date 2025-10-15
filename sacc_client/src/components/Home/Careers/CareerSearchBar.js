import React, { useState } from 'react';
import './CareerPage.css';

const CareerSearchBar = ({ onSearch, placeholder = "Search jobs..." }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} className="careerpage_search-bar">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="careerpage_search-input"
      />
      <button type="submit" className="careerpage_search-btn">
        Search
      </button>
    </form>
  );
};

export default CareerSearchBar;