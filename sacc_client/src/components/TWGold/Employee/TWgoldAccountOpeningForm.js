import React, { useState, useEffect } from "react";
import { getAllBranches, generateUserAadhaarOtp, verifyUserAadhaarOtp, createCustomerWithAadhaar, getVerifiedAadhaarDetails } from '../TWGLogin/axiosConfig'
import "./TWgoldAccountOpeningForm.css";
import TwgoldEmployeeNav from "./TwgoldEmployeeNav";
import { ToastContainer } from 'react-toastify';
import showToast from "../../Toast";

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const TWgoldAccountOpeningForm = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [aadhaarLoading, setAadhaarLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [verificationStep, setVerificationStep] = useState('aadhaar_input');

    const [panError, setPanError] = useState('');

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
            house: "",
            street: "",
            landmark: "",
            city: "",
            district: "",
            state: "",
            pincode: "",
            country: "India"
        },

        // Employment & Financial Details
        occupation: "",
        monthlyIncome: "",

        // PAN Number (added based on schema)
        panNumber: "",

        // Credit Information
        creditScore: "",
        existingLoans: "",

        // Documents - simplified to boolean values (no upload URLs)
        documents: {
            aadhaarCard: { hasDocument: true, verified: false },
            panCard: { hasDocument: false, verified: false },
            addressProof: { hasDocument: false, verified: false },
            incomeProof: { hasDocument: false, verified: false },
            photo: { hasDocument: false },
            signature: { hasDocument: false }
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

        // Generated IDs (will be generated in backend)
        customerId: "",

        // Temporary reference
        referenceNumber: `TWGL${Math.floor(Math.random() * 1000000)}`
    });

    const [error, setError] = useState('');
    const [currentAddressVisible, setCurrentAddressVisible] = useState(false);
    const [showEmergencyContact, setShowEmergencyContact] = useState(false);
    const [branchOptions, setBranchOptions] = useState([]);
    const [primaryBranch, setPrimaryBranch] = useState("");
    const [isCheckingExisting, setIsCheckingExisting] = useState(false);
    const [existingSessionFound, setExistingSessionFound] = useState(null);

    // New KYC Verification Checkboxes
    const [kycVerifications, setKycVerifications] = useState({
        isAadhaarVerified: false,
        isPhoneVerified: false,
        isEmailVerified: false,
        isPanVerified: false,
        isAddressVerified: false,
        isIncomeVerified: false
    });

    // Fetch branch options on component mount
    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const response = await getAllBranches();

            console.log(response?.data?.data?.branches);

            if (
                response?.data?.success &&
                response?.data?.data?.branches &&
                Array.isArray(response.data.data.branches)
            ) {
                const branches = response.data.data.branches;

                setBranchOptions(branches);

                // Optional: set default / primary branch
                if (branches.length > 0) {
                    setPrimaryBranch(branches[0]._id);
                }
            } else {
                setBranchOptions([]);
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
            setBranchOptions([]);
            showToast('error', 'Failed to load branches');
        }
    };

    // Update isKycVerified based on other verification statuses
    useEffect(() => {
        const isAadhaarVerified = formData.isAadhaarVerified;
      
        const isPanVerified =
          !!formData.panNumber &&
          PAN_REGEX.test(formData.panNumber) &&
          formData.documents.panCard.hasDocument;
      
        const isPhoneVerified = /^[6-9]\d{9}$/.test(formData.phone);
      
        const isEmailVerified = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      
        const isAddressVerified = isAadhaarVerified;
      
        const isIncomeVerified = formData.documents.incomeProof.hasDocument;
      
        const isKycVerified =
          isAadhaarVerified &&
          isPanVerified &&
          isPhoneVerified &&
          isEmailVerified &&
          isAddressVerified;
      
        setKycVerifications({
          isAadhaarVerified,
          isPanVerified,
          isPhoneVerified,
          isEmailVerified,
          isAddressVerified,
          isIncomeVerified
        });
      
        setFormData(prev => ({
          ...prev,
          isPhoneVerified,
          isEmailVerified,
          isKycVerified,
          status: isKycVerified ? 'active' : 'under_verification',
          documents: {
            ...prev.documents,
            panCard: {
              ...prev.documents.panCard,
              verified: isPanVerified
            },
            addressProof: {
              ...prev.documents.addressProof,
              verified: isAddressVerified
            },
            incomeProof: {
              ...prev.documents.incomeProof,
              verified: isIncomeVerified
            }
          }
        }));
      }, [
        formData.isAadhaarVerified,
        formData.panNumber,
        formData.phone,
        formData.email,
        formData.documents.panCard.hasDocument,
        formData.documents.incomeProof.hasDocument
      ]);
      
      

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

            // Call Aadhaar OTP API using axios config
            const response = await generateUserAadhaarOtp({
                aadhaar_number: aadhaarData.aadhaarNumber,
                target: 'customer'
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to send OTP');
            }

            // Store reference_id for verification
            setAadhaarData(prev => ({
                ...prev,
                reference_id: response.data.reference_id,
                verificationStatus: 'otp_sent'
            }));

            setVerificationStep('otp_verification');
            showToast('success', 'OTP sent successfully to registered mobile number');

        } catch (error) {
            console.error('Aadhaar OTP error:', error);
            showToast('error', error.response?.data?.message || error.message || 'Failed to send OTP');
        } finally {
            setAadhaarLoading(false);
        }
    };

    const handleOTPVerification = async (e) => {
        e.preventDefault();
        setOtpLoading(true);
        setError('');

        try {
            if (!aadhaarData.otp || aadhaarData.otp.length !== 6) {
                throw new Error('Please enter a valid 6-digit OTP');
            }

            const response = await verifyUserAadhaarOtp({
                aadhaar_number: aadhaarData.aadhaarNumber,
                otp: aadhaarData.otp,
                reference_id: aadhaarData.reference_id,
                target: 'customer'
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'OTP verification failed');
            }

            const verifiedInfo = response.data.aadhaar_data || {};

            setAadhaarData(prev => ({
                ...prev,
                verificationStatus: 'verified'
            }));

            console.log(verifiedInfo)
            const address = verifiedInfo.address || {};

            setFormData(prev => ({
                ...prev,

                // Basic
                name: verifiedInfo.name || prev.name,

                aadhaarDetails: {
                    ...prev.aadhaarDetails,

                    // 🔑 CRITICAL IDENTIFIERS
                    aadhaar_number: verifiedInfo.aadhaar_number || aadhaarData.aadhaarNumber,
                    aadhaar_hash: verifiedInfo.aadhaar_hash || "",

                    // PERSONAL
                    name_on_aadhaar: verifiedInfo.name || "",
                    care_of: verifiedInfo.care_of || "",
                    father_name: verifiedInfo.care_of || "",
                    dob: verifiedInfo.date_of_birth || verifiedInfo.dob || "",
                    year_of_birth: verifiedInfo.year_of_birth || "",
                    gender: verifiedInfo.gender || "",

                    // ADDRESS
                    full_address: verifiedInfo.full_address || "",

                    // BIOMETRIC
                    photo_base64: verifiedInfo.photo || "",

                    // META
                    is_otp_verified: true,
                    reference_id: verifiedInfo.reference_id || aadhaarData.reference_id,
                    timestamp: new Date().toISOString(),

                    // 🧾 STORE ENTIRE RAW RESPONSE (VERY IMPORTANT)
                    raw_response: verifiedInfo
                },

                // Structured Address (for UI usage)
                address: {
                    house: address.house || "",
                    street: address.street || "",
                    landmark: address.landmark || "",
                    city: address.vtc || address.district || "",
                    district: address.district || "",
                    state: address.state || "",
                    pincode: address.pincode || "",
                    country: address.country || "India"
                },

                isAadhaarVerified: true
            }));


            setVerificationStep('details_form');
            showToast('success', 'Aadhaar verified successfully!');

        } catch (error) {
            console.error('OTP verification error:', error);
            showToast('error', error.response?.data?.message || error.message || 'OTP verification failed');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleCheckExistingApplication = async () => {
        if (!aadhaarData.aadhaarNumber || aadhaarData.aadhaarNumber.length !== 12) {
            showToast('error', 'Please enter a valid 12-digit Aadhaar number first');
            return;
        }

        setIsCheckingExisting(true);
        try {
            const response = await getVerifiedAadhaarDetails({
                aadhaar_number: aadhaarData.aadhaarNumber
            });

            if (response.data.success) {
                const data = response.data.data;
                console.log(data)
                setExistingSessionFound(data);
                showToast('success', 'Verified application found! You can continue.');
            } else {
                showToast('info', 'No verified session found for this Aadhaar.');
            }
        } catch (err) {
            console.error("Check error:", err);
            showToast('info', 'No active verified session found. Please proceed with OTP.');
        } finally {
            setIsCheckingExisting(false);
        }
    };

    // Function to populate the form from the found session
    const resumeApplication = () => {
        if (!existingSessionFound) return;

        console.log(existingSessionFound)
        // Extract address if it exists in the raw_response or top level
        const addr = existingSessionFound.aadhaar_data.address || {};

        setFormData(prev => ({
            ...prev,
            name: existingSessionFound.name || "",
            email: existingSessionFound.email_id || "",
            phone: existingSessionFound.phone_number || "",

            // Map address so Step 2 inputs show the data
            address: {
                house: addr.house || "",
                street: addr.street || "",
                landmark: addr.landmark || "",
                city: addr.vtc || addr.district || "",
                district: addr.district || "",
                state: addr.state || "",
                pincode: addr.pincode || "",
                country: addr.country || "India"
            },

            aadhaarDetails: {
                ...prev.aadhaarDetails,
                aadhaar_number: aadhaarData.aadhaarNumber,
                name_on_aadhaar: existingSessionFound.name || "",
                dob: existingSessionFound.dob || "",
                gender: existingSessionFound.gender || "",
                full_address: existingSessionFound.aadhaar_data.full_address || "",
                is_otp_verified: true,
                timestamp: existingSessionFound.timestamp
            },
            isAadhaarVerified: true
        }));

        setVerificationStep('details_form');
        setStep(2);
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

    // Handle document checkbox changes
    const handleDocumentCheck = (docType, value) => {
        setFormData(prev => ({
            ...prev,
            documents: {
                ...prev.documents,
                [docType]: {
                    ...prev.documents[docType],
                    hasDocument: value
                }
            }
        }));
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
                'name', 'email', 'phone', 'occupation', 'monthlyIncome', 'panNumber'
            ];

            const missingFields = requiredFields.filter(field => {
                return !formData[field];
            });

            if (missingFields.length > 0) {
                throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
            }

            if (!primaryBranch) {
                throw new Error('Please select a primary branch');
            }

            // Validate documents - check if they have the documents
            const requiredDocs = ['panCard', 'addressProof'];
            const missingDocs = requiredDocs.filter(doc => !formData.documents[doc].hasDocument);
            if (missingDocs.length > 0) {
                throw new Error(`Please confirm that all required documents are provided: ${missingDocs.map(doc => doc.replace('Card', '')).join(', ')}`);
            }

            // Validate PAN number format
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (formData.panNumber && !panRegex.test(formData.panNumber)) {
                throw new Error('Please enter a valid PAN number (format: ABCDE1234F)');
            }

            // Prepare form data
            const payload = {
                ...formData,
                aadhaar_number: aadhaarData.aadhaarNumber, // 👈 CRITICAL: Backend needs this to find VerifiedAadhaar
                primaryBranch: primaryBranch,
            };

            const response = await createCustomerWithAadhaar(payload);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to create customer account');
            }

            // Update with backend generated IDs
            setFormData(prev => ({
                ...prev,
                customerId: response.data.data.customerId || "",
            }));

            showToast('success', 'Customer account created successfully!');
            setStep(5); // Move to success step

        } catch (error) {
            console.error('Error submitting form:', error);
            showToast('error', error.response?.data?.message || error.message || 'Failed to create customer account');
        } finally {
            setLoading(false);
        }
    };
    const handlePanChange = (e) => {
        let value = e.target.value.toUpperCase();

        // Allow only A–Z and 0–9
        value = value.replace(/[^A-Z0-9]/g, '');

        // Limit length to 10
        if (value.length > 10) return;

        // Enforce PAN structure while typing
        if (
            (value.length <= 5 && !/^[A-Z]*$/.test(value)) ||
            (value.length > 5 && value.length <= 9 && !/^[A-Z]{5}[0-9]*$/.test(value)) ||
            (value.length === 10 && !PAN_REGEX.test(value))
        ) {
            return;
        }

        setFormData(prev => ({
            ...prev,
            panNumber: value
        }));

        // Clear error while typing
        setPanError('');
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
                                {/* Check Existing Section */}
                                {existingSessionFound ? (
                                    <div className="existing-session-alert">
                                        <p>✅ <strong>Verified session found for {existingSessionFound.name}</strong></p>
                                        <button
                                            type="button"
                                            className="account-primary-button"
                                            onClick={resumeApplication}
                                            style={{ backgroundColor: '#28a745', marginBottom: '20px' }}
                                        >
                                            Continue Existing Application
                                        </button>
                                        <p style={{ fontSize: '0.8rem' }}>Or verify again below:</p>
                                    </div>
                                ) : null}
                                <form onSubmit={handleAadhaarInput}>
                                    <div className="account-form-group">
                                        <label htmlFor="aadhaarNumber">Enter Aadhaar Number <span className="required">*</span></label>
                                        <div className="aadhaar-input-wrapper">
                                            <input
                                                type="text"
                                                id="aadhaarNumber"
                                                name="aadhaarNumber"
                                                value={aadhaarData.aadhaarNumber}
                                                onChange={(e) => {
                                                    setAadhaarData(prev => ({ ...prev, aadhaarNumber: e.target.value }));
                                                    if (existingSessionFound) setExistingSessionFound(null);
                                                }}
                                                placeholder="Enter 12-digit Aadhaar number"
                                                required
                                                maxLength="12"
                                                pattern="\d{12}"
                                            />
                                            <small className="form-hint">Enter the 12-digit Aadhaar number without spaces</small>
                                        </div>
                                    </div>

                                    <div className="account-button-group">
                                        <button
                                            type="button"
                                            className="account-primary-button"
                                            onClick={handleCheckExistingApplication}
                                            disabled={isCheckingExisting || aadhaarData.aadhaarNumber.length !== 12}
                                        >
                                            {isCheckingExisting ? '...' : 'Check Saved'}
                                        </button>
                                        <button
                                            type="submit"
                                            className="account-primary-button"
                                            disabled={aadhaarLoading}
                                        >
                                            {aadhaarLoading ? "Sending OTP..." : "Send OTP"}
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
                                            onChange={(e) => setAadhaarData(prev => ({ ...prev, otp: e.target.value }))}
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
                                    Aadhaar Number: {aadhaarData.aadhaarNumber}<br />
                                    Name: {formData.name}<br />
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
                                    onChange={(e) => {
                                        let value = e.target.value.replace(/\D/g, ''); // remove non-digits

                                        // ❌ remove leading zero explicitly
                                        if (value.startsWith('0')) {
                                            value = value.replace(/^0+/, '');
                                        }

                                        // limit to 10 digits
                                        value = value.slice(0, 10);

                                        setFormData(prev => ({
                                            ...prev,
                                            phone: value
                                        }));
                                    }}
                                    maxLength={10}
                                    required
                                    placeholder="10-digit mobile number"
                                />


                            </div>

                            <div className="account-form-group">
                                <label htmlFor="panNumber">PAN Number <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="panNumber"
                                    name="panNumber"
                                    value={formData.panNumber}
                                    onChange={handlePanChange}
                                    maxLength={10}
                                    required
                                    placeholder="ABCDE1234F"
                                />

                                {panError && (
                                    <small className="account-error-message">{panError}</small>
                                )}


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
                                    style={{ textTransform: 'uppercase' }}
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

                            {/* Document Status - Checkboxes for document availability */}
                            <div className="account-form-section-title">Document Status</div>

                            <div className="account-form-group account-full-width">
                                <label className="account-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.documents.panCard.hasDocument}
                                        onChange={(e) => handleDocumentCheck('panCard', e.target.checked)}
                                    />
                                    <span className="account-checkbox-custom"></span>
                                    PAN Card Document Provided <span className="required">*</span>
                                </label>
                            </div>

                            <div className="account-form-group account-full-width">
                                <label className="account-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.documents.addressProof.hasDocument}
                                        onChange={(e) => handleDocumentCheck('addressProof', e.target.checked)}
                                    />
                                    <span className="account-checkbox-custom"></span>
                                    Address Proof Document Provided <span className="required">*</span>
                                </label>
                            </div>

                            <div className="account-form-group account-full-width">
                                <label className="account-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.documents.incomeProof.hasDocument}
                                        onChange={(e) => handleDocumentCheck('incomeProof', e.target.checked)}
                                    />
                                    <span className="account-checkbox-custom"></span>
                                    Income Proof Document Provided
                                </label>
                            </div>

                            <div className="account-form-group account-full-width">
                                <label className="account-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.documents.photo.hasDocument}
                                        onChange={(e) => handleDocumentCheck('photo', e.target.checked)}
                                    />
                                    <span className="account-checkbox-custom"></span>
                                    Passport Photo Provided <span className="required">*</span>
                                </label>
                            </div>

                            <div className="account-form-group account-full-width">
                                <label className="account-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.documents.signature.hasDocument}
                                        onChange={(e) => handleDocumentCheck('signature', e.target.checked)}
                                    />
                                    <span className="account-checkbox-custom"></span>
                                    Signature Provided <span className="required">*</span>
                                </label>
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
                                        <input type="checkbox" checked={kycVerifications.isAadhaarVerified} disabled />
                                            <span className="kyc-checkbox-custom"></span>
                                            Mark as Verified
                                        </label>
                                    </div>
                                </div>

                                <div className="kyc-verification-item">
                                    <div className="kyc-verification-info">
                                        <h4>PAN Card Verification</h4>
                                        <p>Document provided: {formData.documents.panCard.hasDocument ? 'Yes' : 'No'}</p>
                                        <p>PAN Number: {formData.panNumber || 'Not provided'}</p>
                                    </div>
                                    <div className="kyc-verification-status">
                                        <label className="kyc-checkbox-label">
                                        <input
  type="checkbox"
  checked={kycVerifications.isPanVerified}
  disabled
/>

                                            <span className="kyc-checkbox-custom"></span>
                                            {formData.documents.panCard.hasDocument ? 'Mark as Verified' : 'Document not provided'}
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
                                        <input type="checkbox" checked={kycVerifications.isPhoneVerified} disabled />
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
                                        <input type="checkbox" checked={kycVerifications.isEmailVerified} disabled />
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
                                        <p>Document provided: {formData.documents.addressProof.hasDocument ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div className="kyc-verification-status">
                                        <label className="kyc-checkbox-label">
                                        <input type="checkbox" checked={kycVerifications.isAddressVerified} disabled />
                                            <span className="kyc-checkbox-custom"></span>
                                            {formData.documents.addressProof.hasDocument ? 'Mark as Verified' : 'Document not provided'}
                                        </label>
                                    </div>
                                </div>

                                <div className="kyc-verification-item">
                                    <div className="kyc-verification-info">
                                        <h4>Income Proof Verification</h4>
                                        <p>Document provided: {formData.documents.incomeProof.hasDocument ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div className="kyc-verification-status">
                                        <label className="kyc-checkbox-label">
                                        <input type="checkbox" checked={kycVerifications.isIncomeVerified} disabled />
                                            <span className="kyc-checkbox-custom"></span>
                                            {formData.documents.incomeProof.hasDocument ? 'Mark as Verified' : 'Optional - mark if provided'}
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
                                    <span className="account-review-label">PAN Number:</span>
                                    <span className="account-review-value">{formData.panNumber}</span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Aadhaar Verified:</span>
                                    <span className={`account-review-value ${formData.isAadhaarVerified ? 'account-verified' : 'account-pending'}`}>
                                        {formData.isAadhaarVerified ? '✓ Verified' : '✗ Not Verified'}
                                    </span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Primary Branch:</span>
                                    <span className="account-review-value">
                                        {branchOptions.find(b => b._id === primaryBranch)?.branchName || 'Not selected'}
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

                        <div className="account-review-section">
                            <h3>Document Status</h3>
                            <div className="account-review-grid">
                                <div className="account-review-item">
                                    <span className="account-review-label">PAN Card Provided:</span>
                                    <span className={`account-review-value ${formData.documents.panCard.hasDocument ? 'account-verified' : 'account-pending'}`}>
                                        {formData.documents.panCard.hasDocument ? '✓ Yes' : '✗ No'}
                                    </span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Address Proof Provided:</span>
                                    <span className={`account-review-value ${formData.documents.addressProof.hasDocument ? 'account-verified' : 'account-pending'}`}>
                                        {formData.documents.addressProof.hasDocument ? '✓ Yes' : '✗ No'}
                                    </span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Income Proof Provided:</span>
                                    <span className={`account-review-value ${formData.documents.incomeProof.hasDocument ? 'account-verified' : 'account-pending'}`}>
                                        {formData.documents.incomeProof.hasDocument ? '✓ Yes' : '✗ No'}
                                    </span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Photo Provided:</span>
                                    <span className={`account-review-value ${formData.documents.photo.hasDocument ? 'account-verified' : 'account-pending'}`}>
                                        {formData.documents.photo.hasDocument ? '✓ Yes' : '✗ No'}
                                    </span>
                                </div>
                                <div className="account-review-item">
                                    <span className="account-review-label">Signature Provided:</span>
                                    <span className={`account-review-value ${formData.documents.signature.hasDocument ? 'account-verified' : 'account-pending'}`}>
                                        {formData.documents.signature.hasDocument ? '✓ Yes' : '✗ No'}
                                    </span>
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
                            <p>Customer Details:</p>
                            <div className="account-success-details">
                                <div className="account-success-detail">
                                    <span className="account-success-label">Customer ID:</span>
                                    <span className="account-success-value">{formData.customerId}</span>
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
                                    <span className="account-success-label">PAN Number:</span>
                                    <span className="account-success-value">{formData.panNumber}</span>
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
                                        panNumber: "",
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
                                            aadhaarCard: { hasDocument: true, verified: false },
                                            panCard: { hasDocument: false, verified: false },
                                            addressProof: { hasDocument: false, verified: false },
                                            incomeProof: { hasDocument: false, verified: false },
                                            photo: { hasDocument: false },
                                            signature: { hasDocument: false }
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
                                        referenceNumber: `TWGL${Math.floor(Math.random() * 1000000)}`
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