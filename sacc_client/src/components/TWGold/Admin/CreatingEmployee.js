import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../TWGLogin/axiosConfig';
import './creating_employee.css';
import Navbar from './Navbar';
import { encryptData, decryptData, clearEncryptedData } from '../utils/encryption';

const CreatingEmployee = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Step 1: Aadhaar Verification
  const [aadhaarData, setAadhaarData] = useState({
    aadhaar_number: '',
    phone_number: '',
    email_id: ''
  });
  const [otp, setOtp] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  // Step 2: Aadhaar Details (from verification)
  const [aadhaarDetails, setAadhaarDetails] = useState(null);

  // Step 3: Employee Details
  const [employeeData, setEmployeeData] = useState({
    email: '',
    password: '',
    name: '',
    employeeId: '',
    position: '',
    department: '',
    manager: '',
    salary: '',
    joinDate: '',
    skills: [],
    responsibilities: [],
    permissions: [],
    assignedBranch: '',
    contactNumber: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    shiftTiming: {
      start: '',
      end: ''
    },
    certification: [],
    maxLoanApprovalLimit: ''
  });

  // Step 4: Review Data
  const [managers, setManagers] = useState([]);

  // Form validation errors
  const [errors, setErrors] = useState({});

  // New state for saved applications
  const [savedApplications, setSavedApplications] = useState([]);
  const [showSavedApplications, setShowSavedApplications] = useState(false);
  const [applicationIdCounter, setApplicationIdCounter] = useState(1);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);

  // Time constants for 7-day storage
  const SEVEN_DAYS = useMemo(() => 7 * 24 * 60 * 60 * 1000, []);

  const STORAGE_KEYS = useMemo(() => ({
    VERIFICATION_SESSION: 'aadhaar_verification_session',
    EMPLOYEE_DATA: 'employee_form_data',
    SAVED_APPLICATIONS: 'employee_saved_applications',
    APPLICATION_ID_COUNTER: 'employee_application_id_counter'
  }), []);

  // Clear all storage
  const clearStorage = useCallback(() => {
    clearEncryptedData(STORAGE_KEYS.VERIFICATION_SESSION);
    clearEncryptedData(STORAGE_KEYS.EMPLOYEE_DATA);
  }, [STORAGE_KEYS.VERIFICATION_SESSION, STORAGE_KEYS.EMPLOYEE_DATA]);

   const resetForm = useCallback(() => {
  setCurrentStep(1);
  setAadhaarData({ aadhaar_number: '', phone_number: '', email_id: '' });
  setOtp('');
  setReferenceId('');
  setOtpSent(false);
  setTimer(0);
  setAadhaarDetails(null);
  setEmployeeData({
    email: '',
    password: '',
    name: '',
    employeeId: '',
    position: '',
    department: '',
    manager: '',
    salary: '',
    joinDate: '',
    skills: [],
    responsibilities: [],
    permissions: [],
    assignedBranch: '',
    contactNumber: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    shiftTiming: {
      start: '',
      end: ''
    },
    certification: [],
    maxLoanApprovalLimit: ''
  });
  setSelectedApplicationId(null);
  clearStorage();
  setError('');
}, [clearStorage]);

  // Load saved applications
  const loadSavedApplications = useCallback(() => {
    try {
      const savedApps = localStorage.getItem(STORAGE_KEYS.SAVED_APPLICATIONS);
      if (savedApps) {
        const parsed = JSON.parse(savedApps);
        // Filter out expired applications (older than 7 days)
        const validApps = parsed.filter(app => {
          const appAge = Date.now() - (app.timestamp || 0);
          return appAge < SEVEN_DAYS;
        });
        setSavedApplications(validApps);
        
        // Save back filtered list
        if (validApps.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEYS.SAVED_APPLICATIONS, JSON.stringify(validApps));
        }
      }
      
      // Load application ID counter
      const counter = localStorage.getItem(STORAGE_KEYS.APPLICATION_ID_COUNTER);
      if (counter) {
        setApplicationIdCounter(parseInt(counter));
      }
    } catch (error) {
      console.error('Error loading saved applications:', error);
      setSavedApplications([]);
    }
  }, [STORAGE_KEYS.SAVED_APPLICATIONS, STORAGE_KEYS.APPLICATION_ID_COUNTER, SEVEN_DAYS]);

  // Save current application
  const saveCurrentApplication = useCallback(() => {
    try {
      const applicationId = selectedApplicationId || `app_${applicationIdCounter}`;
      const applicationData = {
        id: applicationId,
        name: employeeData.name || 'Unnamed Application',
        aadhaarNumber: aadhaarData.aadhaar_number,
        step: currentStep,
        aadhaarData,
        referenceId,
        otpSent,
        aadhaarDetails,
        employeeData,
        timestamp: Date.now()
      };

      // Update saved applications
      const updatedApplications = savedApplications.filter(app => app.id !== applicationId);
      updatedApplications.push(applicationData);
      
      setSavedApplications(updatedApplications);
      localStorage.setItem(STORAGE_KEYS.SAVED_APPLICATIONS, JSON.stringify(updatedApplications));

      // Update counter if new application
      if (!selectedApplicationId) {
        const newCounter = applicationIdCounter + 1;
        setApplicationIdCounter(newCounter);
        localStorage.setItem(STORAGE_KEYS.APPLICATION_ID_COUNTER, newCounter.toString());
      }

      return applicationId;
    } catch (error) {
      console.error('Error saving application:', error);
      return null;
    }
  }, [selectedApplicationId, applicationIdCounter, employeeData, aadhaarData, currentStep, referenceId, otpSent, aadhaarDetails, savedApplications, STORAGE_KEYS.SAVED_APPLICATIONS, STORAGE_KEYS.APPLICATION_ID_COUNTER]);

  // Load saved application
  const loadSavedApplication = useCallback((applicationId) => {
    try {
      const application = savedApplications.find(app => app.id === applicationId);
      if (application) {
        setAadhaarData(application.aadhaarData || {});
        if (application.referenceId) setReferenceId(application.referenceId);
        if (application.otpSent) setOtpSent(application.otpSent);
        if (application.aadhaarDetails) setAadhaarDetails(application.aadhaarDetails);
        if (application.employeeData) setEmployeeData(application.employeeData);
        if (application.step) setCurrentStep(application.step);
        setSelectedApplicationId(applicationId);
        
        // Start OTP timer if needed
        if (application.otpSent) {
          const elapsed = Math.floor((Date.now() - (application.timestamp || Date.now())) / 1000);
          if (elapsed < 60) {
            setTimer(60 - elapsed);
          }
        }
        
        setShowSavedApplications(false);
        setError('');
      }
    } catch (error) {
      console.error('Error loading application:', error);
      setError('Failed to load application');
    }
  }, [savedApplications]);

  // Delete saved application
  const deleteSavedApplication = useCallback((applicationId, e) => {
    e.stopPropagation(); // Prevent triggering load
    try {
      const updatedApplications = savedApplications.filter(app => app.id !== applicationId);
      setSavedApplications(updatedApplications);
      localStorage.setItem(STORAGE_KEYS.SAVED_APPLICATIONS, JSON.stringify(updatedApplications));
      
      // If deleting currently selected app, reset form
      if (selectedApplicationId === applicationId) {
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      setError('Failed to delete application');
    }
  }, [savedApplications, selectedApplicationId, STORAGE_KEYS.SAVED_APPLICATIONS, resetForm]);


  // Load saved data on component mount
  useEffect(() => {
    const loadSavedData = () => {
      try {
        // Load saved applications first
        loadSavedApplications();

        // Check if we have any saved data
        const hasSavedSession = localStorage.getItem(STORAGE_KEYS.VERIFICATION_SESSION);
        const hasSavedEmployeeData = localStorage.getItem(STORAGE_KEYS.EMPLOYEE_DATA);
        const hasSavedApplications = localStorage.getItem(STORAGE_KEYS.SAVED_APPLICATIONS);

        if (!hasSavedSession && !hasSavedEmployeeData && !hasSavedApplications) {
          // No saved data, ensure we're at step 1
          setCurrentStep(1);
          return;
        }

        // Load verification session
        const savedSession = localStorage.getItem(STORAGE_KEYS.VERIFICATION_SESSION);
        if (savedSession) {
          const decryptedSession = decryptData(savedSession);
          if (decryptedSession) {
            const sessionAge = Date.now() - (decryptedSession.timestamp || 0);
            
            if (sessionAge < SEVEN_DAYS) {
              setAadhaarData(decryptedSession.aadhaarData || {});
              if (decryptedSession.referenceId) setReferenceId(decryptedSession.referenceId);
              if (decryptedSession.otpSent) setOtpSent(decryptedSession.otpSent);
              if (decryptedSession.aadhaarDetails) setAadhaarDetails(decryptedSession.aadhaarDetails);
              if (decryptedSession.currentStep && decryptedSession.currentStep > 1) {
                setCurrentStep(decryptedSession.currentStep);
              }
              
              // Start OTP timer if needed
              if (decryptedSession.timerStart) {
                const elapsed = Math.floor((Date.now() - decryptedSession.timerStart) / 1000);
                if (elapsed < 60) {
                  setTimer(60 - elapsed);
                }
              }
            } else {
              clearEncryptedData(STORAGE_KEYS.VERIFICATION_SESSION);
            }
          }
        }

        // Load employee form data
        const savedEmployeeData = localStorage.getItem(STORAGE_KEYS.EMPLOYEE_DATA);
        if (savedEmployeeData) {
          const decryptedData = decryptData(savedEmployeeData);
          if (decryptedData && decryptedData.timestamp) {
            const dataAge = Date.now() - decryptedData.timestamp;
            
            if (dataAge < SEVEN_DAYS) {
              setEmployeeData(prev => ({
                ...prev,
                ...decryptedData.employeeData
              }));
            } else {
              clearEncryptedData(STORAGE_KEYS.EMPLOYEE_DATA);
            }
          }
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
        clearStorage();
      }
    };

    loadSavedData();
  }, [STORAGE_KEYS.VERIFICATION_SESSION, STORAGE_KEYS.EMPLOYEE_DATA, STORAGE_KEYS.SAVED_APPLICATIONS, SEVEN_DAYS, clearStorage, loadSavedApplications]);

  const saveVerificationSession = useCallback(() => {
    try {
      const sessionData = {
        aadhaarData,
        referenceId,
        otpSent,
        aadhaarDetails,
        currentStep,
        timerStart: otpSent ? Date.now() - (60 - timer) * 1000 : null,
        timestamp: Date.now()
      };
      
      const encrypted = encryptData(sessionData);
      if (encrypted) {
        localStorage.setItem(STORAGE_KEYS.VERIFICATION_SESSION, encrypted);
      }
    } catch (error) {
      console.error('Error saving verification session:', error);
    }
  }, [aadhaarData, referenceId, otpSent, aadhaarDetails, currentStep, timer, STORAGE_KEYS.VERIFICATION_SESSION]);

  const saveEmployeeData = useCallback(() => {
    try {
      const dataToSave = {
        employeeData,
        timestamp: Date.now()
      };
      
      const encrypted = encryptData(dataToSave);
      if (encrypted) {
        localStorage.setItem(STORAGE_KEYS.EMPLOYEE_DATA, encrypted);
      }
    } catch (error) {
      console.error('Error saving employee data:', error);
    }
  }, [employeeData, STORAGE_KEYS.EMPLOYEE_DATA]);

  useEffect(() => {
    if (currentStep >= 3 && employeeData.name) {
      saveEmployeeData();
    }
  }, [currentStep, employeeData, saveEmployeeData]);

  useEffect(() => {
    if (currentStep > 1) {
      saveVerificationSession();
    }
  }, [aadhaarData, referenceId, otpSent, aadhaarDetails, currentStep, timer, saveVerificationSession]);

  // Timer for OTP
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Fetch managers list
  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await api.get('/twgoldlogin/managers');
  
      if (response.data && response.data.success && response.data.data && response.data.data.managers) {
        const formattedManagers = response.data.data.managers.map(manager => ({
          _id: manager.id || manager._id,
          id: manager.id || manager._id,
          employeeId: manager.id || manager._id,
          name: manager.user?.name || 'Unknown',
          email: manager.user?.email || '',
          department: manager.department || 'No Department',
          role: manager.user?.role || '',
          teamSize: manager.teamSize || 0,
          fullName: manager.user?.name || 'Unknown'
        }));
        
        setManagers(formattedManagers);
        setError('');
      } else if (response.data && Array.isArray(response.data.managers)) {
        const formattedManagers = response.data.managers.map(manager => ({
          _id: manager.id || manager._id,
          id: manager.id || manager._id,
          employeeId: manager.id || manager._id,
          name: manager.user?.name || manager.name || 'Unknown',
          email: manager.user?.email || manager.email || '',
          department: manager.department || 'No Department',
          fullName: manager.user?.name || manager.name || 'Unknown'
        }));
        
        setManagers(formattedManagers);
        setError('');
      } else {
        console.warn('Unexpected API response format:', response.data);
        setManagers([]);
        setError('Unexpected response format from server');
      }
  
    } catch (error) {
      console.error('Error fetching managers:', error);
      setError('Failed to fetch managers list');
      setManagers([]);
    }
  };

  // Step 1: Generate Aadhaar OTP
  const generateAadhaarOtp = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.post('/twgoldlogin/employee/aadhaar/generate-otp', aadhaarData);

      if (response.data.success) {
        setReferenceId(response.data.reference_id);
        setOtpSent(true);
        setTimer(60);
        setError('');
        // Save application when OTP is sent
        saveCurrentApplication();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to generate OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Verify Aadhaar OTP
  const verifyAadhaarOtp = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.post('/twgoldlogin/employee/aadhaar/verify-otp', {
        aadhaar_number: aadhaarData.aadhaar_number,
        otp: otp,
        reference_id: referenceId
      });

      if (response.data.success) {
        setAadhaarDetails(response.data.aadhaar_data);
        setCurrentStep(2);
        setError('');
        
        saveVerificationSession();
        // Update saved application
        saveCurrentApplication();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Create Employee
  const createEmployee = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.post('/twgoldlogin/employee/create-with-aadhaar', {
        ...employeeData,
        aadhaar_number: aadhaarData.aadhaar_number
      });

      if (response.data.success) {
        setSuccess(true);
        setCurrentStep(5);
        // Clear storage and remove saved application on success
        clearStorage();
        if (selectedApplicationId) {
          const updatedApplications = savedApplications.filter(app => app.id !== selectedApplicationId);
          setSavedApplications(updatedApplications);
          localStorage.setItem(STORAGE_KEYS.SAVED_APPLICATIONS, JSON.stringify(updatedApplications));
          setSelectedApplicationId(null);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };




  // Handle input changes
  const handleAadhaarInputChange = (field, value) => {
    setAadhaarData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmployeeInputChange = (field, value) => {
    setEmployeeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmergencyContactChange = (field, value) => {
    setEmployeeData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value
      }
    }));
  };

  const handleShiftTimingChange = (field, value) => {
    setEmployeeData(prev => ({
      ...prev,
      shiftTiming: {
        ...prev.shiftTiming,
        [field]: value
      }
    }));
  };

  // Validation functions
  const validateStep1 = () => {
    const newErrors = {};
    if (!aadhaarData.aadhaar_number.match(/^\d{12}$/)) {
      newErrors.aadhaar_number = 'Aadhaar must be 12 digits';
    }
    if (!aadhaarData.phone_number.match(/^\d{10}$/)) {
      newErrors.phone_number = 'Phone must be 10 digits';
    }
    if (aadhaarData.email_id && !aadhaarData.email_id.match(/^\S+@\S+\.\S+$/)) {
      newErrors.email_id = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!employeeData.email) newErrors.email = 'Email is required';
    if (!employeeData.password) newErrors.password = 'Password is required';
    if (!employeeData.name) newErrors.name = 'Name is required';
    if (!employeeData.employeeId) newErrors.employeeId = 'Employee ID is required';
    if (!employeeData.position) newErrors.position = 'Position is required';
    if (!employeeData.department) newErrors.department = 'Department is required';
    if (!employeeData.manager) newErrors.manager = 'Manager is required';
    if (!employeeData.assignedBranch) newErrors.assignedBranch = 'Branch is required';
    if (!employeeData.contactNumber) newErrors.contactNumber = 'Contact number is required';
    if (!employeeData.emergencyContact.name) newErrors.emergencyName = 'Emergency contact name is required';
    if (!employeeData.emergencyContact.relationship) newErrors.emergencyRelationship = 'Relationship is required';
    if (!employeeData.emergencyContact.phone) newErrors.emergencyPhone = 'Emergency phone is required';
    if (!employeeData.shiftTiming.start) newErrors.shiftStart = 'Shift start time is required';
    if (!employeeData.shiftTiming.end) newErrors.shiftEnd = 'Shift end time is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      if (otpSent) {
        verifyAadhaarOtp();
      } else {
        generateAadhaarOtp();
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
      saveCurrentApplication();
    } else if (currentStep === 3 && validateStep3()) {
      setCurrentStep(4);
      saveCurrentApplication();
    } else if (currentStep === 4) {
      createEmployee();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      saveCurrentApplication();
    }
  };

  // Resend OTP
  const resendOtp = () => {
    if (timer === 0) {
      generateAadhaarOtp();
    }
  };

  // New: Save data and get back to add another employee
  const saveAndAddAnother = () => {
    const appId = saveCurrentApplication();
    if (appId) {
      setSuccess(false);
      resetForm();
      setShowSavedApplications(true);
    }
  };

  // New: Clear all data and move to step 1
  const clearAllAndStartNew = () => {
    // Remove from saved applications
    if (selectedApplicationId) {
      const updatedApplications = savedApplications.filter(app => app.id !== selectedApplicationId);
      setSavedApplications(updatedApplications);
      localStorage.setItem(STORAGE_KEYS.SAVED_APPLICATIONS, JSON.stringify(updatedApplications));
    }
    
    resetForm();
    setShowSavedApplications(false);
  };

  // Render saved applications list
  const renderSavedApplications = () => (
    <div className="creating-employee-saved-applications">
      <h3>Continue Existing Application</h3>
      <p>Select an application to continue from where you left off:</p>
      
      {savedApplications.length === 0 ? (
        <div className="creating-employee-no-applications">
          <p>No saved applications found.</p>
          <button
            className="creating-employee-button creating-employee-button-primary"
            onClick={() => setShowSavedApplications(false)}
          >
            Start New Application
          </button>
        </div>
      ) : (
        <div className="creating-employee-applications-list">
          {savedApplications.map(app => (
            <div 
              key={app.id} 
              className="creating-employee-application-card"
              onClick={() => loadSavedApplication(app.id)}
            >
              <div className="creating-employee-application-info">
                <h4>{app.name}</h4>
                <p>Aadhaar: {app.aadhaarNumber ? `${app.aadhaarNumber.substring(0, 4)}XXXX${app.aadhaarNumber.substring(8)}` : 'Not entered'}</p>
                <p>Last saved: {new Date(app.timestamp).toLocaleString()}</p>
                <p>Current step: {app.step === 1 ? 'Aadhaar Verification' : 
                                 app.step === 2 ? 'Verified Details' : 
                                 app.step === 3 ? 'Employee Details' : 
                                 'Review & Submit'}</p>
              </div>
              <div className="creating-employee-application-actions">
                <button
                  className="creating-employee-button creating-employee-button-primary"
                  onClick={() => loadSavedApplication(app.id)}
                >
                  Continue
                </button>
                <button
                  className="creating-employee-button creating-employee-button-secondary"
                  onClick={(e) => deleteSavedApplication(app.id, e)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          <div className="creating-employee-applications-footer">
            <button
              className="creating-employee-button creating-employee-button-secondary"
              onClick={() => setShowSavedApplications(false)}
            >
              Start New Application
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Render steps (existing functions remain the same)
  const renderStep1 = () => (
    <div className="creating-employee-form-step">
      {showSavedApplications ? (
        renderSavedApplications()
      ) : (
        <>
          <div className="creating-employee-form-section">
            <h3>Aadhaar Verification</h3>
            <p>Enter employee's Aadhaar details to verify identity</p>

            {savedApplications.length > 0 && (
              <div className="creating-employee-continue-existing">
                <button
                  className="creating-employee-button creating-employee-button-secondary"
                  onClick={() => setShowSavedApplications(true)}
                >
                  Continue Existing Application ({savedApplications.length})
                </button>
              </div>
            )}

            <div className="creating-employee-form-group">
              <label className="creating-employee-form-label">Aadhaar Number *</label>
              <input
                type="text"
                className={`creating-employee-form-input ${errors.aadhaar_number ? 'error' : ''}`}
                value={aadhaarData.aadhaar_number}
                onChange={(e) => handleAadhaarInputChange('aadhaar_number', e.target.value)}
                placeholder="Enter 12-digit Aadhaar number"
                maxLength="12"
                disabled={otpSent}
              />
              {errors.aadhaar_number && <span className="creating-employee-form-error">{errors.aadhaar_number}</span>}
            </div>

            {/* Rest of the Step 1 form remains the same */}
            <div className="creating-employee-form-group">
              <label className="creating-employee-form-label">Registered Mobile Number *</label>
              <input
                type="text"
                className={`creating-employee-form-input ${errors.phone_number ? 'error' : ''}`}
                value={aadhaarData.phone_number}
                onChange={(e) => handleAadhaarInputChange('phone_number', e.target.value)}
                placeholder="Enter registered mobile number"
                maxLength="10"
                disabled={otpSent}
              />
              {errors.phone_number && <span className="creating-employee-form-error">{errors.phone_number}</span>}
            </div>

            <div className="creating-employee-form-group">
              <label className="creating-employee-form-label">Email ID</label>
              <input
                type="email"
                className={`creating-employee-form-input ${errors.email_id ? 'error' : ''}`}
                value={aadhaarData.email_id}
                onChange={(e) => handleAadhaarInputChange('email_id', e.target.value)}
                placeholder="Enter email address (optional)"
                disabled={otpSent}
              />
              {errors.email_id && <span className="creating-employee-form-error">{errors.email_id}</span>}
            </div>

            {otpSent && (
              <div className="creating-employee-otp-section">
                <h4>Enter OTP</h4>
                <p>OTP sent to registered mobile number ending with {aadhaarData.phone_number.slice(-2)}</p>

                <div className="creating-employee-otp-input-container">
                  {Array.from({ length: 6 }, (_, index) => (
                    <input
                      key={index}
                      type="text"
                      className="creating-employee-otp-input"
                      value={otp[index] || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        if (value) {
                          const otpArray = otp.split('');
                          otpArray[index] = value;
                          const newOtp = otpArray.join('').slice(0, 6);
                          setOtp(newOtp);

                          if (index < 5) {
                            const nextInput = document.querySelectorAll('.creating-employee-otp-input')[index + 1];
                            if (nextInput) nextInput.focus();
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace') {
                          if (!otp[index] && index > 0) {
                            const prevInput = document.querySelectorAll('.creating-employee-otp-input')[index - 1];
                            if (prevInput) prevInput.focus();

                            const otpArray = otp.split('');
                            otpArray[index - 1] = '';
                            setOtp(otpArray.join(''));
                          } else if (otp[index]) {
                            const otpArray = otp.split('');
                            otpArray[index] = '';
                            setOtp(otpArray.join(''));
                          }
                        }

                        if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          navigator.clipboard.readText().then((pastedText) => {
                            const cleanText = pastedText.replace(/[^0-9]/g, '').slice(0, 6);
                            setOtp(cleanText);

                            const inputs = document.querySelectorAll('.creating-employee-otp-input');
                            if (cleanText.length === 6 && inputs[5]) {
                              inputs[5].focus();
                            }
                          });
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pastedText = e.clipboardData.getData('text');
                        const cleanText = pastedText.replace(/[^0-9]/g, '').slice(0, 6);
                        setOtp(cleanText);
                      }}
                      maxLength="1"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>

                <div className="creating-employee-timer-container">
                  {timer > 0 && (
                    <div className="creating-employee-timer">
                      Resend OTP in {timer} seconds
                    </div>
                  )}

                  <button
                    className="creating-employee-resend-otp"
                    onClick={resendOtp}
                    disabled={timer > 0}
                  >
                    {timer > 0 ? 'Resend OTP' : 'Resend OTP Now'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="creating-employee-form-step">
      <div className="creating-employee-form-section">
        <h3>Verified Aadhaar Details</h3>

        {aadhaarDetails && (
          <div className="creating-employee-aadhaar-details">
            <h4>Aadhaar Verified Successfully</h4>
            <div className="creating-employee-detail-grid">
              <div className="creating-employee-detail-item">
                <span className="creating-employee-detail-label">Full Name</span>
                <span className="creating-employee-detail-value">{aadhaarDetails.name}</span>
              </div>
              <div className="creating-employee-detail-item">
                <span className="creating-employee-detail-label">Date of Birth</span>
                <span className="creating-employee-detail-value">{aadhaarDetails.dob}</span>
              </div>
              <div className="creating-employee-detail-item">
                <span className="creating-employee-detail-label">Gender</span>
                <span className="creating-employee-detail-value">
                  {aadhaarDetails.gender === 'M' ? 'Male' : aadhaarDetails.gender === 'F' ? 'Female' : 'Transgender'}
                </span>
              </div>
              <div className="creating-employee-detail-item">
                <span className="creating-employee-detail-label">Aadhaar Number</span>
                <span className="creating-employee-detail-value">{aadhaarDetails.masked_aadhaar}</span>
              </div>
              <div className="creating-employee-detail-item" style={{ gridColumn: '1 / -1' }}>
                <span className="creating-employee-detail-label">Address</span>
                <span className="creating-employee-detail-value">{aadhaarDetails.full_address}</span>
              </div>
            </div>
          </div>
        )}

        <p>All Aadhaar details have been verified and will be stored securely with the employee record.</p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="creating-employee-form-step">
      <div className="creating-employee-form-section">
        <h3>Employee Details</h3>

        <div className="creating-employee-form-row">
          <div className="creating-employee-form-group">
            <label className="creating-employee-form-label">Email Address *</label>
            <input
              type="email"
              className={`creating-employee-form-input ${errors.email ? 'error' : ''}`}
              value={employeeData.email}
              onChange={(e) => handleEmployeeInputChange('email', e.target.value)}
              placeholder="employee@company.com"
            />
            {errors.email && <span className="creating-employee-form-error">{errors.email}</span>}
          </div>

          <div className="creating-employee-form-group">
            <label className="creating-employee-form-label">Password *</label>
            <input
              type="password"
              className={`creating-employee-form-input ${errors.password ? 'error' : ''}`}
              value={employeeData.password}
              onChange={(e) => handleEmployeeInputChange('password', e.target.value)}
              placeholder="Set password"
            />
            {errors.password && <span className="creating-employee-form-error">{errors.password}</span>}
          </div>
        </div>

        <div className="creating-employee-form-row">
          <div className="creating-employee-form-group">
            <label className="creating-employee-form-label">Full Name *</label>
            <input
              type="text"
              className={`creating-employee-form-input ${errors.name ? 'error' : ''}`}
              value={employeeData.name}
              onChange={(e) => handleEmployeeInputChange('name', e.target.value)}
              placeholder="Employee full name"
            />
            {errors.name && <span className="creating-employee-form-error">{errors.name}</span>}
          </div>

          <div className="creating-employee-form-group">
            <label className="creating-employee-form-label">Employee ID *</label>
            <input
              type="text"
              className={`creating-employee-form-input ${errors.employeeId ? 'error' : ''}`}
              value={employeeData.employeeId}
              onChange={(e) => handleEmployeeInputChange('employeeId', e.target.value)}
              placeholder="EMP001"
            />
            {errors.employeeId && <span className="creating-employee-form-error">{errors.employeeId}</span>}
          </div>
        </div>

        <div className="creating-employee-form-row">
          <div className="creating-employee-form-group">
            <label className="creating-employee-form-label">Position *</label>
            <select
              className={`creating-employee-form-select ${errors.position ? 'error' : ''}`}
              value={employeeData.position}
              onChange={(e) => handleEmployeeInputChange('position', e.target.value)}
            >
              <option value="">Select Position</option>
              <option value="Gold Appraiser">Gold Appraiser</option>
              <option value="Loan Officer">Loan Officer</option>
              <option value="Branch Manager">Branch Manager</option>
              <option value="Customer Service Representative">Customer Service Representative</option>
              <option value="Gold Valuation Expert">Gold Valuation Expert</option>
              <option value="Risk Assessment Officer">Risk Assessment Officer</option>
              <option value="Document Verification Specialist">Document Verification Specialist</option>
              <option value="Recovery Agent">Recovery Agent</option>
              <option value="Operations Manager">Operations Manager</option>
              <option value="Sales Executive">Sales Executive</option>
            </select>
            {errors.position && <span className="creating-employee-form-error">{errors.position}</span>}
          </div>

          <div className="creating-employee-form-group">
            <label className="creating-employee-form-label">Department *</label>
            <select
              className={`creating-employee-form-select ${errors.department ? 'error' : ''}`}
              value={employeeData.department}
              onChange={(e) => handleEmployeeInputChange('department', e.target.value)}
            >
              <option value="">Select Department</option>
              <option value="Operations">Operations</option>
              <option value="Sales & Marketing">Sales & Marketing</option>
              <option value="Risk Management">Risk Management</option>
              <option value="Customer Service">Customer Service</option>
              <option value="Valuation">Valuation</option>
              <option value="Recovery">Recovery</option>
              <option value="Administration">Administration</option>
              <option value="Finance">Finance</option>
            </select>
            {errors.department && <span className="creating-employee-form-error">{errors.department}</span>}
          </div>
        </div>

        <div className="creating-employee-form-group">
  <label className="creating-employee-form-label">Manager *</label>
  <select
    className={`creating-employee-form-select ${errors.manager ? 'error' : ''}`}
    value={employeeData.manager}
    onChange={(e) => handleEmployeeInputChange('manager', e.target.value)}
    disabled={managers.length === 0}
  >
    <option value="">Select Manager</option>
    {managers.length > 0 ? (
      managers.map(manager => (
        <option key={manager._id} value={manager._id}>
          {manager.name} - {manager.department}
        </option>
      ))
    ) : (
      <option value="" disabled>
        {error ? 'Failed to load managers' : 'Loading managers...'}
      </option>
    )}
  </select>
  {errors.manager && <span className="creating-employee-form-error">{errors.manager}</span>}
  {managers.length === 0 && !error && (
    <span className="creating-employee-form-info">Loading managers...</span>
  )}
  {managers.length === 0 && error && (
    <span className="creating-employee-form-error">Failed to load managers</span>
  )}
</div>
        <div className="creating-employee-form-row">
          <div className="creating-employee-form-group">
            <label className="creating-employee-form-label">Salary</label>
            <input
              type="number"
              className="creating-employee-form-input"
              value={employeeData.salary}
              onChange={(e) => handleEmployeeInputChange('salary', e.target.value)}
              placeholder="Monthly salary"
            />
          </div>

          <div className="creating-employee-form-group">
            <label className="creating-employee-form-label">Join Date</label>
            <input
              type="date"
              className="creating-employee-form-input"
              value={employeeData.joinDate}
              onChange={(e) => handleEmployeeInputChange('joinDate', e.target.value)}
            />
          </div>
        </div>

        <div className="creating-employee-form-row">
          <div className="creating-employee-form-group">
            <label className="creating-employee-form-label">Contact Number *</label>
            <input
              type="text"
              className={`creating-employee-form-input ${errors.contactNumber ? 'error' : ''}`}
              value={employeeData.contactNumber}
              onChange={(e) => handleEmployeeInputChange('contactNumber', e.target.value)}
              placeholder="Contact number"
              maxLength="10"
            />
            {errors.contactNumber && <span className="creating-employee-form-error">{errors.contactNumber}</span>}
          </div>

          <div className="creating-employee-form-group">
            <label className="creating-employee-form-label">Max Loan Approval Limit</label>
            <input
              type="number"
              className="creating-employee-form-input"
              value={employeeData.maxLoanApprovalLimit}
              onChange={(e) => handleEmployeeInputChange('maxLoanApprovalLimit', e.target.value)}
              placeholder="Loan approval limit"
            />
          </div>
        </div>

        <div className="creating-employee-form-section">
          <h4>Emergency Contact</h4>
          <div className="creating-employee-form-row">
            <div className="creating-employee-form-group">
              <label className="creating-employee-form-label">Name *</label>
              <input
                type="text"
                className={`creating-employee-form-input ${errors.emergencyName ? 'error' : ''}`}
                value={employeeData.emergencyContact.name}
                onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                placeholder="Emergency contact name"
              />
              {errors.emergencyName && <span className="creating-employee-form-error">{errors.emergencyName}</span>}
            </div>

            <div className="creating-employee-form-group">
              <label className="creating-employee-form-label">Relationship *</label>
              <input
                type="text"
                className={`creating-employee-form-input ${errors.emergencyRelationship ? 'error' : ''}`}
                value={employeeData.emergencyContact.relationship}
                onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                placeholder="Father/Mother/Spouse etc."
              />
              {errors.emergencyRelationship && <span className="creating-employee-form-error">{errors.emergencyRelationship}</span>}
            </div>
          </div>

          <div className="creating-employee-form-group">
            <label className="creating-employee-form-label">Phone Number *</label>
            <input
              type="text"
              className={`creating-employee-form-input ${errors.emergencyPhone ? 'error' : ''}`}
              value={employeeData.emergencyContact.phone}
              onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
              placeholder="Emergency contact number"
              maxLength="10"
            />
            {errors.emergencyPhone && <span className="creating-employee-form-error">{errors.emergencyPhone}</span>}
          </div>
        </div>

        <div className="creating-employee-form-section">
          <h4>Shift Timing</h4>
          <div className="creating-employee-form-row">
            <div className="creating-employee-form-group">
              <label className="creating-employee-form-label">Start Time *</label>
              <input
                type="time"
                className={`creating-employee-form-input ${errors.shiftStart ? 'error' : ''}`}
                value={employeeData.shiftTiming.start}
                onChange={(e) => handleShiftTimingChange('start', e.target.value)}
              />
              {errors.shiftStart && <span className="creating-employee-form-error">{errors.shiftStart}</span>}
            </div>

            <div className="creating-employee-form-group">
              <label className="creating-employee-form-label">End Time *</label>
              <input
                type="time"
                className={`creating-employee-form-input ${errors.shiftEnd ? 'error' : ''}`}
                value={employeeData.shiftTiming.end}
                onChange={(e) => handleShiftTimingChange('end', e.target.value)}
              />
              {errors.shiftEnd && <span className="creating-employee-form-error">{errors.shiftEnd}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="creating-employee-form-step">
      <div className="creating-employee-form-section">
        <h3>Review & Submit</h3>
        <p>Please review all details before creating the employee</p>

        <div className="creating-employee-review-section">
          <h4>Personal Information</h4>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Full Name</span>
            <span className="creating-employee-review-value">{employeeData.name}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Email</span>
            <span className="creating-employee-review-value">{employeeData.email}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Employee ID</span>
            <span className="creating-employee-review-value">{employeeData.employeeId}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Contact Number</span>
            <span className="creating-employee-review-value">{employeeData.contactNumber}</span>
          </div>
        </div>

        <div className="creating-employee-review-section">
          <h4>Employment Details</h4>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Position</span>
            <span className="creating-employee-review-value">{employeeData.position}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Department</span>
            <span className="creating-employee-review-value">{employeeData.department}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Assigned Branch</span>
            <span className="creating-employee-review-value">{employeeData.assignedBranch}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Salary</span>
            <span className="creating-employee-review-value">₹{employeeData.salary || '0'}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Join Date</span>
            <span className="creating-employee-review-value">
              {employeeData.joinDate ? new Date(employeeData.joinDate).toLocaleDateString() : 'Not specified'}
            </span>
          </div>
        </div>

        <div className="creating-employee-review-section">
          <h4>Aadhaar Verification</h4>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Aadhaar Number</span>
            <span className="creating-employee-review-value">{aadhaarDetails?.masked_aadhaar}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Verified Name</span>
            <span className="creating-employee-review-value">{aadhaarDetails?.name}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Date of Birth</span>
            <span className="creating-employee-review-value">{aadhaarDetails?.dob}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="creating-employee-success">
      <div className="creating-employee-success-icon">✓</div>
      <h2>Employee Created Successfully!</h2>
      <p>The employee has been added to the system with Aadhaar verification.</p>
      <div className="creating-employee-button-group" style={{ justifyContent: 'center', gap: '15px' }}>
        <button
          className="creating-employee-button creating-employee-button-primary"
          onClick={clearAllAndStartNew}
        >
          Create Another Employee
        </button>
        <button
          className="creating-employee-button creating-employee-button-secondary"
          onClick={saveAndAddAnother}
        >
          Save Data & Add Another
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="creating-employee-container">
        <div className="creating-employee-header">
          <h1>Create New Employee</h1>
          <p>Complete the step-by-step process to add a new employee with Aadhaar verification</p>
        </div>

        {/* Steps Progress */}
        <div className="creating-employee-steps">
          {[1, 2, 3, 4].map(step => (
            <div
              key={step}
              className={`creating-employee-step ${currentStep > step ? 'completed' : currentStep === step ? 'active' : ''
                }`}
            >
              <div className="creating-employee-step-circle">{step}</div>
              <div className="creating-employee-step-label">
                {step === 1 && 'Aadhaar Verification'}
                {step === 2 && 'Verified Details'}
                {step === 3 && 'Employee Details'}
                {step === 4 && 'Review & Submit'}
              </div>
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fee',
            color: '#c33',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}

        {/* Form Content */}
        <div className="creating-employee-form-container">
          {loading && (
            <div className="creating-employee-loading">
              <div className="creating-employee-spinner"></div>
              Processing...
            </div>
          )}

          {!loading && !success && (
            <>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}

              <div className="creating-employee-button-group">
                <button
                  className="creating-employee-button creating-employee-button-secondary"
                  onClick={prevStep}
                  disabled={currentStep === 1 || loading}
                >
                  Previous
                </button>

                <button
                  className={`creating-employee-button ${currentStep === 4
                      ? 'creating-employee-button-success'
                      : 'creating-employee-button-primary'
                    }`}
                  onClick={nextStep}
                  disabled={loading || (currentStep === 1 && otpSent && !otp)}
                >
                  {currentStep === 1 && !otpSent && 'Send OTP'}
                  {currentStep === 1 && otpSent && 'Verify OTP'}
                  {currentStep === 2 && 'Continue to Employee Details'}
                  {currentStep === 3 && 'Continue to Review'}
                  {currentStep === 4 && 'Create Employee'}
                </button>
              </div>
            </>
          )}

          {success && renderSuccess()}
        </div>
      </div>
    </div>
  );
};

export default CreatingEmployee;