import React from 'react';
import { Link } from 'react-router-dom';
import './CareerPage.css';

const JobCard = ({ job }) => {
  const formatSalary = (salary) => {
    return `₹${salary.min.toLocaleString()} - ₹${salary.max.toLocaleString()}`;
  };

  return (
    <div className="careerpage_job-card">
      <div className="careerpage_job-card-header">
        <h3 className="careerpage_job-title">{job.jobName}</h3>
        <span className="careerpage_company-name">{job.company}</span>
      </div>
      
      <div className="careerpage_job-details">
        <div className="careerpage_job-detail">
          <span className="careerpage_detail-label">Location:</span>
          <span className="careerpage_detail-value">{job.locations.join(', ')}</span>
        </div>
        
        <div className="careerpage_job-detail">
          <span className="careerpage_detail-label">Salary:</span>
          <span className="careerpage_detail-value">{formatSalary(job.salaryRange)}</span>
        </div>
        
        <div className="careerpage_job-detail">
          <span className="careerpage_detail-label">Type:</span>
          <span className="careerpage_detail-value">{job.employmentType}</span>
        </div>
      </div>
      
      <div className="careerpage_job-card-footer">
        <Link to={`/careers/${job._id}`} className="careerpage_view-job-btn">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default JobCard;