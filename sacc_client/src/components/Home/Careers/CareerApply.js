import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './CareerPage.css';

const CareerApply = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    resume: null,
    coverLetter: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/careers/${id}/apply` } });
      return;
    }
    
    fetchJob();
    setFormData(prev => ({
      ...prev,
      name: user.name,
      email: user.email
    }));
  }, [id, user, navigate]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, resume: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('coverLetter', formData.coverLetter);
      if (formData.resume) {
        formDataToSend.append('resume', formData.resume);
      }

      // This would be your actual API endpoint for applications
      await api.post(`/jobs/${id}/apply`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/careers', { 
        state: { message: 'Application submitted successfully!' } 
      });
    } catch (err) {
      setError('Failed to submit application. Please try again.');
      console.error('Error submitting application:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="careerpage_loading">Loading...</div>;
  }

  if (!job) {
    return (
      <div className="careerpage_container">
        <div className="careerpage_error">Job not found</div>
        <button onClick={() => navigate('/careers')} className="careerpage_back-btn">
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="careerpage_container">
      <div className="careerpage_apply">
        <h1 className="careerpage_apply-title">Apply for {job.jobName}</h1>
        <p className="careerpage_apply-company">at {job.company}</p>

        <form onSubmit={handleSubmit} className="careerpage_apply-form">
          {error && <div className="careerpage_error">{error}</div>}

          <div className="careerpage_form-group">
            <label htmlFor="name" className="careerpage_form-label">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="careerpage_form-input"
            />
          </div>

          <div className="careerpage_form-group">
            <label htmlFor="email" className="careerpage_form-label">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="careerpage_form-input"
            />
          </div>

          <div className="careerpage_form-group">
            <label htmlFor="phone" className="careerpage_form-label">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="careerpage_form-input"
            />
          </div>

          <div className="careerpage_form-group">
            <label htmlFor="resume" className="careerpage_form-label">
              Resume (PDF, DOC, DOCX) *
            </label>
            <input
              type="file"
              id="resume"
              name="resume"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
              required
              className="careerpage_form-file"
            />
          </div>

          <div className="careerpage_form-group">
            <label htmlFor="coverLetter" className="careerpage_form-label">
              Cover Letter
            </label>
            <textarea
              id="coverLetter"
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleInputChange}
              rows="6"
              className="careerpage_form-textarea"
              placeholder="Why are you interested in this position?"
            />
          </div>

          <div className="careerpage_form-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="careerpage_cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="careerpage_submit-btn"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CareerApply;