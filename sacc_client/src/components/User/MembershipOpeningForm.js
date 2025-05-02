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
        aadhaarNumber: "",
        otp: "",
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
    const [userDetails, setUserDetails] = useState({
        documents_attached: []
    });
    const [currentAddressVisible, setCurrentAddressVisible] = useState(false);
    const [isMinor, setIsMinor] = useState(false);
    const token = Cookies.get('employee_token'); 
// Update the userDetails with the receipt number when step 4 renders
useEffect(() => {
    if (step === 4 && !userDetails.receipt_no) {
      setUserDetails(prev => ({
        ...prev,
        receipt_no: `LNSAA-${Math.floor(Math.random() * 10000000)}`
      }));
    }
  }, [step, userDetails.receipt_no]); // Added missing dependency

    useEffect(() => {
        if (userDetails.date_of_birth) {
            const dob = new Date(userDetails.date_of_birth);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            setIsMinor(age < 18);
        }
    }, [userDetails.date_of_birth]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleUserDetailsChange = (e) => {
        const { name, value } = e.target;
        setUserDetails({ ...userDetails, [name]: value });
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
    
            setUserDetails(prev => ({
                ...prev,
                documents_attached: Array.isArray(prev.documents_attached) 
                    ? [...new Set([...prev.documents_attached, fileType])] // Ensure no duplicates
                    : [fileType]
            }));
        }
    };

    const handleGenerateOtp = async (e) => {
        e.preventDefault();
        if (formData.aadhaarNumber.length !== 12) {
            showToast('error', "Please enter a valid 12-digit Aadhaar Number.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(apiList.AdharOtp, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ aadhaarNumber: formData.aadhaarNumber }),
            });

            const data = await response.json();
            if (data.success) {
                showToast('success', data.message);
                setStep(2);
            } else {
                showToast('error', data.message || "Failed to send OTP. Please try again.");
            }
        } catch (error) {
            console.error("Error generating OTP:", error);
            showToast('error', "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(apiList.AdharVerifyOtp, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    aadhaarNumber: formData.aadhaarNumber,
                    otp: formData.otp,
                }),
            });
        
            const data = await response.json();
            if (data.success) {
                showToast('success', data.message);
                
                // Parse date from DD-MM-YYYY format
                const parseDob = (dobString) => {
                    if (!dobString) return null;
                    const [day, month, year] = dobString.split('-');
                    return new Date(`${year}-${month}-${day}`);
                };
                
                const dobDate = parseDob(data.userDetails.date_of_birth);
                const formattedDob = dobDate ? dobDate.toISOString().split('T')[0] : "";
                
                const decryptedUserDetails = {
                    ...data.userDetails,
                    // Parse care_of field to extract name
                    father_name: data.userDetails.care_of ? 
                        data.userDetails.care_of.replace(/^(S\/O|C\/O|W\/O|D\/O)\s*/i, '') : "",
                    // Store original date for display
                    date_of_birth: data.userDetails.date_of_birth, // Keep original format
                    // Format date of birth for display (YYYY-MM-DD)
                    date_of_birth_display: formattedDob,
                    // Format gender for display
                    gender_display: data.userDetails.gender === 'M' ? 'Male' : 
                                  data.userDetails.gender === 'F' ? 'Female' : 
                                  data.userDetails.gender === 'T' ? 'Transgender' : ''
                };
                setUserDetails(decryptedUserDetails);
                setStep(3);
            } else {
                showToast('error', data.message || "Verification failed. Please try again.");
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            showToast('error', "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const formDataToSend = new FormData();
            
            // Validate all required fields before submission
            const requiredFields = [
                'name', 'date_of_birth', 'gender', 'phone_number',
                'marital_status', 'membership_type', 'occupation',
                'annual_income', 'name_of_employer_business', 'application_fee_received', 'receipt_no'
            ];
            
            const missingFields = requiredFields.filter(field => !userDetails[field]);
            
            if (missingFields.length > 0) {
                throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
            }
        
        
            if (currentAddressVisible && (
                !userDetails.current_country || !userDetails.current_district || 
                !userDetails.current_house_no || !userDetails.current_pincode || 
                !userDetails.current_state || !userDetails.current_village_city
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
    
            // Append all user details to FormData
            Object.keys(userDetails).forEach(key => {
                if (userDetails[key] !== null && userDetails[key] !== undefined) {
                    formDataToSend.append(key, userDetails[key]);
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
            formDataToSend.append('aadhaar_number', formData.aadhaarNumber);
            formDataToSend.append('has_current_address', currentAddressVisible);
            
            // Make sure to include the receipt number
            if (!userDetails.receipt_no) {
                formDataToSend.append('receipt_no', `LNSAA-${Math.floor(Math.random() * 10000000)}`);
            }
    
            const response = await fetch(apiList.SubmitForm, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend,
            });
        
            const data = await response.json();
            
            if (!response.ok) {
                // Handle backend validation errors
                if (data.missingFields) {
                    throw new Error(`Missing fields: ${data.missingFields.join(', ')}`);
                }
                throw new Error(data.message || 'Failed to submit the form.');
            }
        
            showToast('success', 'Form submitted successfully!');
            setStep(5);
            
        } catch (error) {
            console.error('Error submitting form:', error);
            showToast('error', error.message);
        } finally {
            setLoading(false);
        }
    };
    

    const renderStepIndicator = () => {
        const steps = [
            { number: 1, label: "Aadhaar Verification" },
            { number: 2, label: "OTP Verification" },
            { number: 3, label: "Personal Details" },
            { number: 4, label: "Review & Submit" }
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

    const handleRemoveFile = (fileType) => {
        setUploadedFiles(prev => ({
            ...prev,
            [fileType]: null
        }));
      
        setUserDetails(prev => ({
            ...prev,
            documents_attached: Array.isArray(prev.documents_attached) 
                ? prev.documents_attached.filter(doc => doc !== fileType)
                : []
        }));
    };

    return (
        <div>
            <EmployeeNavbar />
            <ToastContainer/>
            <div className="membership_form-container">
                {renderStepIndicator()}

                {step === 1 && (
                    <div className="membership_form-step">
                        <h2>Membership Opening Form</h2>
                        <div className="membership_form-group">
                            <label htmlFor="aadhaarNumber">Aadhaar Number</label>
                            <input
                                type="number"
                                id="aadhaarNumber"
                                name="aadhaarNumber"
                                placeholder="Enter 12-digit Aadhaar Number"
                                value={formData.aadhaarNumber}
                                onChange={handleChange}
                            />
                        </div>
                        <button 
                            className="membership_primary-button" 
                            onClick={handleGenerateOtp}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="membership_spinner"></span> Processing...
                                </>
                            ) : (
                                "Generate OTP"
                            )}
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="membership_form-step">
                        <h2>OTP Verification</h2>
                        <div className="membership_form-group">
                            <label htmlFor="otp">Enter OTP</label>
                            <input
                                type="number"
                                id="otp"
                                name="otp"
                                placeholder="Enter OTP sent to your registered mobile"
                                value={formData.otp}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="membership_button-group">
                            <button 
                                className="membership_secondary-button" 
                                onClick={() => setStep(1)}
                                disabled={loading}
                            >
                                Back
                            </button>
                            <button 
                                className="membership_primary-button" 
                                onClick={handleVerifyOtp}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="membership_spinner"></span> Verifying...
                                    </>
                                ) : (
                                    "Verify OTP"
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && userDetails && (
                    <div className="membership_form-step membership_personal-details-step">
                        <h2>Personal Details</h2>
                        
                        <div className="membership_profile-section">
                            <img
                                className="membership_profile-image"
                                src={`data:image/jpeg;base64,${userDetails.photo}`}
                                alt="User"
                            />
                        </div>

                        <div className="membership_form-grid">
                            {/* Personal Information */}
                            <div className="membership_form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={userDetails.name || ""}
                                    onChange={handleUserDetailsChange}
                                />
                            </div>

                            <div className="membership_form-group">
                                <label htmlFor="aadhaar_number">Aadhaar Number</label>
                                <input
                                    type="text"
                                    id="aadhaar_number"
                                    name="aadhaar_number"
                                    value={userDetails.aadhaar_number || ""}
                                    readOnly
                                />
                            </div>

                            <div className="membership_form-group">
    <label htmlFor="father_name">Father's Name</label>
    <input
        type="text"
        id="father_name"
        name="father_name"
        value={userDetails.father_name || ""}
        readOnly
    />
</div>

                            <div className="membership_form-group">
                                <label htmlFor="mother_name">Mother's Name</label>
                                <input
                                    type="text"
                                    id="mother_name"
                                    name="mother_name"
                                    value={userDetails.mother_name || ""}
                                    onChange={handleUserDetailsChange}
                                />
                            </div>

                            <div className="membership_form-group">
    <label htmlFor="date_of_birth">Date of Birth</label>
    <input
        type="date"
        id="date_of_birth"
        name="date_of_birth"
        value={userDetails.date_of_birth_display || ""}
        readOnly
    />
</div>

<div className="membership_form-group">
    <label htmlFor="gender">Gender</label>
    <input
        type="text"
        id="gender"
        name="gender"
        value={userDetails.gender_display || ""}
        readOnly
    />
</div>

                            <div className="membership_form-group">
                                <label htmlFor="marital_status">Marital Status</label>
                                <select
                                    id="marital_status"
                                    name="marital_status"
                                    value={userDetails.marital_status || ""}
                                    onChange={handleUserDetailsChange}
                                >
                                    <option value="">Select Marital Status</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Divorced">Divorced</option>
                                </select>
                            </div>

                            {/* Contact Information */}
                            <div className="membership_form-group">
                                <label htmlFor="full_address">Full Address</label>
                                <input
                                    type="text"
                                    id="full_address"
                                    name="full_address"
                                    value={userDetails.full_address || ""}
                                    onChange={handleUserDetailsChange}
                                />
                            </div>

                            <div className="membership_form-group">
                                <label htmlFor="phone_number">Phone Number</label>
                                <input
                                    type="text"
                                    id="phone_number"
                                    name="phone_number"
                                    value={userDetails.phone_number || ""}
                                    onChange={handleUserDetailsChange}
                                />
                            </div>

                            <div className="membership_form-group">
                                <label htmlFor="email_id">Email ID</label>
                                <input
                                    type="email"
                                    id="email_id"
                                    name="email_id"
                                    value={userDetails.email_id || ""}
                                    onChange={handleUserDetailsChange}
                                />
                            </div>

                            <div className="membership_form-group">
                                <label htmlFor="pan_number">PAN Number</label>
                                <input
                                    type="text"
                                    id="pan_number"
                                    name="pan_number"
                                    value={userDetails.pan_number || ""}
                                    onChange={handleUserDetailsChange}
                                    onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                                />
                            </div>

                            {/* Membership Type */}
                            <div className="membership_form-group">
                                <label>Membership Type</label>
                                <div className="membership_radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name="membership_type"
                                            value="Ordinary"
                                            checked={userDetails.membership_type === "Ordinary"}
                                            onChange={handleUserDetailsChange}
                                        />
                                        Ordinary
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="membership_type"
                                            value="VIP"
                                            checked={userDetails.membership_type === "VIP"}
                                            onChange={handleUserDetailsChange}
                                        />
                                        VIP
                                    </label>
                                </div>
                            </div>

                            {/* Occupation */}
                            <div className="membership_form-group">
                                <label>Occupation</label>
                                <div className="membership_radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name="occupation"
                                            value="government_employee"
                                            onChange={handleUserDetailsChange}
                                        />
                                        Government Employee
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="occupation"
                                            value="private_employee"
                                            onChange={handleUserDetailsChange}
                                        />
                                        Private Employee
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="occupation"
                                            value="self_employee"
                                            onChange={handleUserDetailsChange}
                                        />
                                        Self-Employed
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="occupation"
                                            value="Other"
                                            onChange={handleUserDetailsChange}
                                        />
                                        Other
                                    </label>
                                </div>
                            </div>

                            <div className="membership_form-group">
                                <label htmlFor="name_of_employer_business">Employer/Business Name</label>
                                <input
                                    type="text"
                                    id="employer_business"
                                    name="name_of_employer_business"
                                    onChange={handleUserDetailsChange}
                                />
                            </div>

                            <div className="membership_form-group">
                                <label htmlFor="annual_income">Annual Income</label>
                                <input
                                    type="text"
                                    id="annual_income"
                                    name="annual_income"
                                    onChange={handleUserDetailsChange}
                                />
                            </div>
                            <div className="membership_form-group">
    <label htmlFor="application_fee_received">Membership Opening Fee</label>
    <input
        type="number"
        id="application_fee_received"
        name="application_fee_received"
        value={userDetails.application_fee_received || ""}
        onChange={handleUserDetailsChange}
        required
    />
</div>



                            {/* Current Address Toggle */}
                            <div className="membership_form-group membership_full-width">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={currentAddressVisible}
                                        onChange={() => setCurrentAddressVisible(!currentAddressVisible)}
                                    />
                                    Add Current Address (if different from permanent address)
                                </label>
                            </div>

                            {/* Current Address Fields */}
                            {currentAddressVisible && (
                                <>
                                    <div className="membership_form-group">
                                        <label htmlFor="current_house_no">House No.</label>
                                        <input
                                            type="text"
                                            id="current_house_no"
                                            name="current_house_no"
                                            onChange={handleUserDetailsChange}
                                        />
                                    </div>

                                    <div className="membership_form-group">
                                        <label htmlFor="current_street">Street</label>
                                        <input
                                            type="text"
                                            id="current_street"
                                            name="current_street"
                                            onChange={handleUserDetailsChange}
                                        />
                                    </div>

                                    <div className="membership_form-group">
                                        <label htmlFor="current_village_city">Village/City</label>
                                        <input
                                            type="text"
                                            id="current_village_city"
                                            name="current_village_city"
                                            onChange={handleUserDetailsChange}
                                        />
                                    </div>

                                    <div className="membership_form-group">
                                        <label htmlFor="current_landmark">Landmark</label>
                                        <input
                                            type="text"
                                            id="current_landmark"
                                            name="current_landmark"
                                            onChange={handleUserDetailsChange}
                                        />
                                    </div>

                                    <div className="membership_form-group">
                                        <label htmlFor="current_pincode">Pin Code</label>
                                        <input
                                            type="text"
                                            id="current_pincode"
                                            name="current_pincode"
                                            onChange={handleUserDetailsChange}
                                        />
                                    </div>

                                    <div className="membership_form-group">
                                        <label htmlFor="current_district">District</label>
                                        <input
                                            type="text"
                                            id="current_district"
                                            name="current_district"
                                            onChange={handleUserDetailsChange}
                                        />
                                    </div>

                                    <div className="membership_form-group">
                                        <label htmlFor="current_state">State</label>
                                        <input
                                            type="text"
                                            id="current_state"
                                            name="current_state"
                                            onChange={handleUserDetailsChange}
                                        />
                                    </div>

                                    <div className="membership_form-group">
                                        <label htmlFor="current_country">Country</label>
                                        <input
                                            type="text"
                                            id="current_country"
                                            name="current_country"
                                            onChange={handleUserDetailsChange}
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
                                            onChange={handleUserDetailsChange}
                                        />
                                    </div>

                                    <div className="membership_form-group">
                                        <label htmlFor="guardian_phone_number">Guardian's Phone Number</label>
                                        <input
                                            type="text"
                                            id="guardian_phone_number"
                                            name="guardian_phone_number"
                                            onChange={handleUserDetailsChange}
                                        />
                                    </div>

                                    <div className="membership_form-group">
                                        <label htmlFor="relationship">Relationship with Applicant</label>
                                        <input
                                            type="text"
                                            id="relationship"
                                            name="relationship"
                                            onChange={handleUserDetailsChange}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Document Uploads */}
                            <div className="membership_form-section-title">Document Uploads</div>

                            {/* Aadhaar Card - Front & Back Separately */}
                            <div className="membership_form-group membership_full-width">
                                <label htmlFor="aadhaar_front">Aadhaar Card (Front)</label>
                                <div className="membership_file-upload-wrapper">
                                    <label className="membership_file-upload-button">
                                        Choose File
                                        <input
                                            type="file"
                                            id="aadhaar_front"
                                            onChange={(e) => handleFileUpload('aadhaar_front', e)}
                                            accept="image/*,.pdf"
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    {uploadedFiles.aadhaar_front && (
                                        <div className="membership_file-preview">
                                            {uploadedFiles.aadhaar_front.name}
                                            <button 
                                                type="button" 
                                                className="membership_remove-file-button"
                                                onClick={() => handleRemoveFile('aadhaar_front')}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            

                            <div className="membership_form-group membership_full-width">
                                <label htmlFor="aadhaar_back">Aadhaar Card (Back)</label>
                                <div className="membership_file-upload-wrapper">
                                    <label className="membership_file-upload-button">
                                        Choose File
                                        <input
                                            type="file"
                                            id="aadhaar_back"
                                            onChange={(e) => handleFileUpload('aadhaar_back', e)}
                                            accept="image/*,.pdf"
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    {uploadedFiles.aadhaar_back && (
                                        <div className="membership_file-preview">
                                            {uploadedFiles.aadhaar_back.name}
                                            <button 
                                                type="button" 
                                                className="membership_remove-file-button"
                                                onClick={() => handleRemoveFile('aadhaar_back')}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* PAN Card */}
                            <div className="membership_form-group membership_full-width">
                                <label htmlFor="pan_file">PAN Card</label>
                                <div className="membership_file-upload-wrapper">
                                    <label className="membership_file-upload-button">
                                        Choose File
                                        <input
                                            type="file"
                                            id="pan_file"
                                            onChange={(e) => handleFileUpload('pan', e)}
                                            accept="image/*,.pdf"
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    {uploadedFiles.pan && (
                                        <div className="membership_file-preview">
                                            {uploadedFiles.pan.name}
                                            <button 
                                                type="button" 
                                                className="membership_remove-file-button"
                                                onClick={() => handleRemoveFile('pan')}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Photo */}
                            <div className="membership_form-group membership_full-width">
                                <label htmlFor="photo_file">Passport Size Photo</label>
                                <div className="membership_file-upload-wrapper">
                                    <label className="membership_file-upload-button">
                                        Choose File
                                        <input
                                            type="file"
                                            id="photo_file"
                                            onChange={(e) => handleFileUpload('photo', e)}
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    {uploadedFiles.photo && (
                                        <div className="membership_file-preview">
                                            {uploadedFiles.photo.name}
                                            <button 
                                                type="button" 
                                                className="membership_remove-file-button"
                                                onClick={() => handleRemoveFile('photo')}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Address Proof */}
                            <div className="membership_form-group membership_full-width">
                                <label htmlFor="address_proof_file">Proof of Address</label>
                                <div className="membership_file-upload-wrapper">
                                    <label className="membership_file-upload-button">
                                        Choose File
                                        <input
                                            type="file"
                                            id="address_proof_file"
                                            onChange={(e) => handleFileUpload('addressProof', e)}
                                            accept="image/*,.pdf"
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    {uploadedFiles.addressProof && (
                                        <div className="membership_file-preview">
                                            {uploadedFiles.addressProof.name}
                                            <button 
                                                type="button" 
                                                className="membership_remove-file-button"
                                                onClick={() => handleRemoveFile('addressProof')}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Birth Certificate (for minors) */}
                            {isMinor && (
                                <div className="membership_form-group membership_full-width">
                                    <label htmlFor="birth_certificate_file">Birth Certificate</label>
                                    <div className="membership_file-upload-wrapper">
                                        <label className="membership_file-upload-button">
                                            Choose File
                                            <input
                                                type="file"
                                                id="birth_certificate_file"
                                                onChange={(e) => handleFileUpload('birthCertificate', e)}
                                                accept="image/*,.pdf"
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                        {uploadedFiles.birthCertificate && (
                                            <div className="membership_file-preview">
                                                {uploadedFiles.birthCertificate.name}
                                                <button 
                                                    type="button" 
                                                    className="membership_remove-file-button"
                                                    onClick={() => handleRemoveFile('birthCertificate')}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Signature */}
                            <div className="membership_form-group membership_full-width">
                                <label htmlFor="signature_file">Signature</label>
                                <div className="membership_file-upload-wrapper">
                                    <label className="membership_file-upload-button">
                                        Choose File
                                        <input
                                            type="file"
                                            id="signature_file"
                                            onChange={(e) => handleFileUpload('signature', e)}
                                            accept="image/*,.pdf"
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    {uploadedFiles.signature && (
                                        <div className="membership_file-preview">
                                            {uploadedFiles.signature.name}
                                            <button 
                                                type="button" 
                                                className="membership_remove-file-button"
                                                onClick={() => handleRemoveFile('signature')}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {error && <div className="membership_error-message">{error}</div>}

                        <div className="membership_button-group">
                            <button 
                                className="membership_secondary-button" 
                                onClick={() => setStep(2)}
                                disabled={loading}
                            >
                                Back
                            </button>
                            <button 
                                className="membership_primary-button" 
                                onClick={() => setStep(4)}
                                disabled={loading}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="membership_form-step membership_review-step">
                        <h2>Review Your Details</h2>
                        
                        <div className="membership_review-section">
                            <h3>Personal Information</h3>
                            <div className="membership_review-grid">
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Full Name:</span>
                                    <span className="membership_review-value">{userDetails.name || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Aadhaar Number:</span>
                                    <span className="membership_review-value">{userDetails.aadhaar_number || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Father's Name:</span>
                                    <span className="membership_review-value">{userDetails.father_name || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Mother's Name:</span>
                                    <span className="membership_review-value">{userDetails.mother_name || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Date of Birth:</span>
                                    <span className="membership_review-value">{userDetails.date_of_birth || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Gender:</span>
                                    <span className="membership_review-value">{userDetails.gender || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Marital Status:</span>
                                    <span className="membership_review-value">{userDetails.marital_status || "Not provided"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="membership_review-section">
                            <h3>Contact Information</h3>
                            <div className="membership_review-grid">
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Address:</span>
                                    <span className="membership_review-value">{userDetails.full_address || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Phone Number:</span>
                                    <span className="membership_review-value">{userDetails.phone_number || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Email:</span>
                                    <span className="membership_review-value">{userDetails.email_id || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">PAN Number:</span>
                                    <span className="membership_review-value">{userDetails.pan_number || "Not provided"}</span>
                                </div>
                            </div>
                        </div>

                        {currentAddressVisible && (
                            <div className="membership_review-section">
                                <h3>Current Address</h3>
                                <div className="membership_review-grid">
                                    <div className="membership_review-item">
                                        <span className="membership_review-label">House No:</span>
                                        <span className="membership_review-value">{userDetails.current_house_no || "Not provided"}</span>
                                    </div>
                                    <div className="membership_review-item">
                                        <span className="membership_review-label">Street:</span>
                                        <span className="membership_review-value">{userDetails.current_street || "Not provided"}</span>
                                    </div>
                                    <div className="membership_review-item">
                                        <span className="membership_review-label">City:</span>
                                        <span className="membership_review-value">{userDetails.current_village_city || "Not provided"}</span>
                                    </div>
                                    <div className="membership_review-item">
                                        <span className="membership_review-label">Landmark:</span>
                                        <span className="membership_review-value">{userDetails.current_landmark || "Not provided"}</span>
                                    </div>
                                    <div className="membership_review-item">
                                        <span className="membership_review-label">Pin Code:</span>
                                        <span className="membership_review-value">{userDetails.current_pincode || "Not provided"}</span>
                                    </div>
                                    <div className="membership_review-item">
                                        <span className="membership_review-label">District:</span>
                                        <span className="membership_review-value">{userDetails.current_district || "Not provided"}</span>
                                    </div>
                                    <div className="membership_review-item">
                                        <span className="membership_review-label">State:</span>
                                        <span className="membership_review-value">{userDetails.current_state || "Not provided"}</span>
                                    </div>
                                    <div className="membership_review-item">
                                        <span className="membership_review-label">Country:</span>
                                        <span className="membership_review-value">{userDetails.current_country || "Not provided"}</span>
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
                                        <span className="membership_review-value">{userDetails.guardian_name || "Not provided"}</span>
                                    </div>
                                    <div className="membership_review-item">
                                        <span className="membership_review-label">Guardian's Phone:</span>
                                        <span className="membership_review-value">{userDetails.guardian_phone_number || "Not provided"}</span>
                                    </div>
                                    <div className="membership_review-item">
                                        <span className="membership_review-label">Relationship:</span>
                                        <span className="membership_review-value">{userDetails.relationship || "Not provided"}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="membership_review-section">
                            <h3>Membership Details</h3>
                            <div className="membership_review-grid">
                            <div className="membership_review-item">
      <span className="membership_review-label">Receipt Number:</span>
      <span className="membership_review-value">{userDetails.receipt_no}</span>
    </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Membership Type:</span>
                                    <span className="membership_review-value">{userDetails.membership_type || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Occupation:</span>
                                    <span className="membership_review-value">{userDetails.occupation || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Employer/Business:</span>
                                    <span className="membership_review-value">{userDetails.employer_business || "Not provided"}</span>
                                </div>
                                <div className="membership_review-item">
                                    <span className="membership_review-label">Annual Income:</span>
                                    <span className="membership_review-value">{userDetails.annual_income || "Not provided"}</span>
                                </div>
                            </div>
                        </div>
                     

                        <div className="membership_review-section">
                            <h3>Uploaded Documents</h3>
                            <div className="membership_document-list">
                                {uploadedFiles.aadhaar_front && (
                                    <div className="membership_document-item">
                                        <span className="membership_document-label">Aadhaar Card (Front):</span>
                                        <span className="membership_document-value">{uploadedFiles.aadhaar_front.name}</span>
                                    </div>
                                )}
                                {uploadedFiles.aadhaar_back && (
                                    <div className="membership_document-item">
                                        <span className="membership_document-label">Aadhaar Card (Back):</span>
                                        <span className="membership_document-value">{uploadedFiles.aadhaar_back.name}</span>
                                    </div>
                                )}
                                {uploadedFiles.pan && (
                                    <div className="membership_document-item">
                                        <span className="membership_document-label">PAN Card:</span>
                                        <span className="membership_document-value">{uploadedFiles.pan.name}</span>
                                    </div>
                                )}
                                {uploadedFiles.photo && (
                                    <div className="membership_document-item">
                                        <span className="membership_document-label">Passport Photo:</span>
                                        <span className="membership_document-value">{uploadedFiles.photo.name}</span>
                                    </div>
                                )}
                                {uploadedFiles.addressProof && (
                                    <div className="membership_document-item">
                                        <span className="membership_document-label">Address Proof:</span>
                                        <span className="membership_document-value">{uploadedFiles.addressProof.name}</span>
                                    </div>
                                )}
                                {isMinor && uploadedFiles.birthCertificate && (
                                    <div className="membership_document-item">
                                        <span className="membership_document-label">Birth Certificate:</span>
                                        <span className="membership_document-value">{uploadedFiles.birthCertificate.name}</span>
                                    </div>
                                )}
                                {uploadedFiles.signature && (
                                    <div className="membership_document-item">
                                        <span className="membership_document-label">Signature:</span>
                                        <span className="membership_document-value">{uploadedFiles.signature.name}</span>
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
                                className="membership_secondary-button" 
                                onClick={() => setStep(3)}
                                disabled={loading}
                            >
                                Back
                            </button>
                            <button 
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

                {step === 5 && (
                    <div className="membership_form-step membership_success-step">
                        <div className="membership_success-icon">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </div>
                        <h2>Application Submitted Successfully!</h2>
                        <p>Your membership application has been received. We will process your application and notify you shortly.</p>
                        <p>Your application reference number is: <strong>LNSAA-{Math.floor(Math.random() * 10000000)}</strong></p>
                        <button 
                            className="membership_primary-button" 
                            onClick={() => {
                                setStep(1);
                                setFormData({ aadhaarNumber: "", otp: "" });
                                setUploadedFiles({
                                    signature: null,
                                    aadhaar_front: null,
                                    aadhaar_back: null,
                                    pan: null,
                                    photo: null,
                                    addressProof: null,
                                    birthCertificate: null
                                });
                                setUserDetails({ documents_attached: [] });
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