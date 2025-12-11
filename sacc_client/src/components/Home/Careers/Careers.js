import React, { useState, useEffect, useCallback } from 'react';
// import { Link } from 'react-router-dom';
import api from '../../../Services/api';
import JobCard from './JobCard';
import SearchBar from './CareerSearchBar';
import JobFilters from './JobFilters';
import './CareerPage.css';

const Careers = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    employmentType: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalRecords: 0
  });

   // ✅ Wrap fetchJobs with useCallback
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.current,
        limit: 10,
        ...(filters.location && { location: filters.location }),
        ...(filters.employmentType && { employmentType: filters.employmentType })
      };

      const response = searchTerm
        ? await api.get('/jobs/search', { params: { ...params, q: searchTerm } })
        : await api.get('/jobs', { params });

      setJobs(response.data.data.jobs);
      setPagination(response.data.data.pagination);
      setError('');
    } catch (err) {
      setError('Failed to fetch jobs. Please try again.');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.current, searchTerm]); // 👈 Dependencies

  // ✅ Now we can safely depend on fetchJobs
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  if (loading && jobs.length === 0) {
    return <div className="careerpage_loading">Loading jobs...</div>;
  }

  return (
    <div className="careerpage_container">
      <div className="careerpage_hero">
        <h1 className="careerpage_hero-title">Find Your Dream Job in Andhra Pradesh</h1>
        <p className="careerpage_hero-subtitle">
          Discover opportunities across various industries in beautiful Andhra Pradesh
        </p>
      </div>

      <div className="careerpage_content">
        <aside className="careerpage_sidebar">
          <JobFilters filters={filters} onFilterChange={handleFilterChange} />
        </aside>

        <main className="careerpage_main">
          <div className="careerpage_search-section">
            <SearchBar onSearch={handleSearch} placeholder="Search by job title, company, or keywords..." />
          </div>

          {error && <div className="careerpage_error">{error}</div>}

          <div className="careerpage_jobs-grid">
            {jobs.length > 0 ? (
              jobs.map(job => <JobCard key={job._id} job={job} />)
            ) : (
              <div className="careerpage_no-jobs">
                <p>No jobs found matching your criteria.</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({ location: '', employmentType: '' });
                  }}
                  className="careerpage_clear-search-btn"
                >
                  Clear Search & Filters
                </button>
              </div>
            )}
          </div>

          {pagination.total > 1 && (
            <div className="careerpage_pagination">
              {Array.from({ length: pagination.total }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`careerpage_page-btn ${pagination.current === page ? 'careerpage_page-active' : ''}`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Careers;