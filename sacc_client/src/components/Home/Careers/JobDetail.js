import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../Services/api';
import './CareerPage.css';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data.data.job);
      setError('');
    } catch (err) {
      setError('Failed to fetch job details. Please try again.');
      console.error('Error fetching job:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!user) {
      navigate('/login', { state: { from: `/careers/${id}` } });
      return;
    }
    navigate(`/careers/${id}/apply`);
  };

  if (loading) {
    return <div className="careerpage_loading">Loading job details...</div>;
  }

  if (error || !job) {
    return (
      <div className="careerpage_container">
        <div className="careerpage_error">{error || 'Job not found'}</div>
        <Link to="/careers" className="careerpage_back-btn">
          Back to Jobs
        </Link>
      </div>
    );
  }

  const formatSalary = (salary) => {
    return `₹${salary.min.toLocaleString()} - ₹${salary.max.toLocaleString()}`;
  };

  return (
    <div className="careerpage_container">
      <div className="careerpage_job-detail">
        <div className="careerpage_job-detail-header">
          <Link to="/careers" className="careerpage_back-btn">
            ← Back to Jobs
          </Link>
          
          <h1 className="careerpage_job-detail-title">{job.jobName}</h1>
          <h2 className="careerpage_job-detail-company">{job.company}</h2>
          
          <div className="careerpage_job-detail-meta">
            <span className="careerpage_job-meta-item">
              📍 {job.locations.join(', ')}
            </span>
            <span className="careerpage_job-meta-item">
              💰 {formatSalary(job.salaryRange)}
            </span>
            <span className="careerpage_job-meta-item">
              ⏱️ {job.employmentType}
            </span>
            <span className="careerpage_job-meta-item">
              📅 Posted: {new Date(job.postedDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="careerpage_job-detail-content">
          <div className="careerpage_job-section">
            <h3>Job Description</h3>
            <p>{job.description}</p>
          </div>

          {job.requirements && job.requirements.length > 0 && (
            <div className="careerpage_job-section">
              <h3>Requirements</h3>
              <ul>
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {job.benefits && job.benefits.length > 0 && (
            <div className="careerpage_job-section">
              <h3>Benefits</h3>
              <ul>
                {job.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="careerpage_job-detail-actions">
          <button onClick={handleApply} className="careerpage_apply-btn">
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;