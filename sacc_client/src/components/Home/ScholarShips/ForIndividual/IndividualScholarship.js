import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./IndividualScholarship.css";
import showToast from '../../../Toast';
import { ToastContainer } from 'react-toastify';
import {
  saveDraftApplication,
  submitApplication,
  getDraftApplication,
  deleteDraftApplication,
  uploadDocuments
} from '../../../../Services/api';

const IndividualScholarshipForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    aadharNumber: "",
    fatherName: "",
    motherName: "",
    category: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    mobileNumber: "",
    email: "",
    institution: "",
    course: "",
    yearOfStudy: "",
    otherYearOfStudy: "",
    percentage: "",
    cgpa: "",
    university: "",
    fatherOccupation: "",
    motherOccupation: "",
    familyIncome: "",
    incomeCertificate: false,
    receivedScholarshipBefore: "",
    previousScholarship: "",
    scholarshipReason: "",
    documents: {
      aadhaarCard: null,
      marksheet: null,
      incomeCertificate: null,
      bonafideCertificate: null,
      bankPassbook: null,
      photograph: null,
      applicantSignature: null,
      parentSignature: null,
    },
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [draftApplicationId, setDraftApplicationId] = useState(null);

  // Load saved draft on component mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const token = Cookies.get("scholar_token");
        if (!token) return;

        const response = await getDraftApplication();

        if (response.success && response.data) {
          setFormData(mapSchemaToFormData(response.data));
          setDraftApplicationId(response.data._id);
          showToast('info', 'Draft application loaded successfully');
        }
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    };

    loadDraft();
  }, []);

  // Helper function to map backend schema to frontend form data
  const mapSchemaToFormData = (schemaData) => {
    return {
      fullName: schemaData.personalInfo?.fullName || "",
      dob: schemaData.personalInfo?.dateOfBirth || "",
      gender: schemaData.personalInfo?.gender || "",
      aadharNumber: schemaData.personalInfo?.aadharNumber || "",
      fatherName: schemaData.personalInfo?.fathersName || "",
      motherName: schemaData.personalInfo?.mothersName || "",
      category: schemaData.personalInfo?.category || "",
      address: schemaData.personalInfo?.address || "",
      city: schemaData.personalInfo?.city || "",
      state: schemaData.personalInfo?.state || "",
      pinCode: schemaData.personalInfo?.pinCode || "",
      mobileNumber: schemaData.LoginUser?.mobileNumber || "",
      email: schemaData.LoginUser?.email || "",
      institution: schemaData.educationDetails?.currentInstitution || "",
      course: schemaData.educationDetails?.courseProgram || "",
      yearOfStudy: schemaData.educationDetails?.yearOfStudy || "",
      otherYearOfStudy: schemaData.educationDetails?.otherYearOfStudy || "",
      percentage: schemaData.educationDetails?.previousYearPercentage || "",
      cgpa: schemaData.educationDetails?.previousYearCGPA || "",
      university: schemaData.educationDetails?.boardUniversityName || "",
      fatherOccupation: schemaData.familyDetails?.fathersOccupation || "",
      motherOccupation: schemaData.familyDetails?.mothersOccupation || "",
      familyIncome: schemaData.familyDetails?.annualFamilyIncome || "",
      incomeCertificate: schemaData.familyDetails?.incomeCertificateAttached || false,
      receivedScholarshipBefore: schemaData.scholarshipDetails?.receivedScholarshipBefore ? "yes" : "no",
      previousScholarship: schemaData.scholarshipDetails?.previousScholarshipName || "",
      scholarshipReason: schemaData.scholarshipDetails?.scholarshipReason || "",
      documents: {
        aadhaarCard: schemaData.documents?.aadharCard || null,
        marksheet: schemaData.documents?.marksheet || null,
        incomeCertificate: schemaData.documents?.incomeCertificate || null,
        bonafideCertificate: schemaData.documents?.bonafideCertificate || null,
        bankPassbook: schemaData.documents?.bankPassbook || null,
        photograph: schemaData.documents?.photograph || null,
        applicantSignature: schemaData.documents?.applicantSignature || null,
        parentSignature: schemaData.documents?.parentSignature || null,
      },
    };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileUpload = async (e, documentType) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;
  
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('error', 'File size should be less than 2MB');
      e.target.value = null;
      return;
    }
  
    // Check file type - signatures and photos should be images only
    let validTypes = ["image/jpeg", "image/png", "application/pdf"];
    
    if (documentType === 'applicantSignature' || documentType === 'parentSignature' || documentType === 'photograph') {
      validTypes = ["image/jpeg", "image/png"];
    }
    
    if (!validTypes.includes(file.type)) {
      showToast('error', documentType.includes('Signature') || documentType === 'photograph' 
        ? 'Only JPEG and PNG images are allowed' 
        : 'Only JPEG, PNG, and PDF files are allowed');
      e.target.value = null;
      return;
    }
  
    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append(documentType, file);
      formDataToUpload.append("documentType", documentType);
  
      if (draftApplicationId) {
        console.log("Uploading file:", documentType, file.name);
        
        const response = await uploadDocuments(draftApplicationId, formDataToUpload);
  
        if (response.data.success) {
          const uploadedFileUrl = response.data.data.uploadedFiles[documentType]?.url;
          
          if (uploadedFileUrl) {
            setFormData({
              ...formData,
              documents: {
                ...formData.documents,
                [documentType]: uploadedFileUrl,
              },
            });
            showToast('success', `${documentType.replace(/([A-Z])/g, ' $1')} uploaded successfully!`);
          } else {
            showToast('error', 'File uploaded but URL not received');
          }
        } else {
          showToast('error', response.data.message || 'Upload failed');
        }
      } else {
        setFormData({
          ...formData,
          documents: {
            ...formData.documents,
            [documentType]: file,
          },
        });
        showToast('success', `${documentType.replace(/([A-Z])/g, ' $1')} selected for upload!`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      showToast('error', error.message || 'File upload failed. Please try again.');
      e.target.value = null;
    }
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveAsDraft = async () => {
    try {
      setIsLoading(true);
      const result = await saveDraftApplication(formData, draftApplicationId);

      if (result.success) {
        setDraftApplicationId(result.data._id);
        showToast('success', 'Application saved as draft successfully!');
      } else {
        showToast('error', 'Failed to save draft. Please try again.');
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      showToast('error', 'Error saving draft. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDraft = async () => {
    if (!draftApplicationId) {
      showToast('info', 'No draft application to delete');
      return;
    }

    if (window.confirm('Are you sure you want to delete your draft application? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        const result = await deleteDraftApplication(draftApplicationId);

        if (result.success) {
          setDraftApplicationId(null);
          setFormData({
            fullName: "",
            dob: "",
            gender: "",
            aadharNumber: "",
            fatherName: "",
            motherName: "",
            category: "",
            address: "",
            city: "",
            state: "",
            pinCode: "",
            mobileNumber: "",
            email: "",
            institution: "",
            course: "",
            yearOfStudy: "",
            otherYearOfStudy: "",
            percentage: "",
            cgpa: "",
            university: "",
            fatherOccupation: "",
            motherOccupation: "",
            familyIncome: "",
            incomeCertificate: false,
            receivedScholarshipBefore: "",
            previousScholarship: "",
            scholarshipReason: "",
            documents: {
              aadhaarCard: null,
              marksheet: null,
              incomeCertificate: null,
              bonafideCertificate: null,
              bankPassbook: null,
              photograph: null,
              applicantSignature: null,
              parentSignature: null,
            },
          });
          showToast('success', 'Draft application deleted successfully!');
        } else {
          showToast('error', 'Failed to delete draft. Please try again.');
        }
      } catch (error) {
        console.error("Error deleting draft:", error);
        showToast('error', 'Error deleting draft. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      if (!draftApplicationId) {
        const draftResult = await saveDraftApplication(formData);
        if (draftResult.success) {
          setDraftApplicationId(draftResult.data._id);
        }
      }

      const result = await submitApplication();

      if (result.success) {
        setSubmissionStatus("success");
      } else {
        setSubmissionStatus("error");
        showToast('error', 'Error submitting application. Please try again.');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate('/scholar/apply/self/login');
      } else {
        setSubmissionStatus("error");
        console.error("Error submitting form", error);
        showToast('error', 'Error submitting application. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="individual_scholarship_container">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="individual_scholarship_card">
        <div className="individual_scholarship_header">
          <h2>Scholarship Application Form</h2>
          <div className="individual_scholarship_progress">
            {[1, 2, 3, 4, 5].map(step => (
              <div
                key={step}
                className={`individual_scholarship_progress_step ${currentStep >= step ? "active" : ""
                  }`}
              >
                <span>{step}</span>
                <p>
                  {step === 1 && "Personal"}
                  {step === 2 && "Education"}
                  {step === 3 && "Family"}
                  {step === 4 && "Documents"}
                  {step === 5 && "Review"}
                </p>
              </div>
            ))}
            <div className="individual_scholarship_progress_bar">
              <div
                className="individual_scholarship_progress_fill"
                style={{ width: `${(currentStep - 1) * 25}%` }}
              ></div>
            </div>
          </div>
        </div>

        {submissionStatus === "success" ? (
          <div className="individual_scholarship_success">
            <div className="success_animation">
              <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <h3>Application Submitted Successfully!</h3>
            <p>Thank you for applying. We'll review your application shortly.</p>
            <button
              onClick={() => navigate('/scholar/apply/self/login')}
              className="individual_scholarship_button primary"
            >
              Return to Dashboard
            </button>
          </div>
        ) : submissionStatus === "error" ? (
          <div className="individual_scholarship_error">
            <div className="error_animation">
              <svg className="crossmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="crossmark__circle" cx="26" cy="26" r="25" fill="none" />
                <path className="crossmark__cross" fill="none" d="M16 16 36 36 M36 16 16 36" />
              </svg>
            </div>
            <h3>Error Submitting Application</h3>
            <p>Please try again later or contact support.</p>
            <button
              onClick={() => setSubmissionStatus(null)}
              className="individual_scholarship_button"
            >
              Try Again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="animated-form">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="individual_scholarship_step step-animation">
                <h3>Personal Information</h3>
                <div className="form-grid">
                  <div className="form-group floating">
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      placeholder=" "
                    />
                    <label>Full Name*</label>
                    <div className="form-underline"></div>
                  </div>

                  <div className="form-group floating">
                    <input
                      type="date"
                      className="form-control"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      required
                      placeholder=" "
                    />
                    <label>Date of Birth*</label>
                    <div className="form-underline"></div>
                  </div>

                  <div className="form-group floating">
                    <select
                      className="form-control"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value=""></option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <label>Gender*</label>
                    <div className="form-underline"></div>
                  </div>

                  <div className="form-group floating">
                    <input
                      type="text"
                      className="form-control"
                      name="aadharNumber"
                      value={formData.aadharNumber}
                      onChange={handleChange}
                      pattern="[0-9]{12}"
                      title="12-digit Aadhar number"
                      required
                      placeholder=" "
                    />
                    <label>Aadhar Number*</label>
                    <div className="form-underline"></div>
                  </div>

                  <div className="form-group floating">
                    <select
                      className="form-control"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value=""></option>
                      <option value="General">General</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="OBC">OBC</option>
                      <option value="Other">Other</option>
                    </select>
                    <label>Category</label>
                    <div className="form-underline"></div>
                  </div>
                </div>

                <div className="individual_scholarship_button_group">
                  <div className="button-row">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="individual_scholarship_button secondary back-btn"
                      disabled={true}
                    >
                      <span className="btn-arrow">←</span> Back
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteDraft}
                      className="individual_scholarship_button danger"
                      disabled={isLoading || !draftApplicationId}
                    >
                      {isLoading ? "Deleting..." : "Delete Draft"}
                    </button>
                    <button
                      type="button"
                      onClick={saveAsDraft}
                      className="individual_scholarship_button secondary"
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save Draft"}
                    </button>

                    <button
                      type="button"
                      onClick={nextStep}
                      className="individual_scholarship_button next-btn"
                    >
                      Next <span className="btn-arrow">→</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Educational Information */}
            {currentStep === 2 && (
              <div className="individual_scholarship_step step-animation">
                <h3>Educational Information</h3>
                <div className="form-grid">
                  <div className="form-group floating full-width">
                    <input
                      type="text"
                      className="form-control"
                      name="institution"
                      value={formData.institution}
                      onChange={handleChange}
                      required
                      placeholder=" "
                    />
                    <label>Institution Name*</label>
                    <div className="form-underline"></div>
                  </div>

                  <div className="form-group floating">
                    <input
                      type="text"
                      className="form-control"
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      placeholder=" "
                    />
                    <label>Course/Program</label>
                    <div className="form-underline"></div>
                  </div>

                  <div className="form-group floating">
                    <select
                      className="form-control"
                      name="yearOfStudy"
                      value={formData.yearOfStudy}
                      onChange={handleChange}
                    >
                      <option value=""></option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Other">Other</option>
                    </select>
                    <label>Year of Study</label>
                    <div className="form-underline"></div>
                  </div>

                  {formData.yearOfStudy === "Other" && (
                    <div className="form-group floating">
                      <input
                        type="text"
                        className="form-control"
                        name="otherYearOfStudy"
                        value={formData.otherYearOfStudy}
                        onChange={handleChange}
                        placeholder=" "
                        required
                      />
                      <label>Specify Year of Study*</label>
                      <div className="form-underline"></div>
                    </div>
                  )}

                  <div className="form-group floating">
                    <input
                      type="number"
                      className="form-control"
                      name="percentage"
                      value={formData.percentage}
                      onChange={handleChange}
                      placeholder=" "
                      step="0.01"
                      min="0"
                      max="100"
                    />
                    <label>Percentage (%)</label>
                    <div className="form-underline"></div>
                  </div>

                  <div className="form-group floating">
                    <input
                      type="number"
                      className="form-control"
                      name="cgpa"
                      value={formData.cgpa}
                      onChange={handleChange}
                      placeholder=" "
                      step="0.01"
                      min="0"
                      max="10"
                    />
                    <label>CGPA (out of 10)</label>
                    <div className="form-underline"></div>
                  </div>

                  <div className="form-group floating full-width">
                    <input
                      type="text"
                      className="form-control"
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      placeholder=" "
                    />
                    <label>University/Board Name</label>
                    <div className="form-underline"></div>
                  </div>
                </div>

                <div className="individual_scholarship_button_group">
                  <div className="button-row">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="individual_scholarship_button secondary back-btn"
                    >
                      <span className="btn-arrow">←</span> Back
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteDraft}
                      className="individual_scholarship_button danger"
                      disabled={isLoading || !draftApplicationId}
                    >
                      {isLoading ? "Deleting..." : "Delete Draft"}
                    </button>
                    <button
                      type="button"
                      onClick={saveAsDraft}
                      className="individual_scholarship_button secondary"
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save Draft"}
                    </button>

                    <button
                      type="button"
                      onClick={nextStep}
                      className="individual_scholarship_button next-btn"
                    >
                      Next <span className="btn-arrow">→</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Family Information */}
            {currentStep === 3 && (
              <div className="individual_scholarship_step step-animation">
                <h3>Family Information</h3>
                <div className="form-grid">
                  <div className="form-group floating">
                    <input
                      type="text"
                      className="form-control"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      required
                      placeholder=" "
                    />
                    <label>Father's Name*</label>
                    <div className="form-underline"></div>
                  </div>

                  <div className="form-group floating">
                    <input
                      type="text"
                      className="form-control"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleChange}
                      required
                      placeholder=" "
                    />
                    <label>Mother's Name*</label>
                    <div className="form-underline"></div>
                  </div>

                  <div className="form-group floating">
                    <input
                      type="text"
                      className="form-control"
                      name="fatherOccupation"
                      value={formData.fatherOccupation}
                      onChange={handleChange}
                      required
                      placeholder=" "
                    />
                    <label>Father's Occupation*</label>
                    <div className="form-underline"></div>
                  </div>

                  <div className="form-group floating">
                    <input
                      type="text"
                      className="form-control"
                      name="motherOccupation"
                      value={formData.motherOccupation}
                      onChange={handleChange}
                      required
                      placeholder=" "
                    />
                    <label>Mother's Occupation*</label>
                    <div className="form-underline"></div>
                  </div>

                  <div className="form-group floating">
                    <input
                      type="number"
                      className="form-control"
                      name="familyIncome"
                      value={formData.familyIncome}
                      onChange={handleChange}
                      required
                      placeholder=" "
                    />
                    <label>Annual Family Income (₹)*</label>
                    <div className="form-underline"></div>
                  </div>

                  <div className="form-group floating">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="incomeCertificate"
                        checked={formData.incomeCertificate}
                        onChange={handleChange}
                      />
                      I have attached Income Certificate
                    </label>
                  </div>

                  <div className="form-group floating full-width">
                    <textarea
                      className="form-control"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder=" "
                      rows="3"
                    />
                    <label>Address*</label>
                    <div className="form-underline"></div>
                  </div>

                  <div className="form-group floating">
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder=" "
                    />
                    <label>City*</label>
                    <div className="form-underline"></div>
                  </div>

                  <div className="form-group floating">
                    <input
                      type="text"
                      className="form-control"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      placeholder=" "
                    />
                    <label>State*</label>
                    <div className="form-underline"></div>
                  </div>

                  <div className="form-group floating">
                    <input
                      type="text"
                      className="form-control"
                      name="pinCode"
                      value={formData.pinCode}
                      onChange={handleChange}
                      required
                      placeholder=" "
                    />
                    <label>PIN Code*</label>
                    <div className="form-underline"></div>
                  </div>

                  <div className="form-group floating">
                    <select
                      className="form-control"
                      name="receivedScholarshipBefore"
                      value={formData.receivedScholarshipBefore}
                      onChange={handleChange}
                    >
                      <option value=""></option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                    <label>Received Scholarship Before?*</label>
                    <div className="form-underline"></div>
                  </div>

                  {formData.receivedScholarshipBefore === "yes" && (
                    <div className="form-group floating">
                      <input
                        type="text"
                        className="form-control"
                        name="previousScholarship"
                        value={formData.previousScholarship}
                        onChange={handleChange}
                        placeholder=" "
                        required
                      />
                      <label>Previous Scholarship Name*</label>
                      <div className="form-underline"></div>
                    </div>
                  )}
                </div>

                <div className="individual_scholarship_button_group">
                  <div className="button-row">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="individual_scholarship_button secondary back-btn"
                    >
                      <span className="btn-arrow">←</span> Back
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteDraft}
                      className="individual_scholarship_button danger"
                      disabled={isLoading || !draftApplicationId}
                    >
                      {isLoading ? "Deleting..." : "Delete Draft"}
                    </button>
                    <button
                      type="button"
                      onClick={saveAsDraft}
                      className="individual_scholarship_button secondary"
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save Draft"}
                    </button>

                    <button
                      type="button"
                      onClick={nextStep}
                      className="individual_scholarship_button next-btn"
                    >
                      Next <span className="btn-arrow">→</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Documents and Signatures */}
            {currentStep === 4 && (
              <div className="individual_scholarship_step step-animation">
                <h3>Upload Required Documents</h3>
                <p className="upload-description">Please upload all required documents (Max size: 2MB each)</p>

                <div className="document-upload-grid">
                  {[
                    { key: "aadhaarCard", label: "Aadhar Card", icon: "📄", accept: ".jpg,.jpeg,.png,.pdf" },
                    { key: "marksheet", label: "Marksheet", icon: "📑", accept: ".jpg,.jpeg,.png,.pdf" },
                    { key: "incomeCertificate", label: "Income Certificate", icon: "💰", accept: ".jpg,.jpeg,.png,.pdf", required: formData.incomeCertificate },
                    { key: "bonafideCertificate", label: "Bonafide Certificate", icon: "🏫", accept: ".jpg,.jpeg,.png,.pdf" },
                    { key: "bankPassbook", label: "Bank Passbook", icon: "💳", accept: ".jpg,.jpeg,.png,.pdf" },
                    { key: "photograph", label: "Photograph", icon: "📷", accept: ".jpg,.jpeg,.png" },
                    { key: "applicantSignature", label: "Applicant Signature", icon: "✍️", accept: ".jpg,.jpeg,.png" },
                    { key: "parentSignature", label: "Parent Signature", icon: "✍️", accept: ".jpg,.jpeg,.png" },
                  ].map(({ key, label, icon, accept, required }) => (
                    (required !== false) && (
                      <div key={key} className="document-upload-card">
                        <div className="document-icon">{icon}</div>
                        <h4>{label} *</h4>

                        <label className="file-upload-label">
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload(e, key)}
                            accept={accept}
                            required={!formData.documents[key]}
                          />
                          <span className="file-upload-button">
                            {formData.documents[key] ? "Change File" : "Select File"}
                          </span>
                        </label>

                        {formData.documents[key] && (
                          <div className="upload-success-message">
                            <span className="success-icon">✓</span>
                            Uploaded successfully
                          </div>
                        )}
                      </div>
                    )
                  ))}
                </div>

                <div className="form-group floating full-width">
                  <textarea
                    className="form-control"
                    name="scholarshipReason"
                    value={formData.scholarshipReason}
                    onChange={handleChange}
                    required
                    placeholder=" "
                    rows="4"
                  />
                  <label>Reason for Scholarship*</label>
                  <div className="form-underline"></div>
                </div>

                <div className="individual_scholarship_button_group">
                  <div className="button-row">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="individual_scholarship_button secondary back-btn"
                    >
                      <span className="btn-arrow">←</span> Back
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteDraft}
                      className="individual_scholarship_button danger"
                      disabled={isLoading || !draftApplicationId}
                    >
                      {isLoading ? "Deleting..." : "Delete Draft"}
                    </button>
                    <button
                      type="button"
                      onClick={saveAsDraft}
                      className="individual_scholarship_button secondary"
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save Draft"}
                    </button>

                    <button
                      type="button"
                      onClick={nextStep}
                      className="individual_scholarship_button next-btn"
                    >
                      Next <span className="btn-arrow">→</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review and Submit */}
            {currentStep === 5 && (
              <div className="individual_scholarship_step step-animation">
                <h3>Review Your Application</h3>
                <p className="review-description">Please review all the information before submitting your application.</p>

                <div className="review-section">
                  <h4>Personal Information</h4>
                  <div className="review-grid">
                    <div className="review-item">
                      <label>Full Name:</label>
                      <span>{formData.fullName}</span>
                    </div>
                    <div className="review-item">
                      <label>Date of Birth:</label>
                      <span>{formData.dob}</span>
                    </div>
                    <div className="review-item">
                      <label>Gender:</label>
                      <span>{formData.gender}</span>
                    </div>
                    <div className="review-item">
                      <label>Aadhar Number:</label>
                      <span>{formData.aadharNumber}</span>
                    </div>
                    <div className="review-item">
                      <label>Category:</label>
                      <span>{formData.category || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                <div className="review-section">
                  <h4>Educational Information</h4>
                  <div className="review-grid">
                    <div className="review-item">
                      <label>Institution:</label>
                      <span>{formData.institution}</span>
                    </div>
                    {formData.course && (
                      <div className="review-item">
                        <label>Course:</label>
                        <span>{formData.course}</span>
                      </div>
                    )}
                    <div className="review-item">
                      <label>Year of Study:</label>
                      <span>{formData.yearOfStudy === "Other" ? formData.otherYearOfStudy : formData.yearOfStudy}</span>
                    </div>
                    {formData.percentage && (
                      <div className="review-item">
                        <label>Percentage:</label>
                        <span>{formData.percentage}%</span>
                      </div>
                    )}
                    {formData.cgpa && (
                      <div className="review-item">
                        <label>CGPA:</label>
                        <span>{formData.cgpa}/10</span>
                      </div>
                    )}
                    {formData.university && (
                      <div className="review-item">
                        <label>University:</label>
                        <span>{formData.university}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="review-section">
                  <h4>Family Information</h4>
                  <div className="review-grid">
                    <div className="review-item">
                      <label>Father's Name:</label>
                      <span>{formData.fatherName}</span>
                    </div>
                    <div className="review-item">
                      <label>Mother's Name:</label>
                      <span>{formData.motherName}</span>
                    </div>
                    <div className="review-item">
                      <label>Father's Occupation:</label>
                      <span>{formData.fatherOccupation}</span>
                    </div>
                    <div className="review-item">
                      <label>Mother's Occupation:</label>
                      <span>{formData.motherOccupation}</span>
                    </div>
                    <div className="review-item">
                      <label>Annual Income:</label>
                      <span>₹{formData.familyIncome}</span>
                    </div>
                    <div className="review-item">
                      <label>Income Certificate:</label>
                      <span>{formData.incomeCertificate ? 'Attached' : 'Not attached'}</span>
                    </div>
                    <div className="review-item">
                      <label>Previous Scholarship:</label>
                      <span>{formData.receivedScholarshipBefore === "yes" ? formData.previousScholarship : 'No'}</span>
                    </div>
                    <div className="review-item full-width">
                      <label>Address:</label>
                      <span>{formData.address}, {formData.city}, {formData.state} - {formData.pinCode}</span>
                    </div>
                  </div>
                </div>

                <div className="review-section">
                  <h4>Documents Uploaded</h4>
                  <div className="review-grid">
                    {Object.entries(formData.documents).map(([key, value]) => (
                      value && (
                        <div key={key} className="review-item">
                          <label>{key.replace(/([A-Z])/g, ' $1')}:</label>
                          <span className="document-status">✓ Uploaded</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                <div className="review-section">
                  <h4>Scholarship Reason</h4>
                  <div className="review-item full-width">
                    <p>{formData.scholarshipReason}</p>
                  </div>
                </div>

                <div className="form-check agree-terms">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="termsCheck"
                    required
                  />
                  <label className="form-check-label" htmlFor="termsCheck">
                    I certify that all information provided is accurate and complete.
                  </label>
                </div>

                <div className="individual_scholarship_button_group">
                  <div className="button-row">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="individual_scholarship_button secondary back-btn"
                    >
                      <span className="btn-arrow">←</span> Back
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteDraft}
                      className="individual_scholarship_button danger"
                      disabled={isLoading || !draftApplicationId}
                    >
                      {isLoading ? "Deleting..." : "Delete Draft"}
                    </button>
                    <button
                      type="button"
                      onClick={saveAsDraft}
                      className="individual_scholarship_button secondary"
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save Draft"}
                    </button>
                    <button
                      type="submit"
                      className="individual_scholarship_button primary submit-btn"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner"></span>
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default IndividualScholarshipForm;