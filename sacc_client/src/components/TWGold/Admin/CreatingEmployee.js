import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
    email_id: '',
    role: ''
  });
  const [otp, setOtp] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  // Step 2: Aadhaar Details (from verification)
  const [aadhaarDetails, setAadhaarDetails] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const lastSavedStepRef = useRef(null);
  const [createdUserRole, setCreatedUserRole] = useState('');


  // Step 3: User Details with new fields
  const [userData, setUserData] = useState({
    // Basic Information
    email: '',
    password: '',
    name: '',
    role: '',
    department: '',
    branch: '',
    designation: '',
    reportsTo: '',

    // Personal Details
    fathersName: '',
    mothersName: '',
    panNumber: '',
    maritalStatus: '',
    bloodGroup: '',
    nationality: 'Indian',
    alternateMobile: '',
    presentAddress: '',

    // Statutory Employment Details
    uanNumber: '',
    esiNumber: '',
    pfType: '',
    esiStatus: '',
    previousPFCompanyName: '',
    previousPFExitDate: '',

    // Qualifications
    qualifications: [
      { level: '10th', institution: '', board: '', year: '', grade: '' },
      { level: 'Intermediate/12th', institution: '', board: '', year: '', grade: '' },
      { level: 'Degree/Diploma', institution: '', board: '', year: '', grade: '' },
      { level: 'Post Graduation', institution: '', board: '', year: '', grade: '' }
    ],

    // Work Experience
    previouslyWorked: false,
    currentEmployer: {
      companyName: '',
      designation: '',
      fromDate: '',
      toDate: '',
      totalExperience: '',
      lastCTC: '',
      reasonForLeaving: ''
    },
    previousEmployers: [],

    // Skills
    technicalSkills: [],
    softwareTools: [],
    otherSkills: [],

    // Bank Details
    bankAccountHolder: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',

    // Documents
    documents: {
      aadhaarCard: false,
      panCard: false,
      tenthCertificate: false,
      interDegreeCertificates: false,
      experienceLetter: false,
      relievingLetter: false,
      salarySlips: false,
      uanCard: false,
      esiCard: false,
      bankPassbook: false,
      updatedResume: false,
      passportPhotos: false
    },

    // Contact
    contactNumber: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },

    // Other fields
    permissions: [],
    salary: '',
    joinDate: '',
  });

  // Step 4: Review Data
  const [reportingUsers, setReportingUsers] = useState([]);

  // Form validation errors
  const [errors, setErrors] = useState({});

  // New state for saved applications
  const [savedApplications, setSavedApplications] = useState([]);
  const [showSavedApplications, setShowSavedApplications] = useState(false);
  const [applicationIdCounter, setApplicationIdCounter] = useState(1);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [hasAadhaarData, setHasAadhaarData] = useState(false);

  // Use refs for values that don't need to trigger re-renders
  const savedApplicationsRef = useRef([]);
  const selectedApplicationIdRef = useRef(null);
  const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;


  // Time constants for 7-day storage
  const SEVEN_DAYS = useMemo(() => 7 * 24 * 60 * 60 * 1000, []);

  const STORAGE_KEYS = useMemo(() => ({
    VERIFICATION_SESSION: 'aadhaar_verification_session',
    USER_DATA: 'user_form_data',
    SAVED_APPLICATIONS: 'user_saved_applications',
    APPLICATION_ID_COUNTER: 'user_application_id_counter'
  }), []);

  // Role definitions
  const ROLES = useMemo(() => [
    { value: 'manager', label: 'Manager', requiresManager: false },
    { value: 'asst_manager', label: 'Assistant Manager', requiresManager: true },
    { value: 'cashier', label: 'Cashier', requiresManager: true },
    { value: 'accountant', label: 'Accountant', requiresManager: true },
    { value: 'recovery_agent', label: 'Recovery Agent', requiresManager: true },
    { value: 'grivirence', label: 'Grievance Officer', requiresManager: false },
    { value: 'auditor', label: 'Auditor', requiresManager: false },
    { value: 'hr', label: 'HR Manager', requiresManager: false },
    { value: 'administration', label: 'Administrative Officer', requiresManager: true },
    { value: 'sales_marketing', label: 'Sales Executive', requiresManager: true },
    { value: 'rm', label: 'Regional Manager', requiresManager: false },
    { value: 'zm', label: 'Zone Manager', requiresManager: false },
    { value: 'employee', label: 'Employee', requiresManager: true },
    { value: 'go&auditor', label: 'Grievance Officer & Auditor', requiresManager: false },

  ], []);

  // Get role display name
  const getRoleDisplayName = (roleValue) => {
    const role = ROLES.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  // Get default designation for role
  const getDefaultDesignation = (role) => {
    const designationMap = {
      manager: 'Manager',
      asst_manager: 'Assistant Manager',
      cashier: 'Cashier',
      accountant: 'Accountant',
      recovery_agent: 'Recovery Agent',
      grivirence: 'Grievance Officer',
      auditor: 'Auditor',
      hr: 'HR Manager',
      administration: 'Administrative Officer',
      sales_marketing: 'Sales Executive',
      rm: 'Regional Manager',
      zm: 'Zone Manager',
      employee: 'Employee'
    };
    return designationMap[role] || 'Employee';
  };

  // Clear all storage
  const clearStorage = useCallback(() => {
    clearEncryptedData(STORAGE_KEYS.VERIFICATION_SESSION);
    clearEncryptedData(STORAGE_KEYS.USER_DATA);
  }, [STORAGE_KEYS.VERIFICATION_SESSION, STORAGE_KEYS.USER_DATA]);

  const resetForm = useCallback(() => {
    setCurrentStep(1);
    setAadhaarData({
      aadhaar_number: '',
      phone_number: '',
      email_id: '',
      role: ''
    });
    setOtp('');
    setReferenceId('');
    setOtpSent(false);
    setTimer(0);
    setIsOtpVerified(false);
    setAadhaarDetails(null);
    setSelectedRole('');
    setUserData({
      email: '',
      password: '',
      name: '',
      role: '',
      department: '',
      branch: '',
      designation: '',
      reportsTo: '',

      fathersName: '',
      mothersName: '',
      panNumber: '',
      maritalStatus: '',
      bloodGroup: '',
      nationality: 'Indian',
      alternateMobile: '',
      presentAddress: '',

      uanNumber: '',
      esiNumber: '',
      pfType: '',
      esiStatus: '',
      previousPFCompanyName: '',
      previousPFExitDate: '',

      qualifications: [
        { level: '10th', institution: '', board: '', year: '', grade: '' },
        { level: 'Intermediate/12th', institution: '', board: '', year: '', grade: '' },
        { level: 'Degree/Diploma', institution: '', board: '', year: '', grade: '' },
        { level: 'Post Graduation', institution: '', board: '', year: '', grade: '' }
      ],

      previouslyWorked: false,
      currentEmployer: {
        companyName: '',
        designation: '',
        fromDate: '',
        toDate: '',
        totalExperience: '',
        lastCTC: '',
        reasonForLeaving: ''
      },
      previousEmployers: [],

      technicalSkills: [],
      softwareTools: [],
      otherSkills: [],

      bankAccountHolder: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branchName: '',

      documents: {
        aadhaarCard: false,
        panCard: false,
        tenthCertificate: false,
        interDegreeCertificates: false,
        experienceLetter: false,
        relievingLetter: false,
        salarySlips: false,
        uanCard: false,
        esiCard: false,
        bankPassbook: false,
        updatedResume: false,
        passportPhotos: false
      },

      contactNumber: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      },

      permissions: [],
      salary: '',
      joinDate: '',
    });
    setSelectedApplicationId(null);
    selectedApplicationIdRef.current = null;
    setHasAadhaarData(false);
    clearStorage();
    setError('');
    lastSavedStepRef.current = null;
  }, [clearStorage]);

  // Check if we have Aadhaar data
  const checkForAadhaarData = useCallback(() => {
    const hasData = !!(
      aadhaarData.aadhaar_number ||
      referenceId ||
      otpSent ||
      aadhaarDetails
    );
    if (hasData !== hasAadhaarData) {
      setHasAadhaarData(hasData);
    }
  }, [aadhaarData.aadhaar_number, referenceId, otpSent, aadhaarDetails, hasAadhaarData]);

  const loadSavedApplications = useCallback(() => {
    try {
      const savedApps = localStorage.getItem(STORAGE_KEYS.SAVED_APPLICATIONS);
      if (savedApps) {
        const parsed = JSON.parse(savedApps);
        const validApps = parsed.filter(app => {
          const appAge = Date.now() - (app.timestamp || 0);
          return appAge < SEVEN_DAYS;
        });
        setSavedApplications(validApps);
        savedApplicationsRef.current = validApps;

        if (validApps.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEYS.SAVED_APPLICATIONS, JSON.stringify(validApps));
        }
      }

      const counter = localStorage.getItem(STORAGE_KEYS.APPLICATION_ID_COUNTER);
      if (counter) {
        setApplicationIdCounter(parseInt(counter));
      }
    } catch (error) {
      console.error('Error loading saved applications:', error);
      setSavedApplications([]);
      savedApplicationsRef.current = [];
    }
  }, [STORAGE_KEYS.SAVED_APPLICATIONS, STORAGE_KEYS.APPLICATION_ID_COUNTER, SEVEN_DAYS]);

  // Save current application
  const saveCurrentApplication = useCallback(() => {
    if (!aadhaarDetails && !aadhaarData.aadhaar_number) return null;

    // ⛔ Prevent duplicate saves for same step
    if (lastSavedStepRef.current === currentStep) {
      return selectedApplicationIdRef.current;
    }

    try {
      const applicationId =
        selectedApplicationIdRef.current || `app_${applicationIdCounter}`;

      const applicationData = {
        id: applicationId,
        name: userData.name || aadhaarDetails?.name || 'Unnamed Application',
        aadhaarNumber: aadhaarData.aadhaar_number,
        role: userData.role || aadhaarData.role || selectedRole,
        step: currentStep,
        aadhaarData,
        referenceId,
        otpSent,
        aadhaarDetails,
        userData,
        timestamp: Date.now(),
        isOtpVerified
      };

      const updatedApplications = savedApplicationsRef.current.filter(
        app => app.id !== applicationId
      );

      updatedApplications.push(applicationData);

      setSavedApplications(updatedApplications);
      savedApplicationsRef.current = updatedApplications;

      localStorage.setItem(
        STORAGE_KEYS.SAVED_APPLICATIONS,
        JSON.stringify(updatedApplications)
      );

      if (!selectedApplicationIdRef.current) {
        const newCounter = applicationIdCounter + 1;
        setApplicationIdCounter(newCounter);
        localStorage.setItem(
          STORAGE_KEYS.APPLICATION_ID_COUNTER,
          newCounter.toString()
        );
      }

      selectedApplicationIdRef.current = applicationId;
      setSelectedApplicationId(applicationId);
      lastSavedStepRef.current = currentStep;

      return applicationId;
    } catch (error) {
      console.error('Error saving application:', error);
      return null;
    }
  }, [
    aadhaarDetails,
    aadhaarData,
    userData,
    currentStep,
    referenceId,
    otpSent,
    applicationIdCounter,
    isOtpVerified,
    selectedRole,
    STORAGE_KEYS.SAVED_APPLICATIONS,
    STORAGE_KEYS.APPLICATION_ID_COUNTER
  ]);


  // Load saved application
  const loadSavedApplication = useCallback((applicationId) => {
    try {
      const application = savedApplicationsRef.current.find(app => app.id === applicationId);
      if (application) {
        setAadhaarData(application.aadhaarData || {});
        if (application.referenceId) setReferenceId(application.referenceId);
        if (application.otpSent) setOtpSent(application.otpSent);
        if (application.aadhaarDetails) {
          setAadhaarDetails(application.aadhaarDetails);
          if (application.role) setSelectedRole(application.role);
        }
        if (application.userData) setUserData(application.userData);
        if (application.step) setCurrentStep(application.step);
        if (application.isOtpVerified) setIsOtpVerified(application.isOtpVerified);
        setSelectedApplicationId(applicationId);
        selectedApplicationIdRef.current = applicationId;

        if (application.otpSent && application.timestamp && !application.isOtpVerified) {
          const elapsed = Math.floor((Date.now() - application.timestamp) / 1000);
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
  }, []);

  // Delete saved application
  const deleteSavedApplication = useCallback((applicationId, e) => {
    e.stopPropagation();
    try {
      const updatedApplications = savedApplicationsRef.current.filter(app => app.id !== applicationId);
      setSavedApplications(updatedApplications);
      savedApplicationsRef.current = updatedApplications;
      localStorage.setItem(STORAGE_KEYS.SAVED_APPLICATIONS, JSON.stringify(updatedApplications));

      if (selectedApplicationIdRef.current === applicationId) {
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      setError('Failed to delete application');
    }
  }, [STORAGE_KEYS.SAVED_APPLICATIONS, resetForm]);

  // Update refs when state changes
  useEffect(() => {
    savedApplicationsRef.current = savedApplications;
  }, [savedApplications]);

  useEffect(() => {
    selectedApplicationIdRef.current = selectedApplicationId;
  }, [selectedApplicationId]);

  // Load saved data on component mount
  useEffect(() => {
    const loadSavedData = () => {
      try {
        loadSavedApplications();

        // Check if there's any active session
        const hasSavedSession = localStorage.getItem(STORAGE_KEYS.VERIFICATION_SESSION);

        // If no saved session, show step 1 with saved applications if any
        if (!hasSavedSession) {
          setCurrentStep(1);
          return;
        }

        // Try to load saved session
        const savedSession = localStorage.getItem(STORAGE_KEYS.VERIFICATION_SESSION);
        if (savedSession) {
          const decryptedSession = decryptData(savedSession);
          if (decryptedSession) {
            const sessionAge = Date.now() - (decryptedSession.timestamp || 0);

            if (sessionAge < SEVEN_DAYS) {
              if (decryptedSession.isOtpVerified) {
                setAadhaarData(decryptedSession.aadhaarData || {});
                if (decryptedSession.referenceId) setReferenceId(decryptedSession.referenceId);
                if (decryptedSession.otpSent) setOtpSent(decryptedSession.otpSent);
                if (decryptedSession.aadhaarDetails) {
                  setAadhaarDetails(decryptedSession.aadhaarDetails);
                  if (decryptedSession.role) setSelectedRole(decryptedSession.role);
                }
                setIsOtpVerified(decryptedSession.isOtpVerified);
                if (decryptedSession.currentStep && decryptedSession.currentStep > 1) {
                  setCurrentStep(decryptedSession.currentStep);
                }
              } else {
                // OTP not verified, clear session and show step 1
                clearEncryptedData(STORAGE_KEYS.VERIFICATION_SESSION);
                setCurrentStep(1);
                return;
              }

              if (decryptedSession.timerStart && !decryptedSession.isOtpVerified) {
                const elapsed = Math.floor((Date.now() - decryptedSession.timerStart) / 1000);
                if (elapsed < 60) {
                  setTimer(60 - elapsed);
                }
              }
            } else {
              // Session expired
              clearEncryptedData(STORAGE_KEYS.VERIFICATION_SESSION);
              setCurrentStep(1);
            }
          } else {
            // Failed to decrypt
            setCurrentStep(1);
          }
        }

        const savedUserData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        if (savedUserData) {
          const decryptedData = decryptData(savedUserData);
          if (decryptedData && decryptedData.timestamp) {
            const dataAge = Date.now() - decryptedData.timestamp;

            if (dataAge < SEVEN_DAYS) {
              setUserData(prev => ({
                ...prev,
                ...decryptedData.userData
              }));
            } else {
              clearEncryptedData(STORAGE_KEYS.USER_DATA);
            }
          }
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
        clearStorage();
        setCurrentStep(1);
      }
    };

    loadSavedData();
  }, [SEVEN_DAYS, clearStorage, loadSavedApplications, STORAGE_KEYS.VERIFICATION_SESSION, STORAGE_KEYS.USER_DATA]);

  // Check for Aadhaar data when relevant state changes
  useEffect(() => {
    checkForAadhaarData();
  }, [checkForAadhaarData]);

  const saveVerificationSession = useCallback(() => {
    try {
      const sessionData = {
        aadhaarData,
        referenceId,
        otpSent,
        aadhaarDetails,
        role: selectedRole,
        currentStep,
        timerStart: otpSent ? Date.now() - (60 - timer) * 1000 : null,
        timestamp: Date.now(),
        isOtpVerified
      };

      const encrypted = encryptData(sessionData);
      if (encrypted) {
        localStorage.setItem(STORAGE_KEYS.VERIFICATION_SESSION, encrypted);
      }
    } catch (error) {
      console.error('Error saving verification session:', error);
    }
  }, [aadhaarData, referenceId, otpSent, aadhaarDetails, selectedRole, currentStep, timer, isOtpVerified, STORAGE_KEYS.VERIFICATION_SESSION]);

  const saveUserData = useCallback(() => {
    try {
      const dataToSave = {
        userData,
        timestamp: Date.now()
      };

      const encrypted = encryptData(dataToSave);
      if (encrypted) {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, encrypted);
      }
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }, [userData, STORAGE_KEYS.USER_DATA]);

  // Save user data when step >= 3 and user has name
  useEffect(() => {
    if (currentStep >= 3 && userData.name) {
      saveUserData();
    }
  }, [currentStep, userData.name, saveUserData]);

  // Save verification session when relevant data changes
  useEffect(() => {
    if (currentStep > 1 && (isOtpVerified || otpSent)) {
      saveVerificationSession();
    }
  }, [currentStep, aadhaarData, referenceId, otpSent, aadhaarDetails, selectedRole, timer, isOtpVerified, saveVerificationSession]);

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

  const handlePanChange = (e) => {
    let value = e.target.value.toUpperCase();
  
    // Allow only A–Z and 0–9
    value = value.replace(/[^A-Z0-9]/g, '');
  
    // Limit length to 10
    if (value.length > 10) return;
  
    // Optional: Enforce structure while typing
    // First 5 → letters, next 4 → digits, last → letter
    if (
      (value.length <= 5 && !/^[A-Z]*$/.test(value)) ||
      (value.length > 5 && value.length <= 9 && !/^[A-Z]{5}[0-9]*$/.test(value)) ||
      (value.length === 10 && !PAN_REGEX.test(value))
    ) {
      return;
    }
  
    setUserData(prev => ({
      ...prev,
      panNumber: value
    }));
  
    // Clear error while typing
    setErrors(prev => ({
      ...prev,
      panNumber: ''
    }));
  };
  

  // Fetch reporting users
  useEffect(() => {
    fetchReportingUsers();
  }, []);



  const fetchReportingUsers = async () => {
    try {
      const response = await api.get('/twgoldlogin/users');
      if (response.data?.success && response.data?.data?.users) {
        const formattedUsers = response.data.data.users.map(user => ({
          _id: user.id || user._id,
          id: user.id || user._id,
          name: user.name || 'Unknown',
          email: user.email || '',
          role: user.role || '',
          department: user.department || 'No Department',
          branch: user.branch || 'No Branch'
        }));
        setReportingUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Error fetching reporting users:', error);
      setReportingUsers([]);
    }
  };

  // Step 1: Generate Aadhaar OTP
  const generateAadhaarOtp = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.post('/twgoldlogin/user/aadhaar/generate-otp', {
        aadhaar_number: aadhaarData.aadhaar_number,
        phone_number: aadhaarData.phone_number,
        email_id: aadhaarData.email_id,
        role: selectedRole
      });

      if (response.data.success) {
        setReferenceId(response.data.reference_id);
        setOtpSent(true);
        setTimer(60);
        setError('');
        setIsOtpVerified(false);
        saveVerificationSession();
      }
    } catch (error) {
      console.log(error.response)
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

      const response = await api.post('/twgoldlogin/user/aadhaar/verify-otp', {
        aadhaar_number: aadhaarData.aadhaar_number,
        otp: otp,
        reference_id: referenceId,
        role: selectedRole
      });

      if (response.data.success) {
        setAadhaarDetails(response.data.aadhaar_data);
        setIsOtpVerified(true);
        setCurrentStep(2);
        setError('');

        saveVerificationSession();
        saveCurrentApplication();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to verify OTP');
      setIsOtpVerified(false);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Create User with Aadhaar
  const createUserWithAadhaar = async () => {
    try {
      setLoading(true);
      setError('');

      // Prepare data for backend
      const userPayload = {
        // Basic info (at the end as requested)
        name: userData.name,

        role: userData.role || selectedRole,
        designation: userData.designation || getDefaultDesignation(userData.role || selectedRole),
        department: userData.department,
        branch: userData.branch,
        reportsTo: userData.reportsTo,

        // Personal details
        aadhaar_number: aadhaarData.aadhaar_number,
        fathers_name: userData.fathersName,
        mothers_name: userData.mothersName,
        pan_number: userData.panNumber,
        marital_status: userData.maritalStatus,
        blood_group: userData.bloodGroup,
        nationality: userData.nationality,
        alternate_mobile: userData.alternateMobile,
        present_address: userData.presentAddress,
        contact_number: userData.contactNumber,

        // Statutory details
        uan_number: userData.uanNumber,
        esi_number: userData.esiNumber,
        pf_type: userData.pfType,
        esi_status: userData.esiStatus,
        previous_pf_company_name: userData.previousPFCompanyName,
        previous_pf_exit_date: userData.previousPFExitDate,

        // Qualifications
        qualifications: userData.qualifications,

        // Work experience
        previously_worked: userData.previouslyWorked,
        current_employer: userData.previouslyWorked ? userData.currentEmployer : null,
        previous_employers: userData.previousEmployers,

        // Skills
        technical_skills: userData.technicalSkills,
        software_tools: userData.softwareTools,
        other_skills: userData.otherSkills,

        // Bank details
        bank_account_holder: userData.bankAccountHolder,
        bank_name: userData.bankName,
        account_number: userData.accountNumber,
        ifsc_code: userData.ifscCode,
        branch_name: userData.branchName,

        // Documents
        documents: userData.documents,

        // Emergency contact
        emergency_contact: userData.emergencyContact,

        // Employment details
        salary: userData.salary,
        join_date: userData.joinDate,
        permissions: userData.permissions,

        // Email and password (at the end)
        email: userData.email,
        password: userData.password
      };

      // Remove empty arrays and null values
      Object.keys(userPayload).forEach(key => {
        if (Array.isArray(userPayload[key]) && userPayload[key].length === 0) {
          delete userPayload[key];
        }
        if (userPayload[key] === null || userPayload[key] === undefined || userPayload[key] === '') {
          delete userPayload[key];
        }
      });

      const response = await api.post('/twgoldlogin/user/create-with-aadhaar', userPayload);

      if (response.data.success) {
        setSuccess(true);
        setCurrentStep(5);
        setCreatedUserRole(userData.role || selectedRole);
        clearStorage();
        if (selectedApplicationIdRef.current) {
          const updatedApplications = savedApplicationsRef.current.filter(app => app.id !== selectedApplicationIdRef.current);
          setSavedApplications(updatedApplications);
          savedApplicationsRef.current = updatedApplications;
          localStorage.setItem(STORAGE_KEYS.SAVED_APPLICATIONS, JSON.stringify(updatedApplications));
          setSelectedApplicationId(null);
          selectedApplicationIdRef.current = null;
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create user');
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

  const handleUserInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setUserData(prev => ({
      ...prev,
      role,
      designation: getDefaultDesignation(role)
    }));
    handleAadhaarInputChange('role', role);
  };

  useEffect(() => {
    if (isOtpVerified && aadhaarDetails) {
      setUserData(prev => ({
        ...prev,
        name: prev.name || aadhaarDetails.name || '',
        contactNumber: prev.contactNumber || aadhaarData.phone_number || '',
      }));
    }
  }, [isOtpVerified, aadhaarDetails, aadhaarData.phone_number]);


  const handleEmergencyContactChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value
      }
    }));
  };

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  }, []);
  

  const handleQualificationChange = (index, field, value) => {
    setUserData(prev => {
      const newQualifications = [...prev.qualifications];
      newQualifications[index] = {
        ...newQualifications[index],
        [field]: value
      };
      return {
        ...prev,
        qualifications: newQualifications
      };
    });
  };

  const handleCurrentEmployerChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      currentEmployer: {
        ...prev.currentEmployer,
        [field]: value
      }
    }));
  };

  const handleDocumentChange = (documentName, checked) => {
    setUserData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentName]: checked
      }
    }));
  };

  const addSkill = (field, value) => {
    if (value.trim()) {
      setUserData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeSkill = (field, index) => {
    setUserData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
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
    if (!selectedRole) {
      newErrors.role = 'Please select a role';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!userData.email) newErrors.email = 'Email is required';
    if (!userData.password) newErrors.password = 'Password is required';
    if (!userData.name) newErrors.name = 'Name is required';
    if (!userData.role) newErrors.role = 'Role is required';
    if (!userData.contactNumber) newErrors.contactNumber = 'Contact number is required';
    if (!userData.panNumber) {
      newErrors.panNumber = 'PAN number is required';
    } else if (!PAN_REGEX.test(userData.panNumber)) {
      newErrors.panNumber = 'Invalid PAN format (ABCDE1234F)';
    }
    
    if (!userData.fathersName) newErrors.fathersName = 'Father\'s/Husband\'s name is required';
    if (!userData.mothersName) newErrors.mothersName = 'Mother\'s name is required';

    // Check if role requires reportsTo
    const roleObj = ROLES.find(r => r.value === userData.role);
    if (roleObj?.requiresManager && !userData.reportsTo) {
      newErrors.reportsTo = 'Reporting manager is required';
    }

    if (!userData.emergencyContact.name) newErrors.emergencyName = 'Emergency contact name is required';
    if (!userData.emergencyContact.relationship) newErrors.emergencyRelationship = 'Relationship is required';
    if (!userData.emergencyContact.phone) newErrors.emergencyPhone = 'Emergency phone is required';

    if (userData.joinDate) {
      const selectedDate = new Date(userData.joinDate);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
    
      if (selectedDate < todayDate) {
        newErrors.joinDate = 'Joining date cannot be in the past';
      }
    }
    

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      if (otpSent) {
        verifyAadhaarOtp(); // OTP verify already saves once
      } else {
        generateAadhaarOtp();
      }
    }
    else if (currentStep === 2) {
      setCurrentStep(3);
      saveCurrentApplication(); // ✅ OK (first transition)
    }
    else if (currentStep === 3 && validateStep3()) {
      setCurrentStep(4);
      saveCurrentApplication(); // ✅ OK (final draft)
    }
    else if (currentStep === 4) {
      createUserWithAadhaar();
    }
  };

  const prevStep = () => {
    if (currentStep === 3 && isOtpVerified) {
      // If OTP is verified, go directly to step 2 (verified details)
      setCurrentStep(2);
    } else if (currentStep === 2 && isOtpVerified) {
      // If on step 2 and OTP is verified, go to step 1 but don't show OTP section
      setCurrentStep(1);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Resend OTP
  const resendOtp = () => {
    if (timer === 0) {
      generateAadhaarOtp();
    }
  };

  // Save data and get back to add another user
  const saveAndAddAnother = () => {
    const appId = saveCurrentApplication();
    if (appId) {
      setSuccess(false);
      resetForm();
      setShowSavedApplications(true);
    }
  };

  // Clear all data and move to step 1
  const clearAllAndStartNew = () => {
    if (selectedApplicationIdRef.current) {
      const updatedApplications = savedApplicationsRef.current.filter(
        app => app.id !== selectedApplicationIdRef.current
      );
      setSavedApplications(updatedApplications);
      savedApplicationsRef.current = updatedApplications;
      localStorage.setItem(
        STORAGE_KEYS.SAVED_APPLICATIONS,
        JSON.stringify(updatedApplications)
      );
    }

    setSuccess(false);          // ✅ important
    resetForm();
    setCurrentStep(1);          // ✅ force step 1
    setShowSavedApplications(false);
  };


  // Render saved applications list - shown above step 1 form
  const renderSavedApplicationsList = () => (
    <div className="creating-employee-saved-applications-list">
      <h3>Continue Existing Application</h3>
      <p>Select an application to continue from where you left off:</p>

      {savedApplications.length === 0 ? (
        <div className="creating-employee-no-applications">
          <p>No saved applications found.</p>
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
                <p>Role: {getRoleDisplayName(app.role)}</p>
                <p>Aadhaar: {app.aadhaarNumber ? `${app.aadhaarNumber.substring(0, 4)}XXXX${app.aadhaarNumber.substring(8)}` : 'Not entered'}</p>
                <p>Status: {app.isOtpVerified ? 'OTP Verified' : 'OTP Pending'}</p>
                <p>Last saved: {new Date(app.timestamp).toLocaleString()}</p>
                <p>Current step: {app.step === 1 ? 'Aadhaar Verification' :
                  app.step === 2 ? 'Verified Details' :
                    app.step === 3 ? 'User Details' :
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
        </div>
      )}
    </div>
  );

  // Render Step 1 with saved applications shown above the form
  const renderStep1 = () => {
    // If showing saved applications in full screen mode
    if (showSavedApplications) {
      return (
        <div className="creating-employee-form-step">
          {renderSavedApplicationsList()}
          <div className="creating-employee-applications-footer">
            <button
              className="creating-employee-button creating-employee-button-secondary"
              onClick={() => setShowSavedApplications(false)}
            >
              Start New Application
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="creating-employee-form-step">
        {/* Show saved applications list above the form only on fresh mount */}
        {savedApplications.length > 0 && !hasAadhaarData && !otpSent && (
          <div className="creating-employee-saved-applications-above">
            {renderSavedApplicationsList()}
            <div className="creating-employee-form-divider">
              <span>OR</span>
            </div>
          </div>
        )}


        <div className="creating-employee-form-section">
          <h3>Aadhaar Verification</h3>
          <p>Enter employee's Aadhaar details to verify identity</p>

          {/* If we have saved applications and not showing them, show button */}
          {savedApplications.length > 0 && !showSavedApplications && (
            <button
              className="creating-employee-button creating-employee-button-secondary"
              onClick={() => setShowSavedApplications(true)}
            >
              Continue Existing Application ({savedApplications.length})
            </button>
          )}


          {/* Role Selection */}
          <div className="creating-employee-form-group">
            <label className="creating-employee-form-label">Select Role *</label>
            <select
              className={`creating-employee-form-select ${errors.role ? 'error' : ''}`}
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              disabled={otpSent && !isOtpVerified}
            >
              <option value="">Select Role</option>
              {ROLES.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            {errors.role && <span className="creating-employee-form-error">{errors.role}</span>}
          </div>

          {/* If OTP is sent but NOT verified, show OTP section */}
          {otpSent && !isOtpVerified ? (
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
          ) : (
            <>
              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">Aadhaar Number *</label>
                <input
                  type="text"
                  className={`creating-employee-form-input ${errors.aadhaar_number ? 'error' : ''}`}
                  value={aadhaarData.aadhaar_number}
                  onChange={(e) => handleAadhaarInputChange('aadhaar_number', e.target.value)}
                  placeholder="Enter 12-digit Aadhaar number"
                  maxLength="12"
                  disabled={otpSent && !isOtpVerified}
                />
                {errors.aadhaar_number && <span className="creating-employee-form-error">{errors.aadhaar_number}</span>}
              </div>

              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">Registered Mobile Number *</label>
                <input
                  type="text"
                  className={`creating-employee-form-input ${errors.phone_number ? 'error' : ''}`}
                  value={aadhaarData.phone_number}
                  onChange={(e) => handleAadhaarInputChange('phone_number', e.target.value)}
                  placeholder="Enter registered mobile number"
                  maxLength="10"
                  disabled={otpSent && !isOtpVerified}
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
                  disabled={otpSent && !isOtpVerified}
                />
                {errors.email_id && <span className="creating-employee-form-error">{errors.email_id}</span>}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

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
              <div className="creating-employee-detail-item">
                <span className="creating-employee-detail-label">Role</span>
                <span className="creating-employee-detail-value">{getRoleDisplayName(selectedRole)}</span>
              </div>
              <div className="creating-employee-detail-item" style={{ gridColumn: '1 / -1' }}>
                <span className="creating-employee-detail-label">Address</span>
                <span className="creating-employee-detail-value">{aadhaarDetails.full_address}</span>
              </div>
            </div>
          </div>
        )}

        <p>All Aadhaar details have been verified and will be stored securely with the user record.</p>
      </div>
    </div>
  );


  const renderStep3 = () => {
    
    const selectedRoleObj = ROLES.find(r => r.value === userData.role);

    return (
      <div className="creating-employee-form-step">
        <div className="creating-employee-form-section">
          <h3>User Details</h3>

          <div className="creating-employee-form-section">
            <h4>Personal Information</h4>
            <div className="creating-employee-form-row">
              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">Full Name *</label>
                <input
                  type="text"
                  value={userData.name}
                  disabled
                  className="creating-employee-form-input"
                />

                {errors.name && <span className="creating-employee-form-error">{errors.name}</span>}
              </div>

              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">Contact Number *</label>
                <input
                  type="text"
                  value={userData.contactNumber}
                  disabled
                  className="creating-employee-form-input"
                />

                {errors.contactNumber && <span className="creating-employee-form-error">{errors.contactNumber}</span>}
              </div>
            </div>

            <div className="creating-employee-form-row">
              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">Father's/Husband's Name *</label>
                <input
                  type="text"
                  className={`creating-employee-form-input ${errors.fathersName ? 'error' : ''}`}
                  value={userData.fathersName}
                  onChange={(e) => handleUserInputChange('fathersName', e.target.value)}
                  placeholder="Father's/Husband's name"
                />
                {errors.fathersName && <span className="creating-employee-form-error">{errors.fathersName}</span>}
              </div>

              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">Mother's Name *</label>
                <input
                  type="text"
                  className={`creating-employee-form-input ${errors.mothersName ? 'error' : ''}`}
                  value={userData.mothersName}
                  onChange={(e) => handleUserInputChange('mothersName', e.target.value)}
                  placeholder="Mother's name"
                />
                {errors.mothersName && <span className="creating-employee-form-error">{errors.mothersName}</span>}
              </div>
            </div>

            <div className="creating-employee-form-row">
              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">PAN Number *</label>
                <input
  type="text"
  className={`creating-employee-form-input ${errors.panNumber ? 'error' : ''}`}
  value={userData.panNumber}
  onChange={handlePanChange}
  placeholder="ABCDE1234F"
  maxLength="10"
/>

                {errors.panNumber && <span className="creating-employee-form-error">{errors.panNumber}</span>}
              </div>

              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">Marital Status</label>
                <select
                  className="creating-employee-form-select"
                  value={userData.maritalStatus}
                  onChange={(e) => handleUserInputChange('maritalStatus', e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="creating-employee-form-row">
              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">Blood Group</label>
                <select
                  className="creating-employee-form-select"
                  value={userData.bloodGroup}
                  onChange={(e) => handleUserInputChange('bloodGroup', e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">Nationality</label>
                <input
                  type="text"
                  className="creating-employee-form-input"
                  value={userData.nationality}
                  onChange={(e) => handleUserInputChange('nationality', e.target.value)}
                  placeholder="Nationality"
                />
              </div>
            </div>

            <div className="creating-employee-form-row">
              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">Alternate Mobile</label>
                <input
                  type="text"
                  className="creating-employee-form-input"
                  value={userData.alternateMobile}
                  onChange={(e) => handleUserInputChange('alternateMobile', e.target.value)}
                  placeholder="Alternate mobile number"
                  maxLength="10"
                />
              </div>
            </div>

            <div className="creating-employee-form-group">
              <label className="creating-employee-form-label">Present Address</label>
              <textarea
                className={`creating-employee-form-input`}
                value={userData.presentAddress}
                onChange={(e) => handleUserInputChange('presentAddress', e.target.value)}
                placeholder="Present address"
                rows="3"
              />
            </div>
          </div>

          <div className="creating-employee-form-section">
            <h4>Statutory Employment Details</h4>
            <div className="creating-employee-form-row">
              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">UAN Number (PF)</label>
                <input
                  type="text"
                  className="creating-employee-form-input"
                  value={userData.uanNumber}
                  onChange={(e) => handleUserInputChange('uanNumber', e.target.value)}
                  placeholder="UAN number"
                />
              </div>

              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">ESI Number</label>
                <input
                  type="text"
                  className="creating-employee-form-input"
                  value={userData.esiNumber}
                  onChange={(e) => handleUserInputChange('esiNumber', e.target.value)}
                  placeholder="ESI number (if available)"
                />
              </div>
            </div>

            <div className="creating-employee-form-row">
              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">PF Type</label>
                <div className="creating-employee-radio-group">
                  <label>
                    <input
                      type="radio"
                      name="pfType"
                      value="Existing UAN"
                      checked={userData.pfType === 'Existing UAN'}
                      onChange={(e) => handleUserInputChange('pfType', e.target.value)}
                    />
                    Existing UAN
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="pfType"
                      value="New UAN Required"
                      checked={userData.pfType === 'New UAN Required'}
                      onChange={(e) => handleUserInputChange('pfType', e.target.value)}
                    />
                    New UAN Required
                  </label>
                </div>
              </div>

              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">ESI Status</label>
                <div className="creating-employee-radio-group">
                  <label>
                    <input
                      type="radio"
                      name="esiStatus"
                      value="Registered"
                      checked={userData.esiStatus === 'Registered'}
                      onChange={(e) => handleUserInputChange('esiStatus', e.target.value)}
                    />
                    Registered
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="esiStatus"
                      value="Not Registered"
                      checked={userData.esiStatus === 'Not Registered'}
                      onChange={(e) => handleUserInputChange('esiStatus', e.target.value)}
                    />
                    Not Registered
                  </label>
                </div>
              </div>
            </div>

            {userData.pfType === 'Existing UAN' && (
              <div className="creating-employee-form-row">
                <div className="creating-employee-form-group">
                  <label className="creating-employee-form-label">Previous PF Company Name</label>
                  <input
                    type="text"
                    className="creating-employee-form-input"
                    value={userData.previousPFCompanyName}
                    onChange={(e) => handleUserInputChange('previousPFCompanyName', e.target.value)}
                    placeholder="Previous company name"
                  />
                </div>

                <div className="creating-employee-form-group">
                  <label className="creating-employee-form-label">Previous PF Exit Date</label>
                  <input
                    type="date"
                    className="creating-employee-form-input"
                    value={userData.previousPFExitDate}
                    onChange={(e) => handleUserInputChange('previousPFExitDate', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="creating-employee-form-section">
            <h4>Qualifications</h4>
            {userData.qualifications.map((qual, index) => (
              <div key={index} className="creating-employee-qualification-row">
                <div className="creating-employee-form-row">
                  <div className="creating-employee-form-group">
                    <label className="creating-employee-form-label">{qual.level}</label>
                    <input
                      type="text"
                      className="creating-employee-form-input"
                      value={qual.institution}
                      onChange={(e) => handleQualificationChange(index, 'institution', e.target.value)}
                      placeholder="School/College"
                    />
                  </div>

                  <div className="creating-employee-form-group">
                    <label className="creating-employee-form-label">Board/University</label>
                    <input
                      type="text"
                      className="creating-employee-form-input"
                      value={qual.board}
                      onChange={(e) => handleQualificationChange(index, 'board', e.target.value)}
                      placeholder="Board/University"
                    />
                  </div>
                </div>

                <div className="creating-employee-form-row">
                  <div className="creating-employee-form-group">
                    <label className="creating-employee-form-label">Year</label>
                    <input
                      type="text"
                      className="creating-employee-form-input"
                      value={qual.year}
                      onChange={(e) => handleQualificationChange(index, 'year', e.target.value)}
                      placeholder="Year"
                      maxLength="4"
                    />
                  </div>

                  <div className="creating-employee-form-group">
                    <label className="creating-employee-form-label">% / Grade</label>
                    <input
                      type="text"
                      className="creating-employee-form-input"
                      value={qual.grade}
                      onChange={(e) => handleQualificationChange(index, 'grade', e.target.value)}
                      placeholder="Percentage/Grade"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="creating-employee-form-section">
            <h4>Work Experience</h4>
            <div className="creating-employee-form-group">
              <label className="creating-employee-form-checkbox">
                <input
                  type="checkbox"
                  checked={userData.previouslyWorked}
                  onChange={(e) => handleUserInputChange('previouslyWorked', e.target.checked)}
                />
                Previously Worked
              </label>
            </div>

            {userData.previouslyWorked && (
              <>
                <div className="creating-employee-form-section">
                  <h5>Current / Last Employer</h5>
                  <div className="creating-employee-form-row">
                    <div className="creating-employee-form-group">
                      <label className="creating-employee-form-label">Company Name</label>
                      <input
                        type="text"
                        className="creating-employee-form-input"
                        value={userData.currentEmployer.companyName}
                        onChange={(e) => handleCurrentEmployerChange('companyName', e.target.value)}
                        placeholder="Company name"
                      />
                    </div>

                    <div className="creating-employee-form-group">
                      <label className="creating-employee-form-label">Designation</label>
                      <input
                        type="text"
                        className="creating-employee-form-input"
                        value={userData.currentEmployer.designation}
                        onChange={(e) => handleCurrentEmployerChange('designation', e.target.value)}
                        placeholder="Designation"
                      />
                    </div>
                  </div>

                  <div className="creating-employee-form-row">
                    <div className="creating-employee-form-group">
                      <label className="creating-employee-form-label">Experience From</label>
                      <input
                        type="date"
                        className="creating-employee-form-input"
                        value={userData.currentEmployer.fromDate}
                        onChange={(e) => handleCurrentEmployerChange('fromDate', e.target.value)}
                      />
                    </div>

                    <div className="creating-employee-form-group">
                      <label className="creating-employee-form-label">Experience To</label>
                      <input
                        type="date"
                        className="creating-employee-form-input"
                        value={userData.currentEmployer.toDate}
                        onChange={(e) => handleCurrentEmployerChange('toDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="creating-employee-form-row">
                    <div className="creating-employee-form-group">
                      <label className="creating-employee-form-label">Total Experience</label>
                      <input
                        type="text"
                        className="creating-employee-form-input"
                        value={userData.currentEmployer.totalExperience}
                        onChange={(e) => handleCurrentEmployerChange('totalExperience', e.target.value)}
                        placeholder="e.g., 3 Years 6 Months"
                      />
                    </div>

                    <div className="creating-employee-form-group">
                      <label className="creating-employee-form-label">Last CTC</label>
                      <input
                        type="text"
                        className="creating-employee-form-input"
                        value={userData.currentEmployer.lastCTC}
                        onChange={(e) => handleCurrentEmployerChange('lastCTC', e.target.value)}
                        placeholder="Last CTC"
                      />
                    </div>
                  </div>

                  <div className="creating-employee-form-group">
                    <label className="creating-employee-form-label">Reason for Leaving</label>
                    <input
                      type="text"
                      className="creating-employee-form-input"
                      value={userData.currentEmployer.reasonForLeaving}
                      onChange={(e) => handleCurrentEmployerChange('reasonForLeaving', e.target.value)}
                      placeholder="Reason for leaving"
                    />
                  </div>
                </div>

                <div className="creating-employee-form-section">
                  <h5>Previous Employers</h5>
                  <div className="creating-employee-form-group">
                    <button
                      className="creating-employee-button creating-employee-button-secondary"
                      onClick={() => {
                        setUserData(prev => ({
                          ...prev,
                          previousEmployers: [...prev.previousEmployers, {
                            companyName: '',
                            position: '',
                            duration: '',
                            reasonForLeaving: ''
                          }]
                        }));
                      }}
                    >
                      Add Previous Employer
                    </button>
                  </div>

                  {userData.previousEmployers.map((employer, index) => (
                    <div key={index} className="creating-employee-form-section">
                      <div className="creating-employee-form-row">
                        <div className="creating-employee-form-group">
                          <label className="creating-employee-form-label">Company Name</label>
                          <input
                            type="text"
                            className="creating-employee-form-input"
                            value={employer.companyName}
                            onChange={(e) => {
                              const newEmployers = [...userData.previousEmployers];
                              newEmployers[index].companyName = e.target.value;
                              handleUserInputChange('previousEmployers', newEmployers);
                            }}
                            placeholder="Company name"
                          />
                        </div>

                        <div className="creating-employee-form-group">
                          <label className="creating-employee-form-label">Position Held</label>
                          <input
                            type="text"
                            className="creating-employee-form-input"
                            value={employer.position}
                            onChange={(e) => {
                              const newEmployers = [...userData.previousEmployers];
                              newEmployers[index].position = e.target.value;
                              handleUserInputChange('previousEmployers', newEmployers);
                            }}
                            placeholder="Position held"
                          />
                        </div>
                      </div>

                      <div className="creating-employee-form-row">
                        <div className="creating-employee-form-group">
                          <label className="creating-employee-form-label">Duration</label>
                          <input
                            type="text"
                            className="creating-employee-form-input"
                            value={employer.duration}
                            onChange={(e) => {
                              const newEmployers = [...userData.previousEmployers];
                              newEmployers[index].duration = e.target.value;
                              handleUserInputChange('previousEmployers', newEmployers);
                            }}
                            placeholder="Duration"
                          />
                        </div>

                        <div className="creating-employee-form-group">
                          <label className="creating-employee-form-label">Reason for Leaving</label>
                          <input
                            type="text"
                            className="creating-employee-form-input"
                            value={employer.reasonForLeaving}
                            onChange={(e) => {
                              const newEmployers = [...userData.previousEmployers];
                              newEmployers[index].reasonForLeaving = e.target.value;
                              handleUserInputChange('previousEmployers', newEmployers);
                            }}
                            placeholder="Reason for leaving"
                          />
                        </div>
                      </div>

                      <div className="creating-employee-form-group">
                        <button
                          className="creating-employee-button creating-employee-button-secondary"
                          onClick={() => {
                            const newEmployers = userData.previousEmployers.filter((_, i) => i !== index);
                            handleUserInputChange('previousEmployers', newEmployers);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="creating-employee-form-section">
            <h4>Skills & Expertise</h4>
            <div className="creating-employee-form-group">
              <label className="creating-employee-form-label">Technical Skills</label>
              <div className="creating-employee-tag-input">
                {userData.technicalSkills.map((skill, index) => (
                  <div key={index} className="creating-employee-tag">
                    {skill}
                    <button
                      className="creating-employee-tag-remove"
                      onClick={() => removeSkill('technicalSkills', index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  placeholder="Add technical skill"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      addSkill('technicalSkills', e.target.value);
                      e.target.value = '';
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      addSkill('technicalSkills', e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>

            <div className="creating-employee-form-group">
              <label className="creating-employee-form-label">Software Tools</label>
              <div className="creating-employee-tag-input">
                {userData.softwareTools.map((tool, index) => (
                  <div key={index} className="creating-employee-tag">
                    {tool}
                    <button
                      className="creating-employee-tag-remove"
                      onClick={() => removeSkill('softwareTools', index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  placeholder="Add software tool"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      addSkill('softwareTools', e.target.value);
                      e.target.value = '';
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      addSkill('softwareTools', e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>

            <div className="creating-employee-form-group">
              <label className="creating-employee-form-label">Other Relevant Skills</label>
              <div className="creating-employee-tag-input">
                {userData.otherSkills.map((skill, index) => (
                  <div key={index} className="creating-employee-tag">
                    {skill}
                    <button
                      className="creating-employee-tag-remove"
                      onClick={() => removeSkill('otherSkills', index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  placeholder="Add other skill"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      addSkill('otherSkills', e.target.value);
                      e.target.value = '';
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      addSkill('otherSkills', e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="creating-employee-form-section">
            <h4>Bank Details</h4>
            <div className="creating-employee-form-row">
              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">Account Holder Name</label>
                <input
                  type="text"
                  className={`creating-employee-form-input ${errors.bankAccountHolder ? 'error' : ''}`}
                  value={userData.bankAccountHolder}
                  onChange={(e) => handleUserInputChange('bankAccountHolder', e.target.value)}
                  placeholder="Account holder name"
                />
              </div>

              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">Bank Name</label>
                <input
                  type="text"
                  className={`creating-employee-form-input ${errors.bankName ? 'error' : ''}`}
                  value={userData.bankName}
                  onChange={(e) => handleUserInputChange('bankName', e.target.value)}
                  placeholder="Bank name"
                />
              </div>
            </div>

            <div className="creating-employee-form-row">
              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">Account Number</label>
                <input
                  type="text"
                  className={`creating-employee-form-input ${errors.accountNumber ? 'error' : ''}`}
                  value={userData.accountNumber}
                  onChange={(e) => handleUserInputChange('accountNumber', e.target.value)}
                  placeholder="Account number"
                />
              </div>

              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">IFSC Code</label>
                <input
                  type="text"
                  className={`creating-employee-form-input ${errors.ifscCode ? 'error' : ''}`}
                  value={userData.ifscCode}
                  onChange={(e) => handleUserInputChange('ifscCode', e.target.value.toUpperCase())}
                  placeholder="IFSC code"
                />
              </div>
            </div>

            <div className="creating-employee-form-group">
              <label className="creating-employee-form-label">Branch</label>
              <input
                type="text"
                className="creating-employee-form-input"
                value={userData.branchName}
                onChange={(e) => handleUserInputChange('branchName', e.target.value)}
                placeholder="Branch name"
              />
            </div>
          </div>

          <div className="creating-employee-form-section">
            <h4>Documents to be Submitted (Xerox Only)</h4>
            <div className="creating-employee-documents-grid">
              <label className="creating-employee-document-checkbox">
                <input
                  type="checkbox"
                  checked={userData.documents.aadhaarCard}
                  onChange={(e) => handleDocumentChange('aadhaarCard', e.target.checked)}
                />
                Aadhaar Card
              </label>

              <label className="creating-employee-document-checkbox">
                <input
                  type="checkbox"
                  checked={userData.documents.panCard}
                  onChange={(e) => handleDocumentChange('panCard', e.target.checked)}
                />
                PAN Card
              </label>

              <label className="creating-employee-document-checkbox">
                <input
                  type="checkbox"
                  checked={userData.documents.tenthCertificate}
                  onChange={(e) => handleDocumentChange('tenthCertificate', e.target.checked)}
                />
                10th Certificate
              </label>

              <label className="creating-employee-document-checkbox">
                <input
                  type="checkbox"
                  checked={userData.documents.interDegreeCertificates}
                  onChange={(e) => handleDocumentChange('interDegreeCertificates', e.target.checked)}
                />
                Inter / Degree Certificates
              </label>

              <label className="creating-employee-document-checkbox">
                <input
                  type="checkbox"
                  checked={userData.documents.experienceLetter}
                  onChange={(e) => handleDocumentChange('experienceLetter', e.target.checked)}
                />
                Experience Letter
              </label>

              <label className="creating-employee-document-checkbox">
                <input
                  type="checkbox"
                  checked={userData.documents.relievingLetter}
                  onChange={(e) => handleDocumentChange('relievingLetter', e.target.checked)}
                />
                Relieving Letter
              </label>

              <label className="creating-employee-document-checkbox">
                <input
                  type="checkbox"
                  checked={userData.documents.salarySlips}
                  onChange={(e) => handleDocumentChange('salarySlips', e.target.checked)}
                />
                Salary Slips (Last 3 Months)
              </label>

              <label className="creating-employee-document-checkbox">
                <input
                  type="checkbox"
                  checked={userData.documents.uanCard}
                  onChange={(e) => handleDocumentChange('uanCard', e.target.checked)}
                />
                UAN Card / PF Passbook (If available)
              </label>

              <label className="creating-employee-document-checkbox">
                <input
                  type="checkbox"
                  checked={userData.documents.esiCard}
                  onChange={(e) => handleDocumentChange('esiCard', e.target.checked)}
                />
                ESI Card (If available)
              </label>

              <label className="creating-employee-document-checkbox">
                <input
                  type="checkbox"
                  checked={userData.documents.bankPassbook}
                  onChange={(e) => handleDocumentChange('bankPassbook', e.target.checked)}
                />
                Bank Passbook Xerox
              </label>

              <label className="creating-employee-document-checkbox">
                <input
                  type="checkbox"
                  checked={userData.documents.updatedResume}
                  onChange={(e) => handleDocumentChange('updatedResume', e.target.checked)}
                />
                Updated Resume
              </label>

              <label className="creating-employee-document-checkbox">
                <input
                  type="checkbox"
                  checked={userData.documents.passportPhotos}
                  onChange={(e) => handleDocumentChange('passportPhotos', e.target.checked)}
                />
                Passport Size Photos (2)
              </label>
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
                  value={userData.emergencyContact.name}
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
                  value={userData.emergencyContact.relationship}
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
                value={userData.emergencyContact.phone}
                onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                placeholder="Emergency contact number"
                maxLength="10"
              />
              {errors.emergencyPhone && <span className="creating-employee-form-error">{errors.emergencyPhone}</span>}
            </div>
          </div>

          <div className="creating-employee-form-section">
            <h4>Employment Details</h4>
            <div className="creating-employee-form-row">
              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">Role *</label>
                <select
                  disabled={isOtpVerified}
                  className={`creating-employee-form-select ${errors.role ? 'error' : ''}`}
                  value={userData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                >
                  <option value="">Select Role</option>
                  {ROLES.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {errors.role && <span className="creating-employee-form-error">{errors.role}</span>}
              </div>

              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">Designation</label>
                <input
                  type="text"
                  className="creating-employee-form-input"
                  value={userData.designation}
                  onChange={(e) => handleUserInputChange('designation', e.target.value)}
                  placeholder="Designation"
                />
              </div>
            </div>

            {selectedRoleObj?.requiresManager && (
              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">Reports To *</label>
                <select
                  className={`creating-employee-form-select ${errors.reportsTo ? 'error' : ''}`}
                  value={userData.reportsTo}
                  onChange={(e) => handleUserInputChange('reportsTo', e.target.value)}
                  disabled={reportingUsers.length === 0}
                >
                  <option value="">Select Reporting Manager</option>
                  {reportingUsers.length > 0 ? (
                    reportingUsers.filter(user =>
                      user.role === 'manager' || user.role === 'rm' || user.role === 'zm'
                    ).map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name} - {user.role}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Loading reporting users...
                    </option>
                  )}
                </select>
                {errors.reportsTo && <span className="creating-employee-form-error">{errors.reportsTo}</span>}
              </div>
            )}

            <div className="creating-employee-form-row">
              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">Department</label>
                <input
                  type="text"
                  className="creating-employee-form-input"
                  value={userData.department}
                  onChange={(e) => handleUserInputChange('department', e.target.value)}
                  placeholder="Department"
                />
              </div>

              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">Branch</label>
                <input
                  type="text"
                  className="creating-employee-form-input"
                  value={userData.branch}
                  onChange={(e) => handleUserInputChange('branch', e.target.value)}
                  placeholder="Branch"
                />
              </div>
            </div>

            <div className="creating-employee-form-row">
              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">Salary</label>
                <input
                  type="number"
                  className="creating-employee-form-input"
                  value={userData.salary}
                  onChange={(e) => handleUserInputChange('salary', e.target.value)}
                  placeholder="Monthly salary"
                />
              </div>

              <div className="creating-employee-form-group">
  <label className="creating-employee-form-label">Join Date</label>
  <input
    type="date"
    className={`creating-employee-form-input ${errors.joinDate ? 'error' : ''}`}
    value={userData.joinDate}
    min={today}
    onChange={(e) => handleUserInputChange('joinDate', e.target.value)}
  />
  {errors.joinDate && (
    <span className="creating-employee-form-error">{errors.joinDate}</span>
  )}
</div>

            </div>
          </div>

          {/* Email and Password at the end as requested */}
          <div className="creating-employee-form-section">
            <h4>Login Credentials</h4>
            <div className="creating-employee-form-row">
              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">Email Address *</label>
                <input
                  type="email"
                  className={`creating-employee-form-input ${errors.email ? 'error' : ''}`}
                  value={userData.email}
                  onChange={(e) => handleUserInputChange('email', e.target.value)}
                  placeholder="user@company.com"
                />
                {errors.email && <span className="creating-employee-form-error">{errors.email}</span>}
              </div>

              <div className="creating-employee-form-group">
                <label className="creating-employee-form-label">Password *</label>
                <input
                  type="password"
                  className={`creating-employee-form-input ${errors.password ? 'error' : ''}`}
                  value={userData.password}
                  onChange={(e) => handleUserInputChange('password', e.target.value)}
                  placeholder="Set password"
                />
                {errors.password && <span className="creating-employee-form-error">{errors.password}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="creating-employee-form-step">
      <div className="creating-employee-form-section">
        <h3>Review & Submit</h3>
        <p>Please review all details before creating the user</p>

        <div className="creating-employee-review-section">
          <h4>Personal Information</h4>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Full Name</span>
            <span className="creating-employee-review-value">{userData.name}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Email</span>
            <span className="creating-employee-review-value">{userData.email}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Role</span>
            <span className="creating-employee-review-value">{getRoleDisplayName(userData.role)}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Contact Number</span>
            <span className="creating-employee-review-value">{userData.contactNumber}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Father's/Husband's Name</span>
            <span className="creating-employee-review-value">{userData.fathersName}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Mother's Name</span>
            <span className="creating-employee-review-value">{userData.mothersName}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">PAN Number</span>
            <span className="creating-employee-review-value">{userData.panNumber}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Marital Status</span>
            <span className="creating-employee-review-value">{userData.maritalStatus}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Blood Group</span>
            <span className="creating-employee-review-value">{userData.bloodGroup}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Nationality</span>
            <span className="creating-employee-review-value">{userData.nationality}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Alternate Mobile</span>
            <span className="creating-employee-review-value">{userData.alternateMobile}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Present Address</span>
            <span className="creating-employee-review-value">{userData.presentAddress}</span>
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

        <div className="creating-employee-review-section">
          <h4>Statutory Details</h4>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">UAN Number</span>
            <span className="creating-employee-review-value">{userData.uanNumber || 'Not provided'}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">ESI Number</span>
            <span className="creating-employee-review-value">{userData.esiNumber || 'Not provided'}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">PF Type</span>
            <span className="creating-employee-review-value">{userData.pfType || 'Not specified'}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">ESI Status</span>
            <span className="creating-employee-review-value">{userData.esiStatus || 'Not specified'}</span>
          </div>
        </div>

        <div className="creating-employee-review-section">
          <h4>Qualifications</h4>
          {userData.qualifications.map((qual, index) => (
            <div key={index} className="creating-employee-review-item">
              <span className="creating-employee-review-label">{qual.level}</span>
              <span className="creating-employee-review-value">
                {qual.institution} ({qual.board}) - {qual.year} - {qual.grade}
              </span>
            </div>
          ))}
        </div>

        {userData.previouslyWorked && (
          <div className="creating-employee-review-section">
            <h4>Work Experience</h4>
            <div className="creating-employee-review-item">
              <span className="creating-employee-review-label">Company</span>
              <span className="creating-employee-review-value">{userData.currentEmployer.companyName}</span>
            </div>
            <div className="creating-employee-review-item">
              <span className="creating-employee-review-label">Designation</span>
              <span className="creating-employee-review-value">{userData.currentEmployer.designation}</span>
            </div>
            <div className="creating-employee-review-item">
              <span className="creating-employee-review-label">Duration</span>
              <span className="creating-employee-review-value">
                {userData.currentEmployer.fromDate} to {userData.currentEmployer.toDate}
              </span>
            </div>
            <div className="creating-employee-review-item">
              <span className="creating-employee-review-label">Total Experience</span>
              <span className="creating-employee-review-value">{userData.currentEmployer.totalExperience}</span>
            </div>
            <div className="creating-employee-review-item">
              <span className="creating-employee-review-label">Last CTC</span>
              <span className="creating-employee-review-value">{userData.currentEmployer.lastCTC}</span>
            </div>
          </div>
        )}

        <div className="creating-employee-review-section">
          <h4>Bank Details</h4>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Account Holder</span>
            <span className="creating-employee-review-value">{userData.bankAccountHolder}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Bank Name</span>
            <span className="creating-employee-review-value">{userData.bankName}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Account Number</span>
            <span className="creating-employee-review-value">{userData.accountNumber}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">IFSC Code</span>
            <span className="creating-employee-review-value">{userData.ifscCode}</span>
          </div>
          <div className="creating-employee-review-item">
            <span className="creating-employee-review-label">Branch</span>
            <span className="creating-employee-review-value">{userData.branchName}</span>
          </div>
        </div>

        <div className="creating-employee-review-section">
          <h4>Documents Submitted</h4>
          <div className="creating-employee-review-grid">
            {Object.entries(userData.documents)
              .filter(([_, submitted]) => submitted)
              .map(([doc, _]) => (
                <div key={doc} className="creating-employee-document-review">
                  ✓ {doc.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </div>
              ))}
            {Object.values(userData.documents).filter(submitted => submitted).length === 0 && (
              <div className="creating-employee-review-item">
                <span className="creating-employee-review-value">No documents marked</span>
              </div>
            )}
          </div>
        </div>

        {userData.salary && (
          <div className="creating-employee-review-section">
            <h4>Salary Details</h4>
            <div className="creating-employee-review-item">
              <span className="creating-employee-review-label">Salary</span>
              <span className="creating-employee-review-value">₹{userData.salary}</span>
            </div>
            {userData.joinDate && (
              <div className="creating-employee-review-item">
                <span className="creating-employee-review-label">Join Date</span>
                <span className="creating-employee-review-value">
                  {new Date(userData.joinDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="creating-employee-success">
      <div className="creating-employee-success-icon">✓</div>
      <h2>User Created Successfully!</h2>
      <p>
        The {getRoleDisplayName(createdUserRole)} has been added to the system with Aadhaar verification.
      </p>

      <div className="creating-employee-button-group" style={{ justifyContent: 'center', gap: '15px' }}>
        <button
          className="creating-employee-button creating-employee-button-primary"
          onClick={clearAllAndStartNew}
        >
          Create Another User
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="creating-employee-container">
        <div className="creating-employee-header">
          <h1>Create New User</h1>
          <p>Complete the step-by-step process to add a new user with Aadhaar verification</p>
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
                {step === 3 && 'User Details'}
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
                  className="creating-employee-button creating-employee-button-secondary"
                  onClick={saveAndAddAnother}
                  disabled={(currentStep === 1&& otpSent && !otp )}
                >
                  Save Data & Add Another
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
                  {currentStep === 1 && otpSent && !isOtpVerified && 'Verify OTP'}
                  {currentStep === 1 && isOtpVerified && 'Continue to User Details'}
                  {currentStep === 2 && 'Continue to User Details'}
                  {currentStep === 3 && 'Continue to Review'}
                  {currentStep === 4 && `Create ${getRoleDisplayName(userData.role)}`}
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