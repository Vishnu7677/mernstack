import React, { useState, useEffect } from "react";
import apiList from "../../../lib/apiList";
import "./TWgoldAccountOpeningForm.css";
import TwgoldEmployeeNav from "./TwgoldEmployeeNav";
import { ToastContainer } from 'react-toastify';
import showToast from "../../Toast";
import Cookies from "js-cookie";

const TWgoldAccountOpeningForm = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [aadhaarLoading, setAadhaarLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [verificationStep, setVerificationStep] = useState('aadhaar_input'); // aadhaar_input, otp_verification, details_form
    
    const [aadhaarData, setAadhaarData] = useState({
        aadhaarNumber: "",
        otp: "",
        reference_id: "",
        verificationStatus: 'pending'
    });
    
    const [formData, setFormData] = useState({
        // Basic Information
        name: "",
        email: "",
        phone: "",
        
        // Aadhaar Details (pre-filled from verification)
        aadhaarDetails: {
            aadhaar_hash: "",
            aadhaar_number: "",
            name_on_aadhaar: "",
            care_of: "",
            father_name: "",
            mother_name: "",
            dob: "",
            year_of_birth: "",
            gender: "",
            full_address: "",
            photo_base64: "",
            is_otp_verified: false,
            reference_id: "",
            timestamp: "",
            raw_response: {}
        },
        
        // Personal Information
        personalInfo: {
            fatherName: "",
            motherName: "",
            spouseName: "",
            bloodGroup: "",
            maritalStatus: "",
            permanentAddress: {},
            currentAddress: {},
            emergencyContact: {
                name: "",
                relationship: "",
                phone: "",
                address: ""
            }
        },
        
        // Address (legacy)
        address: {
            street: "",
            city: "",
            state: "",
            pincode: "",
            country: "India"
        },
        
        // Employment & Financial Details
        occupation: "",
        monthlyIncome: "",
        
        // Credit Information
        creditScore: "",
        existingLoans: "",
        
        // Documents
        documents: {
            aadhaarCard: { uploaded: false, url: "", verified: false },
            panCard: { uploaded: false, url: "", verified: false },
            addressProof: { uploaded: false, url: "", verified: false },
            incomeProof: { uploaded: false, url: "", verified: false },
            photo: { uploaded: false, url: "" },
            signature: { uploaded: false, url: "" }
        },
        
        // References
        references: [],
        
        // Banking Details
        bankDetails: {
            accountHolderName: "",
            bankName: "",
            accountNumber: "",
            ifscCode: "",
            branchName: "",
            accountType: ""
        },
        
        // Status & Verification
        status: "under_verification",
        isKycVerified: false,
        isAadhaarVerified: false,
        isPhoneVerified: false,
        isEmailVerified: false,
        
        // Risk Assessment
        riskCategory: "unknown",
        riskScore: 0,
        
        // Generated IDs
        customerId: "",
        accountNumber: "",
        
        // Temporary reference
        referenceNumber: `TWGL${Math.floor(Math.random() * 1000000)}`
    });
    
    const [uploadedFiles, setUploadedFiles] = useState({
        pan: null,
        addressProof: null,
        incomeProof: null,
        photo: null,
        signature: null
    });
    
    const [error, setError] = useState('');
    const [currentAddressVisible, setCurrentAddressVisible] = useState(false);
    const [showEmergencyContact, setShowEmergencyContact] = useState(false);
    const [branchOptions, setBranchOptions] = useState([]);
    const [primaryBranch, setPrimaryBranch] = useState("");
    
    // New KYC Verification Checkboxes
    const [kycVerifications, setKycVerifications] = useState({
        isAadhaarVerified: false,
        isPhoneVerified: false,
        isEmailVerified: false,
        isPanVerified: false,
        isAddressVerified: false,
        isIncomeVerified: false
    });
    
    const token = Cookies.get('employee_token');
    const userData = JSON.parse(Cookies.get('employee_data') || '{}');

    // Fetch branch options on component mount
    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const response = await fetch(apiList.branches, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success && data.branches) {
                setBranchOptions(data.branches);
                if (data.branches.length > 0) {
                    setPrimaryBranch(data.branches[0]._id);
                }
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
            showToast('error', 'Failed to load branches');
        }
    };

    // Handle KYC verification checkbox changes
    const handleKycVerificationChange = (field, value) => {
        setKycVerifications(prev => ({
            ...prev,
            [field]: value
        }));

        // Update formData based on KYC verifications
        if (field === 'isAadhaarVerified') {
            setFormData(prev => ({
                ...prev,
                isAadhaarVerified: value
            }));
        } else if (field === 'isPhoneVerified') {
            setFormData(prev => ({
                ...prev,
                isPhoneVerified: value
            }));
        } else if (field === 'isEmailVerified') {
            setFormData(prev => ({
                ...prev,
                isEmailVerified: value
            }));
        } else if (field === 'isPanVerified') {
            setFormData(prev => ({
                ...prev,
                documents: {
                    ...prev.documents,
                    panCard: {
                        ...prev.documents.panCard,
                        verified: value
                    }
                }
            }));
        } else if (field === 'isAddressVerified') {
            setFormData(prev => ({
                ...prev,
                documents: {
                    ...prev.documents,
                    addressProof: {
                        ...prev.documents.addressProof,
                        verified: value
                    }
                }
            }));
        } else if (field === 'isIncomeVerified') {
            setFormData(prev => ({
                ...prev,
                documents: {
                    ...prev.documents,
                    incomeProof: {
                        ...prev.documents.incomeProof,
                        verified: value
                    }
                }
            }));
        }
    };

    // Update isKycVerified based on other verification statuses
    useEffect(() => {
        const allVerified = 
            kycVerifications.isAadhaarVerified &&
            kycVerifications.isPhoneVerified &&
            kycVerifications.isEmailVerified &&
            kycVerifications.isPanVerified &&
            kycVerifications.isAddressVerified;

        setFormData(prev => ({
            ...prev,
            isKycVerified: allVerified,
            status: allVerified ? 'active' : 'under_verification'
        }));
    }, [kycVerifications]);

    // Step 1: Aadhaar Verification Functions
    const handleAadhaarInput = async (e) => {
        e.preventDefault();
        setAadhaarLoading(true);
        setError('');

        try {
            // Validate Aadhaar number
            const aadhaarRegex = /^\d{12}$/;
            if (!aadhaarRegex.test(aadhaarData.aadhaarNumber)) {
                throw new Error('Please enter a valid 12-digit Aadhaar number');
            }

            // Call Aadhaar OTP API
            const response = await fetch(apiList.aadhaarSendOTP, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ aadhaar_number: aadhaarData.aadhaarNumber })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send OTP');
            }

            // Store reference_id for verification
            setAadhaarData(prev => ({
                ...prev,
                reference_id: data.reference_id,
                verificationStatus: 'otp_sent'
            }));

            setVerificationStep('otp_verification');
            showToast('success', 'OTP sent successfully to registered mobile number');

        } catch (error) {
            console.error('Aadhaar OTP error:', error);
            showToast('error', error.message);
        } finally {
            setAadhaarLoading(false);
        }
    };

    const handleOTPVerification = async (e) => {
        e.preventDefault();
        setOtpLoading(true);
        setError('');

        try {
            // Validate OTP
            if (!aadhaarData.otp || aadhaarData.otp.length !== 6) {
                throw new Error('Please enter a valid 6-digit OTP');
            }

            // Call Aadhaar OTP verification API
            const response = await fetch(apiList.aadhaarVerifyOTP, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    otp: aadhaarData.otp,
                    reference_id: aadhaarData.reference_id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'OTP verification failed');
            }

            // Update aadhaar data with verified information
            setAadhaarData(prev => ({
                ...prev,
                verificationStatus: 'verified',
                ...data.aadhaarData
            }));

            // Pre-fill form data from Aadhaar verification
            setFormData(prev => ({
                ...prev,
                name: data.aadhaarData.name || "",
                phone: data.aadhaarData.phone || "",
                aadhaarDetails: {
                    ...prev.aadhaarDetails,
                    aadhaar_hash: data.aadhaarData.aadhaar_hash || "",
                    aadhaar_number: data.aadhaarData.aadhaar_number || "",
                    name_on_aadhaar: data.aadhaarData.name || "",
                    care_of: data.aadhaarData.care_of || "",
                    father_name: data.aadhaarData.father_name || "",
                    mother_name: data.aadhaarData.mother_name || "",
                    dob: data.aadhaarData.dob || "",
                    year_of_birth: data.aadhaarData.year_of_birth || "",
                    gender: data.aadhaarData.gender || "",
                    full_address: data.aadhaarData.full_address || "",
                    photo_base64: data.aadhaarData.photo_base64 || "",
                    is_otp_verified: true,
                    reference_id: data.reference_id || "",
                    timestamp: Date.now(),
                    raw_response: data
                },
                personalInfo: {
                    ...prev.personalInfo,
                    fatherName: data.aadhaarData.father_name || "",
                    motherName: data.aadhaarData.mother_name || ""
                },
                address: {
                    ...prev.address,
                    street: data.aadhaarData.full_address || "",
                    city: "",
                    state: "",
                    pincode: "",
                    country: "India"
                },
                isAadhaarVerified: true
            }));

            // Automatically check Aadhaar verified when OTP is verified
            handleKycVerificationChange('isAadhaarVerified', true);

            // Generate customer ID and account number
            const customerSequence = await getNextSequence('customer_id');
            const accountSequence = await getNextSequence('account_number');
            
            setFormData(prev => ({
                ...prev,
                customerId: `TWGL${String(customerSequence).padStart(6, '0')}`,
                accountNumber: `101712${String(accountSequence).padStart(6, '0')}`
            }));

            setVerificationStep('details_form');
            showToast('success', 'Aadhaar verified successfully!');

        } catch (error) {
            console.error('OTP verification error:', error);
            showToast('error', error.message);
        } finally {
            setOtpLoading(false);
        }
    };

    const getNextSequence = async (sequenceName) => {
        try {
            const response = await fetch(`${apiList.getSequence}?name=${sequenceName}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            return data.sequence || 1;
        } catch (error) {
            console.error('Error getting sequence:', error);
            return 1;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Handle nested form data
        if (name.includes('.')) {
            const [parent, child, subChild] = name.split('.');
            
            if (subChild) {
                // Three levels deep (e.g., personalInfo.emergencyContact.name)
                setFormData(prev => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: {
                            ...prev[parent][child],
                            [subChild]: value
                        }
                    }
                }));
            } else {
                // Two levels deep
                setFormData(prev => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value
                    }
                }));
            }
        } else if (name.includes('_')) {
            // Handle address fields
            const [fieldType, fieldName] = name.split('_');
            if (fieldType === 'address') {
                setFormData(prev => ({
                    ...prev,
                    address: {
                        ...prev.address,
                        [fieldName]: value
                    }
                }));
            }
        } else {
            // Top level fields
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
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

            // Update form data documents status
            const docMapping = {
                'pan': 'panCard',
                'addressProof': 'addressProof',
                'incomeProof': 'incomeProof',
                'photo': 'photo',
                'signature': 'signature'
            };

            if (docMapping[fileType]) {
                setFormData(prev => ({
                    ...prev,
                    documents: {
                        ...prev.documents,
                        [docMapping[fileType]]: {
                            ...prev.documents[docMapping[fileType]],
                            uploaded: true
                        }
                    }
                }));
            }
        }
    };

    const handleRemoveFile = (fileType) => {
        setUploadedFiles(prev => ({
            ...prev,
            [fileType]: null
        }));

        // Update form data documents status
        const docMapping = {
            'pan': 'panCard',
            'addressProof': 'addressProof',
            'incomeProof': 'incomeProof',
            'photo': 'photo',
            'signature': 'signature'
        };

        if (docMapping[fileType]) {
            setFormData(prev => ({
                ...prev,
                documents: {
                    ...prev.documents,
                    [docMapping[fileType]]: {
                        ...prev.documents[docMapping[fileType]],
                        uploaded: false,
                        url: "",
                        verified: false
                    }
                }
            }));

            // Also uncheck the verification checkbox
            if (fileType === 'pan') {
                handleKycVerificationChange('isPanVerified', false);
            } else if (fileType === 'addressProof') {
                handleKycVerificationChange('isAddressVerified', false);
            } else if (fileType === 'incomeProof') {
                handleKycVerificationChange('isIncomeVerified', false);
            }
        }
    };

    const addReference = () => {
        setFormData(prev => ({
            ...prev,
            references: [
                ...prev.references,
                { name: "", relationship: "", contact: "", address: "" }
            ]
        }));
    };

    const removeReference = (index) => {
        setFormData(prev => ({
            ...prev,
            references: prev.references.filter((_, i) => i !== index)
        }));
    };

    const updateReference = (index, field, value) => {
        setFormData(prev => {
            const updatedReferences = [...prev.references];
            updatedReferences[index] = {
                ...updatedReferences[index],
                [field]: value
            };
            return {
                ...prev,
                references: updatedReferences
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields
            const requiredFields = [
                'name', 'email', 'phone', 'occupation', 'monthlyIncome',
                'primaryBranch'
            ];

            const missingFields = requiredFields.filter(field => {
                if (field === 'primaryBranch') return !primaryBranch;
                return !formData[field];
            });

            if (missingFields.length > 0) {
                throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
            }

            // Validate documents
            const requiredDocs = ['pan', 'addressProof', 'photo', 'signature'];
            const missingDocs = requiredDocs.filter(doc => !uploadedFiles[doc]);
            if (missingDocs.length > 0) {
                throw new Error(`Please upload all required documents: ${missingDocs.join(', ')}`);
            }

            // Prepare form data
            const formDataToSend = new FormData();

            // Append form data
            const customerData = {
                ...formData,
                primaryBranch: primaryBranch,
                createdBy: userData._id,
                updatedBy: userData._id,
                lastVerifiedBy: userData._id,
                lastVerifiedAt: new Date().toISOString()
            };

            // Remove temporary fields
            delete customerData.referenceNumber;

            formDataToSend.append('customerData', JSON.stringify(customerData));

            // Append uploaded files
            Object.keys(uploadedFiles).forEach(key => {
                if (uploadedFiles[key]) {
                    formDataToSend.append(key, uploadedFiles[key]);
                }
            });

            // Submit to API
            const response = await fetch(apiList.createCustomer, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create customer account');
            }

            showToast('success', 'Customer account created successfully!');
            setStep(4); // Move to success step

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
            { number: 2, label: "Customer Details" },
            { number: 3, label: "KYC Verification" },
            { number: 4, label: "Review & Submit" }
        ];

        return (
            <div className="account-step-indicator">
                {steps.map((item) => (
                    <div
                        key={item.number}
                        className={`account-step ${step === item.number ? "account-active" : ""} ${step > item.number ? "account-completed" : ""}`}
                    >
                        <div className="account-step-number">{item.number}</div>
                        <div className="account-step-label">{item.label}</div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div>
            <TwgoldEmployeeNav />
            <ToastContainer />
            <div className="account-form-container">
                {renderStepIndicator()}

                {step === 1 && (
                    <div className="account-form-step account-verification-step">
                        <h2>Customer Account Opening</h2>
                        <p className="account-form-intro">Start by verifying customer's Aadhaar details</p>

                        {verificationStep === 'aadhaar_input' && (
                            <div className="aadhaar-verification-section">
                                <h3>Aadhaar Verification</h3>
                                <form onSubmit={handleAadhaarInput}>
                                    <div className="account-form-group">
                                        <label htmlFor="aadhaarNumber">Enter Aadhaar Number <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            id="aadhaarNumber"
                                            name="aadhaarNumber"
                                            value={aadhaarData.aadhaarNumber}
                                            onChange={(e) => setAadhaarData(prev => ({...prev, aadhaarNumber: e.target.value}))}
                                            placeholder="Enter 12-digit Aadhaar number"
                                            required
                                            maxLength="12"
                                            pattern="\d{12}"
                                        />
                                        <small className="form-hint">Enter the 12-digit Aadhaar number without spaces</small>
                                    </div>

                                    <div className="account-button-group">
                                        <button
                                            type="submit"
                                            className="account-primary-button"
                                            disabled={aadhaarLoading}
                                        >
                                            {aadhaarLoading ? (
                                                <>
                                                    <span className="account-spinner"></span> Sending OTP...
                                                </>
                                            ) : (
                                                "Send OTP"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {verificationStep === 'otp_verification' && (
                            <div className="otp-verification-section">
                                <h3>Verify OTP</h3>
                                <p className="verification-info">
                                    OTP has been sent to the mobile number registered with Aadhaar.
                                    Please enter the 6-digit OTP below.
                                </p>
                                
                                <form onSubmit={handleOTPVerification}>
                                    <div className="account-form-group">
                                        <label htmlFor="otp">Enter OTP <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            id="otp"
                                            name="otp"
                                            value={aadhaarData.otp}
                                            onChange={(e) => setAadhaarData(prev => ({...prev, otp: e.target.value}))}
                                            placeholder="Enter 6-digit OTP"
                                            required
                                            maxLength="6"
                                            pattern="\d{6}"
                                        />
                                        <small className="form-hint">Enter the 6-digit OTP received on registered mobile</small>
                                    </div>

                                    <div className="account-button-group">
                                        <button
                                            type="button"
                                            className="account-secondary-button"
                                            onClick={() => setVerificationStep('aadhaar_input')}
                                            disabled={otpLoading}
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            className="account-primary-button"
                                            disabled={otpLoading}
                                        >
                                            {otpLoading ? (
                                                <>
                                                    <span className="account-spinner"></span> Verifying...
                                                </>
                                            ) : (
                                                "Verify OTP"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {verificationStep === 'details_form' && (
                            <div className="verification-success-section">
                                <div className="verification-success-icon">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                    </svg>
                                </div>
                                <h3>Aadhaar Verified Successfully!</h3>
                                <p className="verification-details">
                                    Aadhaar Number: {aadhaarData.aadhaarNumber}<br/>
                                    Name: {formData.name}<br/>
                                    Customer ID: {formData.customerId}<br/>
                                    Account Number: {formData.accountNumber}
                                </p>
                                
                                <div className="account-button-group">
                                    <button
                                        type="button"
                                        className="account-secondary-button"
                                        onClick={() => {
                                            setVerificationStep('aadhaar_input');
                                            setAadhaarData({
                                                aadhaarNumber: "",
                                                otp: "",
                                                reference_id: "",
                                                verificationStatus: 'pending'
                                            });
                                        }}
                                    >
                                        Verify Another Aadhaar
                                    </button>
                                    <button
                                        type="button"
                                        className="account-primary-button"
                                        onClick={() => setStep(2)}
                                    >
                                        Continue to Customer Details
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <div className="account-form-step account-details-step">
                        <h2>Customer Details</h2>
                        <p className="account-form-intro">Fill in the customer details below</p>

                        <div className="account-form-grid">
                            {/* Basic Information */}
                            <div className="account-form-section-title">Basic Information</div>

                            <div className="account-form-group">
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

                            <div className="account-form-group">
                                <label htmlFor="email">Email <span className="required">*</span></label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="account-form-group">
                                <label htmlFor="phone">Phone Number <span className="required">*</span></label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Branch Selection */}
                            <div className="account-form-group">
                                <label htmlFor="primaryBranch">Primary Branch <span className="required">*</span></label>
                                <select
                                    id="primaryBranch"
                                    value={primaryBranch}
                                    onChange={(e) => setPrimaryBranch(e.target.value)}
                                    required
                                >
                                    <option value="">Select Branch</option>
                                    {branchOptions.map(branch => (
                                        <option key={branch._id} value={branch._id}>
                                            {branch.branchName} - {branch.branchCode}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Personal Information */}
                            <div className="account-form-section-title">Personal Information</div>

                            <div className="account-form-group">
                                <label htmlFor="personalInfo.fatherName">Father's Name</label>
                                <input
                                    type="text"
                                    id="personalInfo.fatherName"
                                    name="personalInfo.fatherName"
                                    value={formData.personalInfo.fatherName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="account-form-group">
                                <label htmlFor="personalInfo.motherName">Mother's Name</label>
                                <input
                                    type="text"
                                    id="personalInfo.motherName"
                                    name="personalInfo.motherName"
                                    value={formData.personalInfo.motherName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="account-form-group">
                                <label htmlFor="personalInfo.spouseName">Spouse Name</label>
                                <input
                                    type="text"
                                    id="personalInfo.spouseName"
                                    name="personalInfo.spouseName"
                                    value={formData.personalInfo.spouseName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="account-form-group">
                                <label htmlFor="personalInfo.bloodGroup">Blood Group</label>
                                <select
                                    id="personalInfo.bloodGroup"
                                    name="personalInfo.bloodGroup"
                                    value={formData.personalInfo.bloodGroup}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Blood Group</option>
                                    <option value="A+">A+</option>
                                    <option value="A">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>

                            <div className="account-form-group">
                                <label htmlFor="personalInfo.maritalStatus">Marital Status</label>
                                <select
                                    id="personalInfo.maritalStatus"
                                    name="personalInfo.maritalStatus"
                                    value={formData.personalInfo.maritalStatus}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Status</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Divorced">Divorced</option>
                                    <option value="Widowed">Widowed</option>
                                </select>
                            </div>

                            {/* Address Information */}
                            <div className="account-form-section-title">Address Information</div>

                            <div className="account-form-group">
                                <label htmlFor="address_street">Street</label>
                                <input
                                    type="text"
                                    id="address_street"
                                    name="address_street"
                                    value={formData.address.street}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="account-form-group">
                                <label htmlFor="address_city">City</label>
                                <input
                                    type="text"
                                    id="address_city"
                                    name="address_city"
                                    value={formData.address.city}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="account-form-group">
                                <label htmlFor="address_state">State</label>
                                <input
                                    type="text"
                                    id="address_state"
                                    name="address_state"
                                    value={formData.address.state}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="account-form-group">
                                <label htmlFor="address_pincode">Pincode</label>
                                <input
                                    type="text"
                                    id="address_pincode"
                                    name="address_pincode"
                                    value={formData.address.pincode}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="account-form-group">
                                <label htmlFor="address_country">Country</label>
                                <input
                                    type="text"
                                    id="address_country"
                                    name="address_country"
                                    value={formData.address.country}
                                    onChange={handleChange}
                                    disabled
                                />
                            </div>

                            {/* Current Address Toggle */}
                            <div className="account-form-group account-full-width">
                                <label className="account-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={currentAddressVisible}
                                        onChange={() => setCurrentAddressVisible(!currentAddressVisible)}
                                    />
                                    <span className="account-checkbox-custom"></span>
                                    Add Current Address (if different from permanent)
                                </label>
                            </div>

                            {/* Current Address Fields */}
                            {currentAddressVisible && (
                                <>
                                    <div className="account-form-group">
                                        <label htmlFor="currentAddress_street">Current Street</label>
                                        <input
                                            type="text"
                                            id="currentAddress_street"
                                            name="currentAddress_street"
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                personalInfo: {
                                                    ...prev.personalInfo,
                                                    currentAddress: {
                                                        ...prev.personalInfo.currentAddress,
                                                        street: e.target.value
                                                    }
                                                }
                                            }))}
                                        />
                                    </div>

                                    <div className="account-form-group">
                                        <label htmlFor="currentAddress_city">Current City</label>
                                        <input
                                            type="text"
                                            id="currentAddress_city"
                                            name="currentAddress_city"
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                personalInfo: {
                                                    ...prev.personalInfo,
                                                    currentAddress: {
                                                        ...prev.personalInfo.currentAddress,
                                                        city: e.target.value
                                                    }
                                                }
                                            }))}
                                        />
                                    </div>

                                    <div className="account-form-group">
                                        <label htmlFor="currentAddress_pincode">Current Pincode</label>
                                        <input
                                            type="text"
                                            id="currentAddress_pincode"
                                            name="currentAddress_pincode"
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                personalInfo: {
                                                    ...prev.personalInfo,
                                                    currentAddress: {
                                                        ...prev.personalInfo.currentAddress,
                                                        pincode: e.target.value
                                                    }
                                                }
                                            }))}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Emergency Contact Toggle */}
                            <div className="account-form-group account-full-width">
                                <label className="account-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={showEmergencyContact}
                                        onChange={() => setShowEmergencyContact(!showEmergencyContact)}
                                    />
                                    <span className="account-checkbox-custom"></span>
                                    Add Emergency Contact
                                </label>
                            </div>

                            {/* Emergency Contact Fields */}
                            {showEmergencyContact && (
                                <>
                                    <div className="account-form-group">
                                        <label htmlFor="emergency_name">Emergency Contact Name</label>
                                        <input
                                            type="text"
                                            id="emergency_name"
                                            name="personalInfo.emergencyContact.name"
                                            value={formData.personalInfo.emergencyContact.name}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="account-form-group">
                                        <label htmlFor="emergency_relationship">Relationship</label>
                                        <input
                                            type="text"
                                            id="emergency_relationship"
                                            name="personalInfo.emergencyContact.relationship"
                                            value={formData.personalInfo.emergencyContact.relationship}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="account-form-group">
                                        <label htmlFor="emergency_phone">Phone Number</label>
                                        <input
                                            type="tel"
                                            id="emergency_phone"
                                            name="personalInfo.emergencyContact.phone"
                                            value={formData.personalInfo.emergencyContact.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Employment & Financial Details */}
                            <div className="account-form-section-title">Employment & Financial Details</div>

                            <div className="account-form-group">
                                <label htmlFor="occupation">Occupation <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="occupation"
                                    name="occupation"
                                    value={formData.occupation}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="account-form-group">
                                <label htmlFor="monthlyIncome">Monthly Income (₹) <span className="required">*</span></label>
                                <input
                                    type="number"
                                    id="monthlyIncome"
                                    name="monthlyIncome"
                                    value={formData.monthlyIncome}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                />
                            </div>

                            <div className="account-form-group">
                                <label htmlFor="creditScore">Credit Score</label>
                                <input
                                    type="number"
                                    id="creditScore"
                                    name="creditScore"
                                    value={formData.creditScore}
                                    onChange={handleChange}
                                    min="300"
                                    max="900"
                                />
                            </div>

                            <div className="account-form-group">
                                <label htmlFor="existingLoans">Existing Loans (₹)</label>
                                <input
                                    type="number"
                                    id="existingLoans"
                                    name="existingLoans"
                                    value={formData.existingLoans}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>

                            {/* Banking Details */}
                            <div className="account-form-section-title">Banking Details</div>

                            <div className="account-form-group">
                                <label htmlFor="bankDetails.accountHolderName">Account Holder Name</label>
                                <input
                                    type="text"
                                    id="bankDetails.accountHolderName"
                                    name="bankDetails.accountHolderName"
                                    value={formData.bankDetails.accountHolderName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="account-form-group">
                                <label htmlFor="bankDetails.bankName">Bank Name</label>
                                <input
                                    type="text"
                                    id="bankDetails.bankName"
                                    name="bankDetails.bankName"
                                    value={formData.bankDetails.bankName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="account-form-group">
                                <label htmlFor="bankDetails.accountNumber">Account Number</label>
                                <input
                                    type="text"
                                    id="bankDetails.accountNumber"
                                    name="bankDetails.accountNumber"
                                    value={formData.bankDetails.accountNumber}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="account-form-group">
                                <label htmlFor="bankDetails.ifscCode">IFSC Code</label>
                                <input
                                    type="text"
                                    id="bankDetails.ifscCode"
                                    name="bankDetails.ifscCode"
                                    value={formData.bankDetails.ifscCode}
                                    onChange={handleChange}
                                    style={{textTransform: 'uppercase'}}
                                />
                            </div>

                            <div className="account-form-group">
                                <label htmlFor="bankDetails.accountType">Account Type</label>
                                <select
                                    id="bankDetails.accountType"
                                    name="bankDetails.accountType"
                                    value={formData.bankDetails.accountType}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Account Type</option>
                                    <option value="Savings">Savings</option>
                                    <option value="Current">Current</option>
                                    <option value="Salary">Salary</option>
                                </select>
                            </div>

                            {/* References */}
                            <div className="account-form-section-title">References</div>
                            
                            <div className="account-form-group account-full-width">
                                <button
                                    type="button"
                                    className="account-secondary-button"
                                    onClick={addReference}
                                >
                                    + Add Reference
                                </button>
                            </div>

                            {formData.references.map((ref, index) => (
                                <div key={index} className="account-reference-group">
                                    <div className="account-reference-header">
                                        <h4>Reference {index + 1}</h4>
                                        <button
                                            type="button"
                                            className="account-remove-button"
                                            onClick={() => removeReference(index)}
                                        >
                                            × Remove
                                        </button>
                                    </div>
                                    
                                    <div className="account-form-grid">
                                        <div className="account-form-group">
                                            <label htmlFor={`ref_name_${index}`}>Name</label>
                                            <input
                                                type="text"
                                                id={`ref_name_${index}`}
                                                value={ref.name}
                                                onChange={(e) => updateReference(index, 'name', e.target.value)}
                                            />
                                        </div>
                                        
                                        <div className="account-form-group">
                                            <label htmlFor={`ref_relationship_${index}`}>Relationship</label>
                                            <input
                                                type="text"
                                                id={`ref_relationship_${index}`}
                                                value={ref.relationship}
                                                onChange={(e) => updateReference(index, 'relationship', e.target.value)}
                                            />
                                        </div>
                                        
                                        <div className="account-form-group">
                                            <label htmlFor={`ref_contact_${index}`}>Contact</label>
                                            <input
                                                type="text"
                                                id={`ref_contact_${index}`}
                                                value={ref.contact}
                                                onChange={(e) => updateReference(index, 'contact', e.target.value)}
                                            />
                                        </div>
                                        
                                        <div className="account-form-group">
                                            <label htmlFor={`ref_address_${index}`}>Address</label>
                                            <input
                                                type="text"
                                                id={`ref_address_${index}`}
                                                value={ref.address}
                                                onChange={(e) => updateReference(index, 'address', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Document Uploads */}
                            <div className="account-form-section-title">Document Uploads</div>

                            <div className="account-form-group account-full-width">
                                <label htmlFor="pan">PAN Card (Max 2MB) <span className="required">*</span></label>
                                <div className="account-file-upload-wrapper">
                                    <label className="account-file-upload-button">
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
                                        <div className="account-file-preview">
                                            <span>{uploadedFiles.pan.name}</span>
                                            <button
                                                type="button"
                                                className="account-remove-file-button"
                                                onClick={() => handleRemoveFile('pan')}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="account-file-hint">No file chosen</div>
                                    )}
                                </div>
                            </div>

                            <div className="account-form-group account-full-width">
                                <label htmlFor="addressProof">Proof of Address (Max 2MB) <span className="required">*</span></label>
                                <div className="account-file-upload-wrapper">
                                    <label className="account-file-upload-button">
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
                                        <div className="account-file-preview">
                                            <span>{uploadedFiles.addressProof.name}</span>
                                            <button
                                                type="button"
                                                className="account-remove-file-button"
                                                onClick={() => handleRemoveFile('addressProof')}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="account-file-hint">No file chosen</div>
                                    )}
                                </div>
                            </div>

                            <div className="account-form-group account-full-width">
                                <label htmlFor="incomeProof">Income Proof (Max 2MB)</label>
                                <div className="account-file-upload-wrapper">
                                    <label className="account-file-upload-button">
                                        <span>Choose File</span>
                                        <input
                                            type="file"
                                            id="incomeProof"
                                            onChange={(e) => handleFileUpload('incomeProof', e)}
                                            accept="image/*,.pdf"
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    {uploadedFiles.incomeProof ? (
                                        <div className="account-file-preview">
                                            <span>{uploadedFiles.incomeProof.name}</span>
                                            <button
                                                type="button"
                                                className="account-remove-file-button"
                                                onClick={() => handleRemoveFile('incomeProof')}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="account-file-hint">No file chosen</div>
                                    )}
                                </div>
                            </div>

                            <div className="account-form-group account-full-width">
                                <label htmlFor="photo">Passport Photo (Max 2MB) <span className="required">*</span></label>
                                <div className="account-file-upload-wrapper">
                                    <label className="account-file-upload-button">
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
                                        <div className="account-file-preview">
                                            <span>{uploadedFiles.photo.name}</span>
                                            <button
                                                type="button"
                                                className="account-remove-file-button"
                                                onClick={() => handleRemoveFile('photo')}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="account-file-hint">No file chosen</div>
                                    )}
                                </div>
                            </div>

                            <div className="account-form-group account-full-width">
                                <label htmlFor="signature">Signature (Max 2MB) <span className="required">*</span></label>
                                <div className="account-file-upload-wrapper">
                                    <label className="account-file-upload-button">
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
                                        <div className="account-file-preview">
                                            <span>{uploadedFiles.signature.name}</span>
                                            <button
                                                type="button"
                                                className="account-remove-file-button"
                                                onClick={() => handleRemoveFile('signature')}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="account-file-hint">No file chosen</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {error && <div className="account-error-message">{error}</div>}

                        <div className="account-button-group">
                            <button
                                type="button"
                                className="account-secondary-button"
                                onClick={() => setStep(1)}
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                className="account-primary-button"
                                onClick={() => setStep(3)}
                            >
                                Continue to KYC Verification
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="account-form-step account-kyc-step">
                        <h2>KYC Verification</h2>
                        <p className="account-form-intro">Mark the verification status for each KYC component</p>

                        <div className="kyc-verification-container">
                            <div className="kyc-verification-section">
                                <h3>Identity Verification</h3>
                                
                                <div className="kyc-verification-item">
                                    <div className="kyc-verification-info">
                                        <h4>Aadhaar Verification</h4>
                                        <p>Verified through OTP authentication</p>
                                    </div>
                                    <div className="kyc-verification-status">
                                        <label className="kyc-checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={kycVerifications.isAadhaarVerified}
                                                onChange={(e) => handleKycVerificationChange('isAadhaarVerified', e.target.checked)}
                                            />
                                            <span className="kyc-checkbox-custom"></span>
                                            Mark as Verified
                                        </label>
                                    </div>
                                </div>

                                <div className="kyc-verification-item">
                                    <div className="kyc-verification-info">
                                        <h4>PAN Card Verification</h4>
                                        <p>Document uploaded: {uploadedFiles.pan ? uploadedFiles.pan.name : 'Not uploaded'}</p>
                                    </div>
                                    <div className="kyc-verification-status">
                                        <label className="kyc-checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={kycVerifications.isPanVerified}
                                                onChange={(e) => handleKycVerificationChange('isPanVerified', e.target.checked)}
                                                disabled={!uploadedFiles.pan}
                                            />
                                            <span className="kyc-checkbox-custom"></span>
                                            {uploadedFiles.pan ? 'Mark as Verified' : 'Upload document first'}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="kyc-verification-section">
                                <h3>Contact Verification</h3>
                                
                                <div className="kyc-verification-item">
                                    <div className="kyc-verification-info">
                                        <h4>Phone Verification</h4>
                                        <p>Phone Number: {formData.phone || 'Not provided'}</p>
                                    </div>
                                    <div className="kyc-verification-status">
                                        <label className="kyc-checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={kycVerifications.isPhoneVerified}
                                                onChange={(e) => handleKycVerificationChange('isPhoneVerified', e.target.checked)}
                                            />
                                            <span className="kyc-checkbox-custom"></span>
                                            Mark as Verified
                                        </label>
                                    </div>
                                </div>

                                <div className="kyc-verification-item">
                                    <div className="kyc-verification-info">
                                        <h4>Email Verification</h4>
                                        <p>Email: {formData.email || 'Not provided'}</p>
                                    </div>
                                    <div className="kyc-verification-status">
                                        <label className="kyc-checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={kycVerifications.isEmailVerified}
                                                onChange={(e) => handleKycVerificationChange('isEmailVerified', e.target.checked)}
                                            />
                                            <span className="kyc-checkbox-custom"></span>
                                            Mark as Verified
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="kyc-verification-section">
                                <h3>Address & Income Verification</h3>
                                
                                <div className="kyc-verification-item">
                                    <div className="kyc-verification-info">
                                        <h4>Address Proof Verification</h4>
                                        <p>Document uploaded: {uploadedFiles.addressProof ? uploadedFiles.addressProof.name : 'Not uploaded'}</p>
                                    </div>
                                    <div className="kyc-verification-status">
                                        <label className="kyc-checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={kycVerifications.isAddressVerified}
                                                onChange={(e) => handleKycVerificationChange('isAddressVerified', e.target.checked)}
                                                disabled={!uploadedFiles.addressProof}
                                            />
                                            <span className="kyc-checkbox-custom"></span>
                                            {uploadedFiles.addressProof ? 'Mark as Verified' : 'Upload document first'}
                                        </label>
                                    </div>
                                </div>

                                <div className="kyc-verification-item">
                                    <div className="kyc-verification-info">
                                        <h4>Income Proof Verification</h4>
                                        <p>Document uploaded: {uploadedFiles.incomeProof ? uploadedFiles.incomeProof.name : 'Not uploaded'}</p>
                                    </div>
                                    <div className="kyc-verification-status">
                                        <label className="kyc-checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={kycVerifications.isIncomeVerified}
                                                onChange={(e) => handleKycVerificationChange('isIncomeVerified', e.target.checked)}
                                                disabled={!uploadedFiles.incomeProof}
                                            />
                                            <span className="kyc-checkbox-custom"></span>
                                            {uploadedFiles.incomeProof ? 'Mark as Verified' : 'Optional - mark if uploaded'}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="kyc-summary">
                                <h3>KYC Summary</h3>
                                <div className="kyc-summary-grid">
                                    <div className="kyc-summary-item">
                                        <span className="kyc-summary-label">Aadhaar Verified:</span>
                                        <span className={`kyc-summary-value ${kycVerifications.isAadhaarVerified ? 'kyc-verified' : 'kyc-pending'}`}>
                                            {kycVerifications.isAadhaarVerified ? '✓ Verified' : '✗ Pending'}
                                        </span>
                                    </div>
                                    <div className="kyc-summary-item">
                                        <span className="kyc-summary-label">PAN Verified:</span>
                                        <span className={`kyc-summary-value ${kycVerifications.isPanVerified ? 'kyc-verified' : 'kyc-pending'}`}>
                                            {kycVerifications.isPanVerified ? '✓ Verified' : '✗ Pending'}
                                        </span>
                                    </div>
                                    <div className="kyc-summary-item">
                                        <span className="kyc-summary-label">Phone Verified:</span>
                                        <span className={`kyc-summary-value ${kycVerifications.isPhoneVerified ? 'kyc-verified' : 'kyc-pending'}`}>
                                            {kycVerifications.isPhoneVerified ? '✓ Verified' : '✗ Pending'}
                                        </span>
                                    </div>
                                    <div className="kyc-summary-item">
                                        <span className="kyc-summary-label">Email Verified:</span>
                                        <span className={`kyc-summary-value ${kycVerifications.isEmailVerified ? 'kyc-verified' : 'kyc-pending'}`}>
                                            {kycVerifications.isEmailVerified ? '✓ Verified' : '✗ Pending'}
                                        </span>
                                    </div>
                                    <div className="kyc-summary-item">
                                        <span className="kyc-summary-label">Address Verified:</span>
                                        <span className={`kyc-summary-value ${kycVerifications.isAddressVerified ? 'kyc-verified' : 'kyc-pending'}`}>
                                            {kycVerifications.isAddressVerified ? '✓ Verified' : '✗ Pending'}
                                        </span>
                                    </div>
                                    <div className="kyc-summary-item">
                                        <span className="kyc-summary-label">Overall KYC Status:</span>
                                        <span className={`kyc-summary-value ${formData.isKycVerified ? 'kyc-verified' : 'kyc-pending'}`}>
                                            {formData.isKycVerified ? '✓ Complete' : '✗ Incomplete'}
                                        </span>
                                    </div>
                                </div>
                                
                                {!formData.isKycVerified && (
                                    <div className="kyc-warning">
                                        <p>⚠️ All required KYC components must be verified to complete the KYC process.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="account-button-group">
                            <button
                                type="button"
                                className="account-secondary-button"
                                onClick={() => setStep(2)}
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                className="account-primary-button"
                                onClick={() => setStep(4)}
                            >
                                Review & Submit
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="account-form-step account-review-step">
                        <h2>Review Customer Details</h2>
                        <p className="account-review-intro">Please review all information before submission</p>

                        <div className="account-review-section">
                            <h3>Customer IDs</h3>
                            <div className="account-review-grid">
                                <div className="account-review-item">
                                    <span className="account-review-label">Customer ID:</span>
                                    <span className="account-review-value">{formData.customerId}</span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Account Number:</span>
                                    <span className="account-review-value">{formData.accountNumber}</span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Reference Number:</span>
                                    <span className="account-review-value">{formData.referenceNumber}</span>
                                </div>
                            </div>
                        </div>

                        <div className="account-review-section">
                            <h3>Basic Information</h3>
                            <div className="account-review-grid">
                                <div className="account-review-item">
                                    <span className="account-review-label">Full Name:</span>
                                    <span className="account-review-value">{formData.name}</span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Email:</span>
                                    <span className="account-review-value">{formData.email}</span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Phone:</span>
                                    <span className="account-review-value">{formData.phone}</span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Aadhaar Verified:</span>
                                    <span className={`account-review-value ${formData.isAadhaarVerified ? 'account-verified' : 'account-pending'}`}>
                                        {formData.isAadhaarVerified ? '✓ Verified' : '✗ Not Verified'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="account-review-section">
                            <h3>KYC Verification Status</h3>
                            <div className="account-review-grid">
                                <div className="account-review-item">
                                    <span className="account-review-label">Phone Verified:</span>
                                    <span className={`account-review-value ${formData.isPhoneVerified ? 'account-verified' : 'account-pending'}`}>
                                        {formData.isPhoneVerified ? '✓ Verified' : '✗ Not Verified'}
                                    </span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Email Verified:</span>
                                    <span className={`account-review-value ${formData.isEmailVerified ? 'account-verified' : 'account-pending'}`}>
                                        {formData.isEmailVerified ? '✓ Verified' : '✗ Not Verified'}
                                    </span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">PAN Verified:</span>
                                    <span className={`account-review-value ${formData.documents.panCard.verified ? 'account-verified' : 'account-pending'}`}>
                                        {formData.documents.panCard.verified ? '✓ Verified' : '✗ Not Verified'}
                                    </span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Address Proof Verified:</span>
                                    <span className={`account-review-value ${formData.documents.addressProof.verified ? 'account-verified' : 'account-pending'}`}>
                                        {formData.documents.addressProof.verified ? '✓ Verified' : '✗ Not Verified'}
                                    </span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Overall KYC Status:</span>
                                    <span className={`account-review-value ${formData.isKycVerified ? 'account-verified' : 'account-pending'}`}>
                                        {formData.isKycVerified ? '✓ Complete' : '✗ Incomplete'}
                                    </span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Customer Status:</span>
                                    <span className={`account-review-value ${formData.status === 'active' ? 'account-active' : 'account-pending'}`}>
                                        {formData.status === 'active' ? 'Active' : 'Under Verification'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="account-review-section">
                            <h3>Personal Information</h3>
                            <div className="account-review-grid">
                                <div className="account-review-item">
                                    <span className="account-review-label">Father's Name:</span>
                                    <span className="account-review-value">{formData.personalInfo.fatherName || 'Not provided'}</span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Mother's Name:</span>
                                    <span className="account-review-value">{formData.personalInfo.motherName || 'Not provided'}</span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Spouse Name:</span>
                                    <span className="account-review-value">{formData.personalInfo.spouseName || 'Not provided'}</span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Blood Group:</span>
                                    <span className="account-review-value">{formData.personalInfo.bloodGroup || 'Not provided'}</span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Marital Status:</span>
                                    <span className="account-review-value">{formData.personalInfo.maritalStatus || 'Not provided'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="account-review-section">
                            <h3>Address Information</h3>
                            <div className="account-review-grid">
                                <div className="account-review-item">
                                    <span className="account-review-label">Street:</span>
                                    <span className="account-review-value">{formData.address.street || 'Not provided'}</span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">City:</span>
                                    <span className="account-review-value">{formData.address.city || 'Not provided'}</span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">State:</span>
                                    <span className="account-review-value">{formData.address.state || 'Not provided'}</span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Pincode:</span>
                                    <span className="account-review-value">{formData.address.pincode || 'Not provided'}</span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Country:</span>
                                    <span className="account-review-value">{formData.address.country}</span>
                                </div>
                            </div>
                        </div>

                        <div className="account-review-section">
                            <h3>Financial Information</h3>
                            <div className="account-review-grid">
                                <div className="account-review-item">
                                    <span className="account-review-label">Occupation:</span>
                                    <span className="account-review-value">{formData.occupation || 'Not provided'}</span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Monthly Income:</span>
                                    <span className="account-review-value">₹{formData.monthlyIncome || '0'}</span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Credit Score:</span>
                                    <span className="account-review-value">{formData.creditScore || 'Not provided'}</span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Existing Loans:</span>
                                    <span className="account-review-value">₹{formData.existingLoans || '0'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="account-review-section">
                            <h3>Banking Details</h3>
                            <div className="account-review-grid">
                                <div className="account-review-item">
                                    <span className="account-review-label">Account Holder:</span>
                                    <span className="account-review-value">{formData.bankDetails.accountHolderName || 'Not provided'}</span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Bank Name:</span>
                                    <span className="account-review-value">{formData.bankDetails.bankName || 'Not provided'}</span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Account Number:</span>
                                    <span className="account-review-value">{formData.bankDetails.accountNumber || 'Not provided'}</span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">IFSC Code:</span>
                                    <span className="account-review-value">{formData.bankDetails.ifscCode || 'Not provided'}</span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Account Type:</span>
                                    <span className="account-review-value">{formData.bankDetails.accountType || 'Not provided'}</span>
                                </div>
                            </div>
                        </div>

                        {formData.references.length > 0 && (
                            <div className="account-review-section">
                                <h3>References ({formData.references.length})</h3>
                                {formData.references.map((ref, index) => (
                                    <div key={index} className="account-reference-review">
                                        <h4>Reference {index + 1}</h4>
                                        <div className="account-review-grid">
                                            <div className="account-review-item">
                                                <span className="account-review-label">Name:</span>
                                                <span className="account-review-value">{ref.name || 'Not provided'}</span>
                                            </div>
                                            <div className="account-review-item">
                                                <span className="account-review-label">Relationship:</span>
                                                <span className="account-review-value">{ref.relationship || 'Not provided'}</span>
                                            </div>
                                            <div className="account-review-item">
                                                <span className="account-review-label">Contact:</span>
                                                <span className="account-review-value">{ref.contact || 'Not provided'}</span>
                                            </div>
                                            <div className="account-review-item">
                                                <span className="account-review-label">Address:</span>
                                                <span className="account-review-value">{ref.address || 'Not provided'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="account-review-section">
                            <h3>Uploaded Documents</h3>
                            <div className="account-document-grid">
                                {uploadedFiles.pan && (
                                    <div className="account-document-item">
                                        <div className="account-document-preview">
                                            {uploadedFiles.pan.type.startsWith('image/') ? (
                                                <img 
                                                    src={URL.createObjectURL(uploadedFiles.pan)} 
                                                    alt="PAN Card"
                                                    className="account-document-image"
                                                />
                                            ) : (
                                                <div className="account-document-icon">📄</div>
                                            )}
                                        </div>
                                        <div className="account-document-info">
                                            <span className="account-document-label">PAN Card</span>
                                            <span className={`account-document-status ${formData.documents.panCard.verified ? 'document-verified' : 'document-pending'}`}>
                                                {formData.documents.panCard.verified ? '✓ Verified' : '✗ Not Verified'}
                                            </span>
                                            <span className="account-document-name">{uploadedFiles.pan.name}</span>
                                        </div>
                                    </div>
                                )}

                                {uploadedFiles.addressProof && (
                                    <div className="account-document-item">
                                        <div className="account-document-preview">
                                            {uploadedFiles.addressProof.type.startsWith('image/') ? (
                                                <img 
                                                    src={URL.createObjectURL(uploadedFiles.addressProof)} 
                                                    alt="Address Proof"
                                                    className="account-document-image"
                                                />
                                            ) : (
                                                <div className="account-document-icon">📄</div>
                                            )}
                                        </div>
                                        <div className="account-document-info">
                                            <span className="account-document-label">Address Proof</span>
                                            <span className={`account-document-status ${formData.documents.addressProof.verified ? 'document-verified' : 'document-pending'}`}>
                                                {formData.documents.addressProof.verified ? '✓ Verified' : '✗ Not Verified'}
                                            </span>
                                            <span className="account-document-name">{uploadedFiles.addressProof.name}</span>
                                        </div>
                                    </div>
                                )}

                                {uploadedFiles.photo && (
                                    <div className="account-document-item">
                                        <div className="account-document-preview">
                                            {uploadedFiles.photo.type.startsWith('image/') ? (
                                                <img 
                                                    src={URL.createObjectURL(uploadedFiles.photo)} 
                                                    alt="Photo"
                                                    className="account-document-image"
                                                />
                                            ) : (
                                                <div className="account-document-icon">📄</div>
                                            )}
                                        </div>
                                        <div className="account-document-info">
                                            <span className="account-document-label">Passport Photo</span>
                                            <span className="account-document-name">{uploadedFiles.photo.name}</span>
                                        </div>
                                    </div>
                                )}

                                {uploadedFiles.signature && (
                                    <div className="account-document-item">
                                        <div className="account-document-preview">
                                            {uploadedFiles.signature.type.startsWith('image/') ? (
                                                <img 
                                                    src={URL.createObjectURL(uploadedFiles.signature)} 
                                                    alt="Signature"
                                                    className="account-document-image"
                                                />
                                            ) : (
                                                <div className="account-document-icon">📄</div>
                                            )}
                                        </div>
                                        <div className="account-document-info">
                                            <span className="account-document-label">Signature</span>
                                            <span className="account-document-name">{uploadedFiles.signature.name}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="account-declaration">
                            <h3>Declaration</h3>
                            <p>
                                I hereby declare that all the information provided in this form is true and correct to the best of my knowledge.
                                I understand that any false information may result in rejection of the customer account opening application.
                            </p>
                            <div className="account-declaration-checkbox">
                                <input type="checkbox" id="declaration" required />
                                <label htmlFor="declaration">I confirm that all details are verified and correct</label>
                            </div>
                        </div>

                        <div className="account-button-group">
                            <button
                                type="button"
                                className="account-secondary-button"
                                onClick={() => setStep(3)}
                                disabled={loading}
                            >
                                Back to KYC
                            </button>
                            <button
                                type="button"
                                className="account-primary-button"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="account-spinner"></span> Submitting...
                                    </>
                                ) : (
                                    "Create Customer Account"
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="account-form-step account-success-step">
                        <div className="account-success-icon">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </div>
                        <h2>Customer Account Created Successfully!</h2>
                        <div className="account-success-message">
                            <p>The customer account has been created successfully.</p>
                            <p>Customer Details:</p>
                            <div className="account-success-details">
                                <div className="account-success-detail">
                                    <span className="account-success-label">Customer ID:</span>
                                    <span className="account-success-value">{formData.customerId}</span>
                                </div>
                                <div className="account-success-detail">
                                    <span className="account-success-label">Account Number:</span>
                                    <span className="account-success-value">{formData.accountNumber}</span>
                                </div>
                                <div className="account-success-detail">
                                    <span className="account-success-label">Customer Name:</span>
                                    <span className="account-success-value">{formData.name}</span>
                                </div>
                                <div className="account-success-detail">
                                    <span className="account-success-label">Phone Number:</span>
                                    <span className="account-success-value">{formData.phone}</span>
                                </div>
                                <div className="account-success-detail">
                                    <span className="account-success-label">KYC Status:</span>
                                    <span className={`account-success-value ${formData.isKycVerified ? 'kyc-success' : 'kyc-warning'}`}>
                                        {formData.isKycVerified ? 'Complete ✓' : 'Pending ⚠️'}
                                    </span>
                                </div>
                                <div className="account-success-detail">
                                    <span className="account-success-label">Account Status:</span>
                                    <span className="account-success-value">{formData.status === 'active' ? 'Active' : 'Under Verification'}</span>
                                </div>
                            </div>
                            <p>Please provide these details to the customer.</p>
                        </div>
                        <div className="account-button-group">
                            <button
                                className="account-secondary-button"
                                onClick={() => {
                                    // Reset form and start new application
                                    setStep(1);
                                    setVerificationStep('aadhaar_input');
                                    setAadhaarData({
                                        aadhaarNumber: "",
                                        otp: "",
                                        reference_id: "",
                                        verificationStatus: 'pending'
                                    });
                                    setFormData({
                                        name: "",
                                        email: "",
                                        phone: "",
                                        aadhaarDetails: {
                                            aadhaar_hash: "",
                                            aadhaar_number: "",
                                            name_on_aadhaar: "",
                                            care_of: "",
                                            father_name: "",
                                            mother_name: "",
                                            dob: "",
                                            year_of_birth: "",
                                            gender: "",
                                            full_address: "",
                                            photo_base64: "",
                                            is_otp_verified: false,
                                            reference_id: "",
                                            timestamp: "",
                                            raw_response: {}
                                        },
                                        personalInfo: {
                                            fatherName: "",
                                            motherName: "",
                                            spouseName: "",
                                            bloodGroup: "",
                                            maritalStatus: "",
                                            permanentAddress: {},
                                            currentAddress: {},
                                            emergencyContact: {
                                                name: "",
                                                relationship: "",
                                                phone: "",
                                                address: ""
                                            }
                                        },
                                        address: {
                                            street: "",
                                            city: "",
                                            state: "",
                                            pincode: "",
                                            country: "India"
                                        },
                                        occupation: "",
                                        monthlyIncome: "",
                                        creditScore: "",
                                        existingLoans: "",
                                        documents: {
                                            aadhaarCard: { uploaded: false, url: "", verified: false },
                                            panCard: { uploaded: false, url: "", verified: false },
                                            addressProof: { uploaded: false, url: "", verified: false },
                                            incomeProof: { uploaded: false, url: "", verified: false },
                                            photo: { uploaded: false, url: "" },
                                            signature: { uploaded: false, url: "" }
                                        },
                                        references: [],
                                        bankDetails: {
                                            accountHolderName: "",
                                            bankName: "",
                                            accountNumber: "",
                                            ifscCode: "",
                                            branchName: "",
                                            accountType: ""
                                        },
                                        status: "under_verification",
                                        isKycVerified: false,
                                        isAadhaarVerified: false,
                                        isPhoneVerified: false,
                                        isEmailVerified: false,
                                        riskCategory: "unknown",
                                        riskScore: 0,
                                        customerId: "",
                                        accountNumber: "",
                                        referenceNumber: `TWGL${Math.floor(Math.random() * 1000000)}`
                                    });
                                    setUploadedFiles({
                                        pan: null,
                                        addressProof: null,
                                        incomeProof: null,
                                        photo: null,
                                        signature: null
                                    });
                                    setKycVerifications({
                                        isAadhaarVerified: false,
                                        isPhoneVerified: false,
                                        isEmailVerified: false,
                                        isPanVerified: false,
                                        isAddressVerified: false,
                                        isIncomeVerified: false
                                    });
                                    setCurrentAddressVisible(false);
                                    setShowEmergencyContact(false);
                                    setPrimaryBranch(branchOptions.length > 0 ? branchOptions[0]._id : "");
                                }}
                            >
                                Create Another Account
                            </button>
                            <button
                                className="account-primary-button"
                                onClick={() => window.location.href = '/twgl&articles/employee/dashboard'}
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TWgoldAccountOpeningForm;