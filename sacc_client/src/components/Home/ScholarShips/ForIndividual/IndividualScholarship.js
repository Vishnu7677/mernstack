import React, { useState } from "react";
import axios from "axios";
import "./IndividualScholarship.css";

const IndividualScholarshipForm = () => {
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
    percentage: "",
    university: "",
    fatherOccupation: "",
    motherOccupation: "",
    familyIncome: "",
    incomeCertificate: false,
    previousScholarship: "",
    scholarshipReason: "",
    documents: {
      aadhaarCard: false,
      marksheet: false,
      incomeCertificate: false,
      bonafideCertificate: false,
      bankPassbook: false,
      photograph: false,
    },
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submissionStatus, setSubmissionStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDocumentChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      documents: {
        ...formData.documents,
        [name]: checked,
      },
    });
  };

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/scholarships", formData);
      setSubmissionStatus("success");
      console.log("Form submitted successfully", response.data);
    } catch (error) {
      setSubmissionStatus("error");
      console.error("Error submitting form", error);
    }
  };

  return (
    <div className="individual_scholarship_container">
      <div className="individual_scholarship_card">
        <div className="individual_scholarship_header">
          <h2>Scholarship Application Form</h2>
          <div className="individual_scholarship_progress">
            <div
              className={`individual_scholarship_progress_step ${
                currentStep >= 1 ? "active" : ""
              }`}
            >
              <span>1</span>
              <p>Personal</p>
            </div>
            <div
              className={`individual_scholarship_progress_step ${
                currentStep >= 2 ? "active" : ""
              }`}
            >
              <span>2</span>
              <p>Education</p>
            </div>
            <div
              className={`individual_scholarship_progress_step ${
                currentStep >= 3 ? "active" : ""
              }`}
            >
              <span>3</span>
              <p>Family</p>
            </div>
            <div
              className={`individual_scholarship_progress_step ${
                currentStep >= 4 ? "active" : ""
              }`}
            >
              <span>4</span>
              <p>Documents</p>
            </div>
          </div>
        </div>

        {submissionStatus === "success" ? (
          <div className="individual_scholarship_success">
            <h3>Application Submitted Successfully!</h3>
            <p>Thank you for applying. We'll review your application shortly.</p>
          </div>
        ) : submissionStatus === "error" ? (
          <div className="individual_scholarship_error">
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
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="individual_scholarship_step">
                <h3>Personal Information</h3>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Full Name*</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label>Date of Birth*</label>
                    <input
                      type="date"
                      className="form-control"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Gender*</label>
                    <select
                      className="form-control"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group col-md-6">
                    <label>Aadhar Number*</label>
                    <input
                      type="text"
                      className="form-control"
                      name="aadharNumber"
                      value={formData.aadharNumber}
                      onChange={handleChange}
                      pattern="[0-9]{12}"
                      title="12-digit Aadhar number"
                      required
                    />
                  </div>
                </div>
                <div className="individual_scholarship_button_group">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="individual_scholarship_button"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Educational Information */}
            {currentStep === 2 && (
              <div className="individual_scholarship_step">
                <h3>Educational Information</h3>
                <div className="form-group">
                  <label>Institution Name*</label>
                  <input
                    type="text"
                    className="form-control"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Course/Program*</label>
                    <input
                      type="text"
                      className="form-control"
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label>Year of Study*</label>
                    <select
                      className="form-control"
                      name="yearOfStudy"
                      value={formData.yearOfStudy}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Percentage/GPA*</label>
                    <input
                      type="text"
                      className="form-control"
                      name="percentage"
                      value={formData.percentage}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label>University*</label>
                    <input
                      type="text"
                      className="form-control"
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="individual_scholarship_button_group">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="individual_scholarship_button secondary"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="individual_scholarship_button"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Family Information */}
            {currentStep === 3 && (
              <div className="individual_scholarship_step">
                <h3>Family Information</h3>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Father's Name*</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label>Mother's Name*</label>
                    <input
                      type="text"
                      className="form-control"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Father's Occupation*</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fatherOccupation"
                      value={formData.fatherOccupation}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label>Mother's Occupation*</label>
                    <input
                      type="text"
                      className="form-control"
                      name="motherOccupation"
                      value={formData.motherOccupation}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Annual Family Income (₹)*</label>
                  <input
                    type="number"
                    className="form-control"
                    name="familyIncome"
                    value={formData.familyIncome}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Address*</label>
                  <textarea
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group col-md-4">
                    <label>City*</label>
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group col-md-4">
                    <label>State*</label>
                    <input
                      type="text"
                      className="form-control"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group col-md-4">
                    <label>PIN Code*</label>
                    <input
                      type="text"
                      className="form-control"
                      name="pinCode"
                      value={formData.pinCode}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="individual_scholarship_button_group">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="individual_scholarship_button secondary"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="individual_scholarship_button"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Documents and Submission */}
            {currentStep === 4 && (
              <div className="individual_scholarship_step">
                <h3>Required Documents</h3>
                <p>Please check all documents you have ready to upload:</p>
                <div className="individual_scholarship_documents">
                  {Object.entries(formData.documents).map(([doc, checked]) => (
                    <div
                      key={doc}
                      className={`individual_scholarship_document ${
                        checked ? "checked" : ""
                      }`}
                    >
                      <label>
                        <input
                          type="checkbox"
                          name={doc}
                          checked={checked}
                          onChange={handleDocumentChange}
                        />
                        <span>
                          {doc
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
                <div className="form-group">
                  <label>Reason for Scholarship*</label>
                  <textarea
                    className="form-control"
                    name="scholarshipReason"
                    value={formData.scholarshipReason}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="termsCheck"
                    required
                  />
                  <label className="form-check-label" htmlFor="termsCheck">
                    I certify that all information provided is accurate and
                    complete.
                  </label>
                </div>
                <div className="individual_scholarship_button_group">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="individual_scholarship_button secondary"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="individual_scholarship_button"
                  >
                    Submit Application
                  </button>
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