import React, { useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import './CareersApp.css'

const CareersApplicationForm = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    fathername: '',
    mothername: '',
    dob: '',
    email: '',
    altemail: '',
    mobile: '',
    nationality: '',
    religion: '',
    caste: '',
    gender: 'Male',
    aadhar: '',
    pan: '',
    dl: '',
    paddress: '',
    peraddress: '',
    education: [],
    experience: [],
    hasExperience: 'no',
    utr: '',
    photo: null,
    signature: null,
    resume: null,
    payslip: null
  });

  const [message, setMessage] = useState('');
  const [appNumber, setAppNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({
      ...formData,
      [name]: files[0]
    });
  };

  const addEducation = () => {
    const qualification = prompt("Qualification:");
    const institution = prompt("School/College:");
    const board = prompt("Board/University:");
    const year = prompt("Year of Passing/Pursuing:");
    const points = prompt("Points (if pursuing enter assumed):");
    
    if (qualification && institution && board && year && points) {
      const newEducation = {
        qualification,
        institution,
        board,
        year,
        points
      };
      
      setFormData({
        ...formData,
        education: [...formData.education, newEducation]
      });
    }
  };

  const removeEducation = (index) => {
    const updatedEducation = [...formData.education];
    updatedEducation.splice(index, 1);
    setFormData({
      ...formData,
      education: updatedEducation
    });
  };

  const addExperience = () => {
    const company = prompt("Company:");
    const role = prompt("Role:");
    const years = prompt("Years:");
    
    if (company && role && years) {
      const newExperience = {
        company,
        role,
        years
      };
      
      setFormData({
        ...formData,
        experience: [...formData.experience, newExperience]
      });
    }
  };

  const removeExperience = (index) => {
    const updatedExperience = [...formData.experience];
    updatedExperience.splice(index, 1);
    setFormData({
      ...formData,
      experience: updatedExperience
    });
  };

  const generatePDF = (appNumber) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("SACC FINANCE BANKING LIMITED", 60, 20);
    doc.setFontSize(14);
    doc.text("Application Form", 90, 30);
    doc.text("Application No: " + appNumber, 20, 40);
    doc.text("Name: " + formData.fullname, 20, 50);
    doc.text("Father: " + formData.fathername, 20, 60);
    doc.text("Mother: " + formData.mothername, 20, 70);
    doc.text("DOB: " + formData.dob, 20, 80);
    doc.text("Email: " + formData.email, 20, 90);
    doc.text("Mobile: " + formData.mobile, 20, 100);
    doc.text("Nationality: " + formData.nationality, 20, 110);
    doc.text("Religion: " + formData.religion, 20, 120);
    doc.text("Caste: " + formData.caste, 20, 130);
    doc.text("Gender: " + formData.gender, 20, 140);
    doc.text("Aadhar: " + formData.aadhar, 20, 150);
    doc.text("PAN: " + formData.pan, 20, 160);
    doc.text("UTR: " + formData.utr, 20, 170);

    doc.text("Education:", 20, 185);
    formData.education.forEach((edu, i) => {
      doc.text(`- ${edu.qualification} | ${edu.institution} | ${edu.board} | ${edu.year} | ${edu.points}`, 
                25, 195 + (i * 10));
    });

    if (formData.hasExperience === 'yes') {
      const eduHeight = 195 + (formData.education.length * 10);
      doc.text("Experience:", 20, eduHeight + 10);
      formData.experience.forEach((exp, j) => {
        doc.text(`- ${exp.company} | ${exp.role} | ${exp.years}`, 
                  25, eduHeight + 20 + (j * 10));
      });
    }

    doc.setFontSize(10);
    doc.text("© L&NS ARYAVARTH SINDU SAMRAJ PRIVATE LIMITED 2024", 60, 290);
    doc.save("Application_" + appNumber + ".pdf");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'education' && key !== 'experience' && key !== 'hasExperience' && 
            key !== 'photo' && key !== 'signature' && key !== 'resume' && key !== 'payslip') {
          data.append(key, formData[key]);
        }
      });
      
      // Append arrays as JSON strings
      data.append('education', JSON.stringify(formData.education));
      if (formData.experience.length > 0) {
        data.append('experience', JSON.stringify(formData.experience));
      }
      
      // Append files
      if (formData.photo) data.append('photo', formData.photo);
      if (formData.signature) data.append('signature', formData.signature);
      if (formData.resume) data.append('resume', formData.resume);
      if (formData.payslip) data.append('payslip', formData.payslip);
      
      const response = await axios.post('http://localhost:5000/api/applications', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setAppNumber(response.data.appNumber);
      setMessage('Application submitted successfully!');
      generatePDF(response.data.appNumber);
      
      // Reset form
      setFormData({
        fullname: '',
        fathername: '',
        mothername: '',
        dob: '',
        email: '',
        altemail: '',
        mobile: '',
        nationality: '',
        religion: '',
        caste: '',
        gender: 'Male',
        aadhar: '',
        pan: '',
        dl: '',
        paddress: '',
        peraddress: '',
        education: [],
        experience: [],
        hasExperience: 'no',
        utr: '',
        photo: null,
        signature: null,
        resume: null,
        payslip: null
      });
      
    } catch (error) {
      setMessage('Error submitting application: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="careers-app-container">
    <div className="careers-header">
      <div className="careers-logo-container">
        <div className="careers-logo">SACC</div>
        <div className="careers-logo-text">
          <h1>SACC FINANCE BANKING LIMITED</h1>
          <p>Building Financial Futures Together</p>
        </div>
      </div>
    </div>

    <div className="careers-progress-container">
      <div className="careers-progress-bar">
        <div className="careers-progress-step completed">
          <span className="careers-step-number">1</span>
          <span className="careers-step-label">Personal Info</span>
        </div>
        <div className="careers-progress-step active">
          <span className="careers-step-number">2</span>
          <span className="careers-step-label">Education</span>
        </div>
        <div className="careers-progress-step">
          <span className="careers-step-number">3</span>
          <span className="careers-step-label">Experience</span>
        </div>
        <div className="careers-progress-step">
          <span className="careers-step-number">4</span>
          <span className="careers-step-label">Documents</span>
        </div>
      </div>
    </div>

    <div className="careers-form-wrapper">
      <h2 className="careers-form-title">Career Application Form</h2>
      <p className="careers-form-subtitle">Join our team of financial experts</p>

      {message && (
        <div className={`careers-alert ${message.includes('Error') ? 'careers-alert-error' : 'careers-alert-success'}`}>
          <div className="careers-alert-icon">
            {message.includes('Error') ? '⚠️' : '✓'}
          </div>
          <div className="careers-alert-content">
            {message}
            {appNumber && <p className="careers-app-number">Your Application No: <strong>{appNumber}</strong></p>}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data" className="careers-application-form">
        {/* Personal Information Section */}
        <div className="careers-form-section">
          <div className="careers-section-header">
            <div className="careers-section-number">01</div>
            <div className="careers-section-title">
              <h3>Personal Information</h3>
              <p>Tell us about yourself</p>
            </div>
          </div>

          <div className="careers-form-grid">
            <div className="careers-form-group">
              <label className="careers-form-label">Full Name <span className="careers-required">*</span></label>
              <input 
                type="text" 
                name="fullname" 
                value={formData.fullname}
                onChange={handleInputChange}
                className="careers-form-input"
                required 
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="careers-form-group">
              <label className="careers-form-label">Father's Name <span className="careers-required">*</span></label>
              <input 
                type="text" 
                name="fathername" 
                value={formData.fathername}
                onChange={handleInputChange}
                className="careers-form-input"
                required 
                placeholder="Enter father's name"
              />
            </div>
            
            <div className="careers-form-group">
              <label className="careers-form-label">Mother's Name <span className="careers-required">*</span></label>
              <input 
                type="text" 
                name="mothername" 
                value={formData.mothername}
                onChange={handleInputChange}
                className="careers-form-input"
                required 
                placeholder="Enter mother's name"
              />
            </div>
            
            <div className="careers-form-group">
              <label className="careers-form-label">Date of Birth <span className="careers-required">*</span></label>
              <input 
                type="date" 
                name="dob" 
                value={formData.dob}
                onChange={handleInputChange}
                className="careers-form-input"
                required 
              />
            </div>
            
            <div className="careers-form-group">
              <label className="careers-form-label">Email ID <span className="careers-required">*</span></label>
              <input 
                type="email" 
                name="email" 
                value={formData.email}
                onChange={handleInputChange}
                className="careers-form-input"
                required 
                placeholder="your.email@example.com"
              />
            </div>
            
            <div className="careers-form-group">
              <label className="careers-form-label">Alternate Email</label>
              <input 
                type="email" 
                name="altemail" 
                value={formData.altemail}
                onChange={handleInputChange}
                className="careers-form-input"
                placeholder="alternate.email@example.com"
              />
            </div>
            
            <div className="careers-form-group">
              <label className="careers-form-label">Mobile Number <span className="careers-required">*</span></label>
              <input 
                type="tel" 
                name="mobile" 
                pattern="[0-9]{10}" 
                value={formData.mobile}
                onChange={handleInputChange}
                className="careers-form-input"
                required 
                placeholder="10-digit mobile number"
              />
            </div>
            
            <div className="careers-form-group">
              <label className="careers-form-label">Nationality <span className="careers-required">*</span></label>
              <input 
                type="text" 
                name="nationality" 
                value={formData.nationality}
                onChange={handleInputChange}
                className="careers-form-input"
                required 
                placeholder="Your nationality"
              />
            </div>
            
            <div className="careers-form-group">
              <label className="careers-form-label">Religion</label>
              <input 
                type="text" 
                name="religion" 
                value={formData.religion}
                onChange={handleInputChange}
                className="careers-form-input"
                placeholder="Your religion"
              />
            </div>
            
            <div className="careers-form-group">
              <label className="careers-form-label">Caste</label>
              <input 
                type="text" 
                name="caste" 
                value={formData.caste}
                onChange={handleInputChange}
                className="careers-form-input"
                placeholder="Your caste"
              />
            </div>
            
            <div className="careers-form-group">
              <label className="careers-form-label">Gender <span className="careers-required">*</span></label>
              <div className="careers-radio-group">
                <label className="careers-radio-label">
                  <input 
                    type="radio" 
                    name="gender" 
                    value="Male"
                    checked={formData.gender === "Male"}
                    onChange={handleInputChange}
                  />
                  <span className="careers-radio-custom"></span>
                  Male
                </label>
                <label className="careers-radio-label">
                  <input 
                    type="radio" 
                    name="gender" 
                    value="Female"
                    checked={formData.gender === "Female"}
                    onChange={handleInputChange}
                  />
                  <span className="careers-radio-custom"></span>
                  Female
                </label>
                <label className="careers-radio-label">
                  <input 
                    type="radio" 
                    name="gender" 
                    value="Other"
                    checked={formData.gender === "Other"}
                    onChange={handleInputChange}
                  />
                  <span className="careers-radio-custom"></span>
                  Other
                </label>
              </div>
            </div>
            
            <div className="careers-form-group">
              <label className="careers-form-label">Aadhar Number</label>
              <input 
                type="text" 
                name="aadhar" 
                value={formData.aadhar}
                onChange={handleInputChange}
                className="careers-form-input"
                placeholder="12-digit Aadhar number"
              />
            </div>
            
            <div className="careers-form-group">
              <label className="careers-form-label">PAN Number</label>
              <input 
                type="text" 
                name="pan" 
                value={formData.pan}
                onChange={handleInputChange}
                className="careers-form-input"
                placeholder="10-character PAN number"
              />
            </div>
            
            <div className="careers-form-group">
              <label className="careers-form-label">Driving Licence (Optional)</label>
              <input 
                type="text" 
                name="dl" 
                value={formData.dl}
                onChange={handleInputChange}
                className="careers-form-input"
                placeholder="Driving licence number"
              />
            </div>
            
            <div className="careers-form-group careers-full-width">
              <label className="careers-form-label">Present Address</label>
              <textarea 
                name="paddress" 
                value={formData.paddress}
                onChange={handleInputChange}
                className="careers-form-textarea"
                placeholder="Your current address"
                rows="3"
              ></textarea>
            </div>
            
            <div className="careers-form-group careers-full-width">
              <label className="careers-form-label">Permanent Address</label>
              <textarea 
                name="peraddress" 
                value={formData.peraddress}
                onChange={handleInputChange}
                className="careers-form-textarea"
                placeholder="Your permanent address"
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="careers-form-section">
          <div className="careers-section-header">
            <div className="careers-section-number">02</div>
            <div className="careers-section-title">
              <h3>Education Details</h3>
              <p>Add your educational qualifications</p>
            </div>
          </div>

          <button type="button" className="careers-btn careers-btn-add" onClick={addEducation}>
            <span className="careers-btn-icon">+</span>
            Add Education
          </button>
          
          {formData.education.length > 0 && (
            <div className="careers-table-container">
              <table className="careers-table">
                <thead>
                  <tr>
                    <th>Qualification</th>
                    <th>Institution</th>
                    <th>Board/University</th>
                    <th>Year</th>
                    <th>Points</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.education.map((edu, index) => (
                    <tr key={index}>
                      <td>{edu.qualification}</td>
                      <td>{edu.institution}</td>
                      <td>{edu.board}</td>
                      <td>{edu.year}</td>
                      <td>{edu.points}</td>
                      <td>
                        <button 
                          type="button" 
                          onClick={() => removeEducation(index)}
                          className="careers-btn careers-btn-remove"
                          title="Remove this entry"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Experience Section */}
        <div className="careers-form-section">
          <div className="careers-section-header">
            <div className="careers-section-number">03</div>
            <div className="careers-section-title">
              <h3>Work Experience</h3>
              <p>Share your professional experience</p>
            </div>
          </div>

          <div className="careers-form-group">
            <label className="careers-form-label">Do you have work experience?</label>
            <div className="careers-radio-group">
              <label className="careers-radio-label">
                <input 
                  type="radio" 
                  name="hasExperience" 
                  value="no"
                  checked={formData.hasExperience === "no"}
                  onChange={handleInputChange}
                />
                <span className="careers-radio-custom"></span>
                No
              </label>
              <label className="careers-radio-label">
                <input 
                  type="radio" 
                  name="hasExperience" 
                  value="yes"
                  checked={formData.hasExperience === "yes"}
                  onChange={handleInputChange}
                />
                <span className="careers-radio-custom"></span>
                Yes
              </label>
            </div>
          </div>
          
          {formData.hasExperience === 'yes' && (
            <>
              <button type="button" className="careers-btn careers-btn-add" onClick={addExperience}>
                <span className="careers-btn-icon">+</span>
                Add Experience
              </button>
              
              {formData.experience.length > 0 && (
                <div className="careers-table-container">
                  <table className="careers-table">
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Role</th>
                        <th>Years</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.experience.map((exp, index) => (
                        <tr key={index}>
                          <td>{exp.company}</td>
                          <td>{exp.role}</td>
                          <td>{exp.years}</td>
                          <td>
                            <button 
                              type="button" 
                              onClick={() => removeExperience(index)}
                              className="careers-btn careers-btn-remove"
                              title="Remove this entry"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Payment Section */}
        <div className="careers-form-section">
          <div className="careers-section-header">
            <div className="careers-section-number">04</div>
            <div className="careers-section-title">
              <h3>Payment Information</h3>
              <p>Application fee payment details</p>
            </div>
          </div>

          <div className="careers-payment-card">
            <h4 className="careers-payment-title">Application Fee: ₹150</h4>
            <div className="careers-payment-details">
              <div className="careers-payment-item">
                <span className="careers-payment-label">Account Number:</span>
                <span className="careers-payment-value">196811010000077</span>
              </div>
              <div className="careers-payment-item">
                <span className="careers-payment-label">IFSC Code:</span>
                <span className="careers-payment-value">UBIN0819689</span>
              </div>
              <div className="careers-payment-item">
                <span className="careers-payment-label">Account Name:</span>
                <span className="careers-payment-value">L&NS Aryavarth Sindu Samraj Pvt Ltd</span>
              </div>
            </div>
            
            <div className="careers-form-group">
              <label className="careers-form-label">UTR Number <span className="careers-required">*</span></label>
              <input 
                type="text" 
                name="utr" 
                value={formData.utr}
                onChange={handleInputChange}
                className="careers-form-input"
                required 
                placeholder="Unique Transaction Reference number"
              />
            </div>
            
            <div className="careers-form-group">
              <label className="careers-form-label">Upload Payment Screenshot/Proof <span className="careers-required">*</span></label>
              <div className="careers-file-upload">
                <input 
                  type="file" 
                  name="payslip" 
                  onChange={handleFileChange}
                  className="careers-file-input"
                  accept="image/*" 
                  id="payslip-upload"
                />
                <label htmlFor="payslip-upload" className="careers-file-label">
                  <span className="careers-file-icon">📁</span>
                  <span className="careers-file-text">
                    {formData.payslip ? formData.payslip.name : 'Choose payment screenshot'}
                  </span>
                  <span className="careers-file-button">Browse</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="careers-form-section">
          <div className="careers-section-header">
            <div className="careers-section-number">05</div>
            <div className="careers-section-title">
              <h3>Document Uploads</h3>
              <p>Upload required documents</p>
            </div>
          </div>

          <div className="careers-documents-grid">
            <div className="careers-document-upload">
              <label className="careers-form-label">Photograph <span className="careers-required">*</span></label>
              <div className="careers-file-upload">
                <input 
                  type="file" 
                  name="photo" 
                  onChange={handleFileChange}
                  className="careers-file-input"
                  accept="image/*" 
                  required 
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="careers-file-label">
                  <span className="careers-file-icon">📷</span>
                  <span className="careers-file-text">
                    {formData.photo ? formData.photo.name : 'Upload your photo'}
                  </span>
                </label>
              </div>
              <p className="careers-file-hint">JPG or PNG, max 2MB</p>
            </div>
            
            <div className="careers-document-upload">
              <label className="careers-form-label">Signature <span className="careers-required">*</span></label>
              <div className="careers-file-upload">
                <input 
                  type="file" 
                  name="signature" 
                  onChange={handleFileChange}
                  className="careers-file-input"
                  accept="image/*" 
                  required 
                  id="signature-upload"
                />
                <label htmlFor="signature-upload" className="careers-file-label">
                  <span className="careers-file-icon">✍️</span>
                  <span className="careers-file-text">
                    {formData.signature ? formData.signature.name : 'Upload your signature'}
                  </span>
                </label>
              </div>
              <p className="careers-file-hint">JPG or PNG, max 2MB</p>
            </div>
            
            <div className="careers-document-upload">
              <label className="careers-form-label">Resume/CV <span className="careers-required">*</span></label>
              <div className="careers-file-upload">
                <input 
                  type="file" 
                  name="resume" 
                  onChange={handleFileChange}
                  className="careers-file-input"
                  accept=".pdf,.doc,.docx" 
                  required 
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="careers-file-label">
                  <span className="careers-file-icon">📄</span>
                  <span className="careers-file-text">
                    {formData.resume ? formData.resume.name : 'Upload your resume'}
                  </span>
                </label>
              </div>
              <p className="careers-file-hint">PDF, DOC or DOCX, max 5MB</p>
            </div>
          </div>
        </div>

        <div className="careers-form-actions">
          <button 
            type="submit" 
            className="careers-btn careers-btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="careers-spinner"></span>
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>
      </form>
      
      <footer className="careers-footer">
        <p>© {new Date().getFullYear()} L&NS ARYAVARTH SINDU SAMRAJ PRIVATE LIMITED. All rights reserved.</p>
      </footer>
    </div>
  </div>
);
};

export default CareersApplicationForm;