import React, { useState, useEffect } from "react";
import apiList from "../../lib/apiList";
import "./MembershipOpeningForm.css";
import EmployeeNavbar from "../Employee/EmployeeNavbar/employeeNav";
import { ToastContainer } from 'react-toastify';
import showToast from "../Toast";
import Cookies from "js-cookie";

const MembershipOpeningForm = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        father_name: "",
        mother_name: "",
        date_of_birth: "",
        gender: "",
        marital_status: "",
        full_address: "",
        phone_number: "",
        email_id: "",
        pan_number: "",
        aadhar_number:"",
        membership_type: "",
        occupation: "",
        name_of_employer_business: "",
        annual_income: "",
        application_fee_received: "",
        current_house_no: "",
        current_street: "",
        current_village_city: "",
        current_landmark: "",
        current_pincode: "",
        current_district: "",
        current_state: "",
        current_country: "",
        guardian_name: "",
        guardian_phone_number: "",
        relationship: ""
    });
    
    const [uploadedFiles, setUploadedFiles] = useState({
        signature: null,
        aadhaar_front: null,
        aadhaar_back: null,
        pan: null,
        photo: null,
        addressProof: null,
        birthCertificate: null
    });
    
    const [error, setError] = useState('');
    const [currentAddressVisible, setCurrentAddressVisible] = useState(false);
    const [isMinor, setIsMinor] = useState(false);
    const token = Cookies.get('employee_token');

    // Generate receipt number when component mounts
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            receipt_no: `LNSAA-${Math.floor(Math.random() * 10000000)}`
        }));
    }, []);

    // Check if user is minor based on date of birth
    useEffect(() => {
        if (formData.date_of_birth) {
            const dob = new Date(formData.date_of_birth);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            setIsMinor(age < 18);
        }
    }, [formData.date_of_birth]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileUpload = (fileType, event) => {
        const file = event.target.files[0];
        if (file) {
            const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                setError(`Invalid file type for ${fileType}. Please upload an image or PDF.`);
                showToast('error', `Invalid file type for ${fileType}. Please upload an image or PDF.`);
                return;
            }

            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setError(`File size too large for ${fileType}. Max 2MB allowed.`);
                showToast('error', `File size too large for ${fileType}. Max 2MB allowed.`);
                return;
            }

            setError('');
            setUploadedFiles(prev => ({
                ...prev,
                [fileType]: file
            }));
        }
    };

    const handleRemoveFile = (fileType) => {
        setUploadedFiles(prev => ({
            ...prev,
            [fileType]: null
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formDataToSend = new FormData();

            // Validate all required fields before submission
            const requiredFields = [
                'name', 'father_name', 'date_of_birth', 'gender', 'phone_number',
                'marital_status', 'membership_type', 'occupation',
                'annual_income', 'name_of_employer_business', 'application_fee_received','aadhar_number'
            ];

            const missingFields = requiredFields.filter(field => !formData[field]);

            if (missingFields.length > 0) {
                throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
            }

            if (currentAddressVisible && (
                !formData.current_country || !formData.current_district ||
                !formData.current_house_no || !formData.current_pincode ||
                !formData.current_state || !formData.current_village_city
            )) {
                throw new Error('Please complete all current address fields');
            }

            // Validate documents
            const requiredDocs = ['aadhaar_front', 'aadhaar_back', 'photo', 'signature'];
            if (isMinor) requiredDocs.push('birthCertificate');

            const missingDocs = requiredDocs.filter(doc => !uploadedFiles[doc]);
            if (missingDocs.length > 0) {
                throw new Error(`Please upload all required documents: ${missingDocs.join(', ')}`);
            }

            // Append all form data
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Append all uploaded files
            Object.keys(uploadedFiles).forEach(key => {
                if (uploadedFiles[key]) {
                    formDataToSend.append(key, uploadedFiles[key]);
                }
            });

            // Append additional fields
            formDataToSend.append('is_minor', isMinor);
            formDataToSend.append('has_current_address', currentAddressVisible);

            const response = await fetch(apiList.submitMembership, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend,
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.missingFields) {
                    throw new Error(`Missing fields: ${data.missingFields.join(', ')}`);
                }
                throw new Error(data.message || 'Failed to submit the form.');
            }

            showToast('success', 'Form submitted successfully!');
            setStep(3); // Move to success step

        } catch (error) {
            console.error('Error submitting form:', error);
            showToast('error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => {
        const steps = [
            { number: 1, label: "Personal Details" },
            { number: 2, label: "Review & Submit" }
        ];

        return (
            <div className="membership_step-indicator">
                {steps.map((item) => (
                    <div
                        key={item.number}
                        className={`membership_step ${step === item.number ? "membership_active" : ""} ${step > item.number ? "membership_completed" : ""}`}
                    >
                        <div className="membership_step-number">{item.number}</div>
                        <div className="membership_step-label">{item.label}</div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div>
            <EmployeeNavbar />
            <ToastContainer />
            <div className="membership_form-container">
                {renderStepIndicator()}

                {step === 1 && (
                    <div className="membership_form-step membership_personal-details-step">
                        <h2>Membership Application Form</h2>
                        <p className="membership_form-intro">Please fill in all the required details to apply for membership.</p>

                        <div className="membership_form-grid">
                            {/* Personal Information */}
                            <div className="membership_form-section-title">Personal Information</div>

                            <div className="membership_form-group">
                                <label htmlFor="name">Full Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="membership_form-group">
                                <label htmlFor="father_name">Father's Name</label>
                                <input
                                    type="text"
                                    id="father_name"
                                    name="father_name"
                                    value={formData.father_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="membership_form-group">
                                <label htmlFor="mother_name">Mother's Name</label>
                                <input
                                    type="text"
                                    id="mother_name"
                                    name="mother_name"
                                    value={formData.mother_name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="membership_form-group">
                                <label htmlFor="date_of_birth">Date of Birth <span className="required">*</span></label>
                                <input
                                    type="date"
                                    id="date_of_birth"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="membership_form-group">
                                <label htmlFor="gender">Gender <span className="required">*</span></label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                    <option value="T">Transgender</option>
                                </select>
                            </div>

                            <div className="membership_form-group">
                                <label htmlFor="marital_status">Marital Status <span className="required">*</span></label>
                                <select
                                    id="marital_status"
                                    name="marital_status"
                                    value={formData.marital_status}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Marital Status</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Divorced">Divorced</option>
                                </select>
                            </div>

                            {/* Contact Information */}
                            <div className="membership_form-section-title">Contact Information</div>

                            <div className="membership_form-group">
                                <label htmlFor="full_address">Full Address <span className="required">*</span></label>
                                <textarea
                                    id="full_address"
                                    name="full_address"
                                    value={formData.full_address}
                                    onChange={handleChange}
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="membership_form-group">
                                <label htmlFor="phone_number">Phone Number <span className="required">*</span></label>
                                <input
                                    type="tel"
                                    id="phone_number"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="membership_form-group">
                                <label htmlFor="email_id">Email ID<span className="required">*</span></label>
                                <input
                                    type="email"
                                    id="email_id"
                                    name="email_id"
                                    value={formData.email_id}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="membership_form-group">
                                <label htmlFor="pan_number">PAN Number<span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="pan_number"
                                    name="pan_number"
                                    value={formData.pan_number}
                                    onChange={handleChange}
                                    onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                                />
                            </div>
                            <div className="membership_form-group">
                                <label htmlFor="aadhar_number">Aadhaar Number<span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="aadhar_number"
                                    name="aadhar_number"
                                    value={formData.aadhar_number}
                                    onChange={handleChange}
                                    onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                                />
                            </div>

                            {/* Membership Information */}
                            <div className="membership_form-section-title">Membership Information</div>

                            <div className="membership_form-group">
                                <label>Membership Type <span className="required">*</span></label>
                                <div className="membership_radio-group">
                                    <label className="membership_radio-option">
                                        <input
                                            type="radio"
                                            name="membership_type"
                                            value="Ordinary"
                                            checked={formData.membership_type === "Ordinary"}
                                            onChange={handleChange}
                                            required
                                        />
                                        <span className="membership_radio-label">Ordinary</span>
                                    </label>
                                    <label className="membership_radio-option">
                                        <input
                                            type="radio"
                                            name="membership_type"
                                            value="VIP"
                                            checked={formData.membership_type === "VIP"}
                                            onChange={handleChange}
                                        />
                                        <span className="membership_radio-label">VIP</span>
                                    </label>
                                </div>
                            </div>

                            <div className="membership_form-group">
                                <label>Occupation <span className="required">*</span></label>
                                <div className="membership_radio-group">
                                    <label className="membership_radio-option">
                                        <input
                                            type="radio"
                                            name="occupation"
                                            value="government_employee"
                                            onChange={handleChange}
                                        />
                                        <span className="membership_radio-label">Government Employee</span>
                                    </label>
                                    <label className="membership_radio-option">
                                        <input
                                            type="radio"
                                            name="occupation"
                                            value="private_employee"
                                            onChange={handleChange}
                                        />
                                        <span className="membership_radio-label">Private Employee</span>
                                    </label>
                                    <label className="membership_radio-option">
                                        <input
                                            type="radio"
                                            name="occupation"
                                            value="self_employee"
                                            onChange={handleChange}
                                        />
                                        <span className="membership_radio-label">Self-Employed</span>
                                    </label>
                                    <label className="membership_radio-option">
                                        <input
                                            type="radio"
                                            name="occupation"
                                            value="Other"
                                            onChange={handleChange}
                                        />
                                        <span className="membership_radio-label">Other</span>
                                    </label>
                                </div>
                            </div>

                            <div className="membership_form-group">
                                <label htmlFor="name_of_employer_business">Employer/Business Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="name_of_employer_business"
                                    name="name_of_employer_business"
                                    value={formData.name_of_employer_business}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="membership_form-group">
                                <label htmlFor="annual_income">Annual Income <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="annual_income"
                                    name="annual_income"
                                    value={formData.annual_income}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="membership_form-group">
                                <label htmlFor="application_fee_received">Membership Opening Fee <span className="required">*</span></label>
                                <input
                                    type="number"
                                    id="application_fee_received"
                                    name="application_fee_received"
                                    value={formData.application_fee_received}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Current Address Toggle */}
                            <div className="membership_form-group membership_full-width">
                                <label className="membership_checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={currentAddressVisible}
                                        onChange={() => setCurrentAddressVisible(!currentAddressVisible)}
                                    />
                                    <span className="membership_checkbox-custom"></span>
                                    Add Current Address (if different from permanent address)
                                </label>
                            </div>

                            {/* Current Address Fields */}
                            {currentAddressVisible && (
                                <>
                                    <div className="membership_form-section-title">Current Address</div>
                                    
                                    <div className="membership_form-group">
                                        <label htmlFor="current_house_no">House No.</label>
                                        <input
                                            type="text"
                                            id="current_house_no"
                                            name="current_house_no"
                                            value={formData.current_house_no}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="membership_form-group">
                                        <label htmlFor="current_street">Street</label>
                                        <input
                                            type="text"
                                            id="current_street"
                                            name="current_street"
                                            value={formData.current_street}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="membership_form-group">
                                        <label htmlFor="current_village_city">Village/City</label>
                                        <input
                                            type="text"
                                            id="current_village_city"
                                            name="current_village_city"
                                            value={formData.current_village_city}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="membership_form-group">
                                        <label htmlFor="current_landmark">Landmark</label>
                                        <input
                                            type="text"
                                            id="current_landmark"
                                            name="current_landmark"
                                            value={formData.current_landmark}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="membership_form-group">
                                        <label htmlFor="current_pincode">Pin Code</label>
                                        <input
                                            type="text"
                                            id="current_pincode"
                                            name="current_pincode"
                                            value={formData.current_pincode}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="membership_form-group">
                                        <label htmlFor="current_district">District</label>
                                        <input
                                            type="text"
                                            id="current_district"
                                            name="current_district"
                                            value={formData.current_district}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="membership_form-group">
                                        <label htmlFor="current_state">State</label>
                                        <input
                                            type="text"
                                            id="current_state"
                                            name="current_state"
                                            value={formData.current_state}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="membership_form-group">
                                        <label htmlFor="current_country">Country</label>
                                        <input
                                            type="text"
                                            id="current_country"
                                            name="current_country"
                                            value={formData.current_country}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Guardian Details (shown only if minor) */}
                            {isMinor && (
                                <>
                                    <div className="membership_form-section-title">Guardian Details (Required for minors)</div>

                                    <div className="membership_form-group">
                                        <label htmlFor="guardian_name">Guardian's Full Name</label>
                                        <input
                                            type="text"
                                            id="guardian_name"
                                            name="guardian_name"
                                            value={formData.guardian_name}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="membership_form-group">
                                        <label htmlFor="guardian_phone_number">Guardian's Phone Number</label>
                                        <input
                                            type="text"
                                            id="guardian_phone_number"
                                            name="guardian_phone_number"
                                            value={formData.guardian_phone_number}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="membership_form-group">
                                        <label htmlFor="relationship">Relationship with Applicant</label>
                                        <input
                                            type="text"
                                            id="relationship"
                                            name="relationship"
                                            value={formData.relationship}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Document Uploads */}
                            <div className="membership_form-section-title">Document Uploads</div>

                            <div className="membership_form-group membership_full-width">
                                <label htmlFor="photo">Passport Size Photo (Max 2MB) <span className="required">*</span></label>
                                <div className="membership_file-upload-wrapper">
                                    <label className="membership_file-upload-button">
                                        <span>Choose File</span>
                                        <input
                                            type="file"
                                            id="photo"
                                            onChange={(e) => handleFileUpload('photo', e)}
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    {uploadedFiles.photo ? (
                                        <div className="membership_file-preview">
                                            <span>{uploadedFiles.photo.name}</span>
                                            <button
                                                type="button"
                                                className="membership_remove-file-button"
                                                onClick={() => handleRemoveFile('photo')}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="membership_file-hint">No file chosen</div>
                                    )}
                                </div>
                            </div>

                            <div className="membership_form-group membership_full-width">
                                <label htmlFor="signature">Signature (Max 2MB) <span className="required">*</span></label>
                                <div className="membership_file-upload-wrapper">
                                    <label className="membership_file-upload-button">
                                        <span>Choose File</span>
                                        <input
                                            type="file"
                                            id="signature"
                                            onChange={(e) => handleFileUpload('signature', e)}
                                            accept="image/*,.pdf"
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    {uploadedFiles.signature ? (
                                        <div className="membership_file-preview">
                                            <span>{uploadedFiles.signature.name}</span>
                                            <button
                                                type="button"
                                                className="membership_remove-file-button"
                                                onClick={() => handleRemoveFile('signature')}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="membership_file-hint">No file chosen</div>
                                    )}
                                </div>
                            </div>

                            <div className="membership_form-group membership_full-width">
                                <label htmlFor="aadhaar_front">Aadhaar Card - Front (Max 2MB) <span className="required">*</span></label>
                                <div className="membership_file-upload-wrapper">
                                    <label className="membership_file-upload-button">
                                        <span>Choose File</span>
                                        <input
                                            type="file"
                                            id="aadhaar_front"
                                            onChange={(e) => handleFileUpload('aadhaar_front', e)}
                                            accept="image/*,.pdf"
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    {uploadedFiles.aadhaar_front ? (
                                        <div className="membership_file-preview">
                                            <span>{uploadedFiles.aadhaar_front.name}</span>
                                            <button
                                                type="button"
                                                className="membership_remove-file-button"
                                                onClick={() => handleRemoveFile('aadhaar_front')}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="membership_file-hint">No file chosen</div>
                                    )}
                                </div>
                            </div>

                            <div className="membership_form-group membership_full-width">
                                <label htmlFor="aadhaar_back">Aadhaar Card - Back (Max 2MB) <span className="required">*</span></label>
                                <div className="membership_file-upload-wrapper">
                                    <label className="membership_file-upload-button">
                                        <span>Choose File</span>
                                        <input
                                            type="file"
                                            id="aadhaar_back"
                                            onChange={(e) => handleFileUpload('aadhaar_back', e)}
                                            accept="image/*,.pdf"
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    {uploadedFiles.aadhaar_back ? (
                                        <div className="membership_file-preview">
                                            <span>{uploadedFiles.aadhaar_back.name}</span>
                                            <button
                                                type="button"
                                                className="membership_remove-file-button"
                                                onClick={() => handleRemoveFile('aadhaar_back')}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="membership_file-hint">No file chosen</div>
                                    )}
                                </div>
                            </div>

                            <div className="membership_form-group membership_full-width">
                                <label htmlFor="pan">PAN Card (Max 2MB)<span className="required">*</span></label>
                                <div className="membership_file-upload-wrapper">
                                    <label className="membership_file-upload-button">
                                        <span>Choose File</span>
                                        <input
                                            type="file"
                                            id="pan"
                                            onChange={(e) => handleFileUpload('pan', e)}
                                            accept="image/*,.pdf"
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    {uploadedFiles.pan ? (
                                        <div className="membership_file-preview">
                                            <span>{uploadedFiles.pan.name}</span>
                                            <button
                                                type="button"
                                                className="membership_remove-file-button"
                                                onClick={() => handleRemoveFile('pan')}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="membership_file-hint">No file chosen</div>
                                    )}
                                </div>
                            </div>

                            <div className="membership_form-group membership_full-width">
                                <label htmlFor="addressProof">Proof of Address (Max 2MB)<span className="required">*</span></label>
                                <div className="membership_file-upload-wrapper">
                                    <label className="membership_file-upload-button">
                                        <span>Choose File</span>
                                        <input
                                            type="file"
                                            id="addressProof"
                                            onChange={(e) => handleFileUpload('addressProof', e)}
                                            accept="image/*,.pdf"
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    {uploadedFiles.addressProof ? (
                                        <div className="membership_file-preview">
                                            <span>{uploadedFiles.addressProof.name}</span>
                                            <button
                                                type="button"
                                                className="membership_remove-file-button"
                                                onClick={() => handleRemoveFile('addressProof')}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="membership_file-hint">No file chosen</div>
                                    )}
                                </div>
                            </div>

                            {isMinor && (
                                <div className="membership_form-group membership_full-width">
                                    <label htmlFor="birthCertificate">Birth Certificate (Max 2MB) <span className="required">*</span></label>
                                    <div className="membership_file-upload-wrapper">
                                        <label className="membership_file-upload-button">
                                            <span>Choose File</span>
                                            <input
                                                type="file"
                                                id="birthCertificate"
                                                onChange={(e) => handleFileUpload('birthCertificate', e)}
                                                accept="image/*,.pdf"
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                        {uploadedFiles.birthCertificate ? (
                                            <div className="membership_file-preview">
                                                <span>{uploadedFiles.birthCertificate.name}</span>
                                                <button
                                                    type="button"
                                                    className="membership_remove-file-button"
                                                    onClick={() => handleRemoveFile('birthCertificate')}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="membership_file-hint">No file chosen</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {error && <div className="membership_error-message">{error}</div>}

                        <div className="membership_button-group">
                            <button
                                type="button"
                                className="membership_secondary-button"
                                onClick={() => {
                                    setStep(1);
                                    setFormData({
                                        name: "",
                                        father_name: "",
                                        mother_name: "",
                                        date_of_birth: "",
                                        gender: "",
                                        marital_status: "",
                                        full_address: "",
                                        phone_number: "",
                                        email_id: "",
                                        pan_number: "",
                                        membership_type: "",
                                        occupation: "",
                                        name_of_employer_business: "",
                                        annual_income: "",
                                        application_fee_received: "",
                                        current_house_no: "",
                                        current_street: "",
                                        current_village_city: "",
                                        current_landmark: "",
                                        current_pincode: "",
                                        current_district: "",
                                        current_state: "",
                                        current_country: "",
                                        guardian_name: "",
                                        guardian_phone_number: "",
                                        relationship: "",
                                    });
                                    setUploadedFiles({
                                        signature: null,
                                        aadhaar_front: null,
                                        aadhaar_back: null,
                                        pan: null,
                                        photo: null,
                                        addressProof: null,
                                        birthCertificate: null
                                    });
                                    setCurrentAddressVisible(false);
                                    setIsMinor(false);
                                }}
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                className="membership_primary-button"
                                onClick={() => setStep(2)}
                            >
                                Review & Submit
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="membership_form-step membership_review-step">
                        <h2>Review Your Application</h2>
                        <p className="membership_review-intro">Please review all the information before submitting your application.</p>

                        <div className="membership_review-section">
                            <h3>Personal Information</h3>
                            <div className="membership_review-grid">
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Full Name:</span>
                                    <span className="membership_review-value">{formData.name || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Father's Name:</span>
                                    <span className="membership_review-value">{formData.father_name || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Mother's Name:</span>
                                    <span className="membership_review-value">{formData.mother_name || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Date of Birth:</span>
                                    <span className="membership_review-value">{formData.date_of_birth || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Gender:</span>
                                    <span className="membership_review-value">{formData.gender || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Marital Status:</span>
                                    <span className="membership_review-value">{formData.marital_status || "Not provided"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="membership_review-section">
                            <h3>Contact Information</h3>
                            <div className="membership_review-grid">
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Address:</span>
                                    <span className="membership_review-value">{formData.full_address || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Phone Number:</span>
                                    <span className="membership_review-value">{formData.phone_number || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Email:</span>
                                    <span className="membership_review-value">{formData.email_id || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">PAN Number:</span>
                                    <span className="membership_review-value">{formData.pan_number || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Aadhaar Number:</span>
                                    <span className="membership_review-value">{formData.aadhar_number || "Not provided"}</span>
                                </div>
                            </div>
                        </div>

                        {currentAddressVisible && (
                            <div className="membership_review-section">
                                <h3>Current Address</h3>
                                <div className="membership_review-grid">
                                    <div className="membership_review-item">
                                        <span className="membership_review-label">House No:</span>
                                        <span className="membership_review-value">{formData.current_house_no || "Not provided"}</span>
                                    </div>
                                    <div className="membership_review-item">
                                        <span className="membership_review-label">Street:</span>
                                        <span className="membership_review-value">{formData.current_street || "Not provided"}</span>
                                    </div>
                                    <div className="membership_review-item">
                                        <span className="membership_review-label">City:</span>
                                        <span className="membership_review-value">{formData.current_village_city || "Not provided"}</span>
                                    </div>
                                    <div className="membership_review-item">
                                        <span className="membership_review-label">Landmark:</span>
                                        <span className="membership_review-value">{formData.current_landmark || "Not provided"}</span>
                                    </div>
                                    <div className="membership_review-item">
                                        <span className="membership_review-label">Pin Code:</span>
                                        <span className="membership_review-value">{formData.current_pincode || "Not provided"}</span>
                                    </div>
                                    <div className="membership_review-item">
                                        <span className="membership_review-label">District:</span>
                                        <span className="membership_review-value">{formData.current_district || "Not provided"}</span>
                                    </div>
                                    <div className="membership_review-item">
                                        <span className="membership_review-label">State:</span>
                                        <span className="membership_review-value">{formData.current_state || "Not provided"}</span>
                                    </div>
                                    <div className="membership_review-item">
                                        <span className="membership_review-label">Country:</span>
                                        <span className="membership_review-value">{formData.current_country || "Not provided"}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isMinor && (
                            <div className="membership_review-section">
                                <h3>Guardian Details</h3>
                                <div className="membership_review-grid">
                                    <div className="membership_review-item">
                                        <span className="membership_review-label">Guardian's Name:</span>
                                        <span className="membership_review-value">{formData.guardian_name || "Not provided"}</span>
                                    </div>
                                    <div className="membership_review-item">
                                        <span className="membership_review-label">Guardian's Phone:</span>
                                        <span className="membership_review-value">{formData.guardian_phone_number || "Not provided"}</span>
                                    </div>
                                    <div className="membership_review-item">
                                        <span className="membership_review-label">Relationship:</span>
                                        <span className="membership_review-value">{formData.relationship || "Not provided"}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="membership_review-section">
                            <h3>Membership Information</h3>
                            <div className="membership_review-grid">
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Membership Type:</span>
                                    <span className="membership_review-value">{formData.membership_type || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Occupation:</span>
                                    <span className="membership_review-value">{formData.occupation || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Employer/Business:</span>
                                    <span className="membership_review-value">{formData.name_of_employer_business || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Annual Income:</span>
                                    <span className="membership_review-value">{formData.annual_income || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Application Fee:</span>
                                    <span className="membership_review-value">{formData.application_fee_received || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Receipt Number:</span>
                                    <span className="membership_review-value">{formData.receipt_no}</span>
                                </div>
                            </div>
                        </div>

                        <div className="membership_review-section">
                            <h3>Uploaded Documents</h3>
                            <div className="membership_document-grid">
                                {uploadedFiles.photo && (
                                    <div className="membership_document-item">
                                        <div className="membership_document-preview">
                                            {uploadedFiles.photo.type.startsWith('image/') ? (
                                                <img 
                                                    src={URL.createObjectURL(uploadedFiles.photo)} 
                                                    alt="PassportPhoto"
                                                    className="membership_document-image"
                                                />
                                            ) : (
                                                <div className="membership_document-icon">📄</div>
                                            )}
                                        </div>
                                        <div className="membership_document-info">
                                            <span className="membership_document-label">Passport Photo</span>
                                            <span className="membership_document-name">{uploadedFiles.photo.name}</span>
                                        </div>
                                    </div>
                                )}

                                {uploadedFiles.signature && (
                                    <div className="membership_document-item">
                                        <div className="membership_document-preview">
                                            {uploadedFiles.signature.type.startsWith('image/') ? (
                                                <img 
                                                    src={URL.createObjectURL(uploadedFiles.signature)} 
                                                    alt="Signature"
                                                    className="membership_document-image"
                                                />
                                            ) : (
                                                <div className="membership_document-icon">📄</div>
                                            )}
                                        </div>
                                        <div className="membership_document-info">
                                            <span className="membership_document-label">Signature</span>
                                            <span className="membership_document-name">{uploadedFiles.signature.name}</span>
                                        </div>
                                    </div>
                                )}

                                {uploadedFiles.aadhaar_front && (
                                    <div className="membership_document-item">
                                        <div className="membership_document-preview">
                                            {uploadedFiles.aadhaar_front.type.startsWith('image/') ? (
                                                <img 
                                                    src={URL.createObjectURL(uploadedFiles.aadhaar_front)} 
                                                    alt="Aadhaar Front"
                                                    className="membership_document-image"
                                                />
                                            ) : (
                                                <div className="membership_document-icon">📄</div>
                                            )}
                                        </div>
                                        <div className="membership_document-info">
                                            <span className="membership_document-label">Aadhaar Front</span>
                                            <span className="membership_document-name">{uploadedFiles.aadhaar_front.name}</span>
                                        </div>
                                    </div>
                                )}

                                {uploadedFiles.aadhaar_back && (
                                    <div className="membership_document-item">
                                        <div className="membership_document-preview">
                                            {uploadedFiles.aadhaar_back.type.startsWith('image/') ? (
                                                <img 
                                                    src={URL.createObjectURL(uploadedFiles.aadhaar_back)} 
                                                    alt="Aadhaar Back"
                                                    className="membership_document-image"
                                                />
                                            ) : (
                                                <div className="membership_document-icon">📄</div>
                                            )}
                                        </div>
                                        <div className="membership_document-info">
                                            <span className="membership_document-label">Aadhaar Back</span>
                                            <span className="membership_document-name">{uploadedFiles.aadhaar_back.name}</span>
                                        </div>
                                    </div>
                                )}

                                {uploadedFiles.pan && (
                                    <div className="membership_document-item">
                                        <div className="membership_document-preview">
                                            {uploadedFiles.pan.type.startsWith('image/') ? (
                                                <img 
                                                    src={URL.createObjectURL(uploadedFiles.pan)} 
                                                    alt="PAN Card"
                                                    className="membership_document-image"
                                                />
                                            ) : (
                                                <div className="membership_document-icon">📄</div>
                                            )}
                                        </div>
                                        <div className="membership_document-info">
                                            <span className="membership_document-label">PAN Card</span>
                                            <span className="membership_document-name">{uploadedFiles.pan.name}</span>
                                        </div>
                                    </div>
                                )}

                                {uploadedFiles.addressProof && (
                                    <div className="membership_document-item">
                                        <div className="membership_document-preview">
                                            {uploadedFiles.addressProof.type.startsWith('image/') ? (
                                                <img 
                                                    src={URL.createObjectURL(uploadedFiles.addressProof)} 
                                                    alt="Address Proof"
                                                    className="membership_document-image"
                                                />
                                            ) : (
                                                <div className="membership_document-icon">📄</div>
                                            )}
                                        </div>
                                        <div className="membership_document-info">
                                            <span className="membership_document-label">Address Proof</span>
                                            <span className="membership_document-name">{uploadedFiles.addressProof.name}</span>
                                        </div>
                                    </div>
                                )}

                                {isMinor && uploadedFiles.birthCertificate && (
                                    <div className="membership_document-item">
                                        <div className="membership_document-preview">
                                            {uploadedFiles.birthCertificate.type.startsWith('image/') ? (
                                                <img 
                                                    src={URL.createObjectURL(uploadedFiles.birthCertificate)} 
                                                    alt="Birth Certificate"
                                                    className="membership_document-image"
                                                />
                                            ) : (
                                                <div className="membership_document-icon">📄</div>
                                            )}
                                        </div>
                                        <div className="membership_document-info">
                                            <span className="membership_document-label">Birth Certificate</span>
                                            <span className="membership_document-name">{uploadedFiles.birthCertificate.name}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="membership_declaration">
                            <h3>Declaration</h3>
                            <p>
                                I hereby declare that all the information provided in this form is true and correct to the best of my knowledge.
                                I understand that any false information may result in rejection of my membership application.
                            </p>
                            <div className="membership_declaration-checkbox">
                                <input type="checkbox" id="declaration" required />
                                <label htmlFor="declaration">I agree to the terms and conditions</label>
                            </div>
                        </div>

                        <div className="membership_button-group">
                            <button
                                type="button"
                                className="membership_secondary-button"
                                onClick={() => setStep(1)}
                                disabled={loading}
                            >
                                Back to Edit
                            </button>
                            <button
                                type="button"
                                className="membership_primary-button"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="membership_spinner"></span> Submitting...
                                    </>
                                ) : (
                                    "Submit Application"
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="membership_form-step membership_success-step">
                        <div className="membership_success-icon">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </div>
                        <h2>Application Submitted Successfully!</h2>
                        <div className="membership_success-message">
                            <p>Thank you for submitting your membership application.</p>
                            <p>Your application reference number is:</p>
                            <div className="membership_receipt-number">{formData.receipt_no}</div>
                            <p>We will process your application and notify you shortly.</p>
                        </div>
                        <button
                            className="membership_primary-button"
                            onClick={() => {
                                // Reset the form and start new application
                                setStep(1);
                                setFormData({
                                    name: "",
                                    father_name: "",
                                    mother_name: "",
                                    date_of_birth: "",
                                    gender: "",
                                    marital_status: "",
                                    full_address: "",
                                    phone_number: "",
                                    email_id: "",
                                    pan_number: "",
                                    membership_type: "",
                                    occupation: "",
                                    name_of_employer_business: "",
                                    annual_income: "",
                                    application_fee_received: "",
                                    current_house_no: "",
                                    current_street: "",
                                    current_village_city: "",
                                    current_landmark: "",
                                    current_pincode: "",
                                    current_district: "",
                                    current_state: "",
                                    current_country: "",
                                    guardian_name: "",
                                    guardian_phone_number: "",
                                    relationship: "",
                                    receipt_no: `LNSAA-${Math.floor(Math.random() * 10000000)}`
                                });
                                setUploadedFiles({
                                    signature: null,
                                    aadhaar_front: null,
                                    aadhaar_back: null,
                                    pan: null,
                                    photo: null,
                                    addressProof: null,
                                    birthCertificate: null
                                });
                                setCurrentAddressVisible(false);
                                setIsMinor(false);
                            }}
                        >
                            Start New Application
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MembershipOpeningForm;