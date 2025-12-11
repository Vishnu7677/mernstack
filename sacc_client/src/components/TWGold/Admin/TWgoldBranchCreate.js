import React, { useState, useEffect } from 'react';
import './TWgold_branch_styles.css';
import { api } from '../TWGLogin/axiosConfig';
import Navbar from './Navbar'

const TWgoldBranchCreate = () => {
  const [form, setForm] = useState({
    branchCode: 'AUTO-GENERATED',
    branchName: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      landmark: '',
      coordinates: { latitude: '', longitude: '' }
    },
    contact: { 
      phone: '', 
      landline: '',
      email: '', 
      emergencyContact: '',
      gstin: ''
    },
    timing: {
      monday: { open: '', close: '' },
      tuesday: { open: '', close: '' },
      wednesday: { open: '', close: '' },
      thursday: { open: '', close: '' },
      friday: { open: '', close: '' },
      saturday: { open: '', close: '' },
      sunday: { open: '', close: '', closed: true }
    },
    manager: '',
    managerLogin: {
      loginId: '',
      password: '',
      confirmPassword: ''
    },
    employees: [],
    grivirenceOfficers: [],
    facilities: [],
    financials: {
      openingBalance: '',
      branchLimit: ''
    },
    status: 'active',
    establishedDate: '',
    regionalOffice: '',
    zone: ''
  });

  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

   useEffect(() => {
      fetchManagers();
    }, []);
  
    const fetchManagers = async () => {
      try {
        setLoading(true); // Start loading
        const response = await api.get('/twgoldlogin/managers');
    
        // Always ensure we have an array
        let managersArray = [];
    
        // Check if response exists and has data
        if (response.data) {
          // Check nested structure first
          if (response.data.success && response.data.data && response.data.data.managers) {
            managersArray = response.data.data.managers.map(manager => ({
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
          }
          // Check root level array
          else if (Array.isArray(response.data.managers)) {
            managersArray = response.data.managers.map(manager => ({
              _id: manager.id || manager._id,
              id: manager.id || manager._id,
              employeeId: manager.id || manager._id,
              name: manager.user?.name || manager.name || 'Unknown',
              email: manager.user?.email || manager.email || '',
              department: manager.department || 'No Department',
              fullName: manager.user?.name || manager.name || 'Unknown'
            }));
          }
          // Check if response.data itself is an array
          else if (Array.isArray(response.data)) {
            managersArray = response.data.map(manager => ({
              _id: manager.id || manager._id,
              id: manager.id || manager._id,
              employeeId: manager.id || manager._id,
              name: manager.user?.name || manager.name || 'Unknown',
              email: manager.user?.email || manager.email || '',
              department: manager.department || 'No Department',
              fullName: manager.user?.name || manager.name || 'Unknown'
            }));
          }
          // Fallback: try to extract any array from the response
          else {
            console.log('Full API Response:', response.data);
            
            // Try to find any array in the response
            const findArrayInResponse = (obj) => {
              for (const key in obj) {
                if (Array.isArray(obj[key])) {
                  return obj[key];
                }
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                  const found = findArrayInResponse(obj[key]);
                  if (found) return found;
                }
              }
              return null;
            };
            
            const foundArray = findArrayInResponse(response.data);
            if (foundArray && foundArray.length > 0) {
              managersArray = foundArray.map(manager => ({
                _id: manager.id || manager._id,
                id: manager.id || manager._id,
                employeeId: manager.id || manager._id,
                name: manager.user?.name || manager.name || manager.fullName || 'Unknown Manager',
                email: manager.user?.email || manager.email || '',
                department: manager.department || 'Not Specified',
                fullName: manager.user?.name || manager.name || manager.fullName || 'Unknown Manager'
              }));
            }
          }
        }
    
        setManagers(managersArray);
        setError('');
    
      } catch (error) {
        console.error('Error fetching managers:', error);
        console.error('Error response:', error.response?.data);
        setError('Failed to fetch managers list: ' + (error.response?.data?.message || error.message));
        setManagers([]); // Ensure it's always an array
      } finally {
        setLoading(false); // Stop loading
      }
    };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    if (name === 'latitude' || name === 'longitude') {
      setForm(prev => ({
        ...prev,
        address: {
          ...prev.address,
          coordinates: { ...prev.address.coordinates, [name]: value }
        }
      }));
      return;
    }
    setForm(prev => ({ ...prev, address: { ...prev.address, [name]: value } }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, contact: { ...prev.contact, [name]: value } }));
  };

  const handleManagerLoginChange = (e) => {
    const { name, value } = e.target;
    
    setForm(prev => {
      const updatedLogin = { ...prev.managerLogin, [name]: value };
      
      // Validate password match after state update
      if (name === 'password' || name === 'confirmPassword') {
        const password = name === 'password' ? value : prev.managerLogin.password;
        const confirmPassword = name === 'confirmPassword' ? value : prev.managerLogin.confirmPassword;
        
        setTimeout(() => {
          if (password && confirmPassword && password !== confirmPassword) {
            setPasswordError('Passwords do not match');
          } else {
            setPasswordError('');
          }
        }, 0);
      }
      
      return { ...prev, managerLogin: updatedLogin };
    });
  };

  const handleFinancialChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      financials: { ...prev.financials, [name]: value } 
    }));
  };

  const toggleFacility = (facility) => {
    setForm(prev => {
      const exists = prev.facilities.includes(facility);
      return { 
        ...prev, 
        facilities: exists ? prev.facilities.filter(f => f !== facility) : [...prev.facilities, facility] 
      };
    });
  };

  const generateBranchCode = () => {
    const timestamp = new Date().getTime().toString().slice(-4);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `BR${random}${timestamp}`;
  };

  const validateForm = () => {
    const requiredFields = [
      !form.branchName.trim(),
      !form.address.city.trim(),
      !form.address.state.trim(),
      !form.contact.phone.trim(),
      !form.contact.landline.trim(),
      !form.contact.email.trim(),
      !form.contact.gstin.trim(),
      !form.establishedDate,
      !form.financials.openingBalance,
      !form.financials.branchLimit,
      !form.managerLogin.loginId,
      !form.managerLogin.password,
      !form.managerLogin.confirmPassword
    ];

    if (requiredFields.some(field => field)) {
      setError('Please fill all required fields marked with *');
      return false;
    }

    if (form.managerLogin.password !== form.managerLogin.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (form.managerLogin.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinRegex.test(form.contact.gstin)) {
      setError('Please enter a valid GSTIN');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPasswordError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const branchData = {
        ...form,
        branchCode: generateBranchCode()
      };

      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branchData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create branch');

      setSuccess(`Branch "${form.branchName}" created successfully with code: ${branchData.branchCode}`);
      
      // Reset form after successful submission
      setForm({
        ...form,
        branchCode: 'AUTO-GENERATED',
        branchName: '',
        address: { 
          ...form.address, 
          street: '', 
          city: '', 
          state: '', 
          pincode: '', 
          landmark: '' 
        },
        contact: { 
          ...form.contact, 
          phone: '', 
          landline: '', 
          email: '', 
          emergencyContact: '', 
          gstin: '' 
        },
        manager: '',
        managerLogin: { loginId: '', password: '', confirmPassword: '' },
        financials: { openingBalance: '', branchLimit: '' },
        establishedDate: '',
        regionalOffice: '',
        zone: '',
        facilities: []
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const facilityOptions = [
    { value: 'gold_testing_lab', label: 'Gold Testing Laboratory' },
    { value: 'safe_deposit', label: 'Safe Deposit Lockers' },
    { value: 'atm', label: '24/7 ATM Services' },
    { value: 'digital_kiosk', label: 'Digital Service Kiosk' },
    { value: 'customer_lounge', label: 'Premium Customer Lounge' },
    { value: 'security_guard', label: 'Professional Security Guard' },
    { value: 'cctv_surveillance', label: 'CCTV Surveillance System' },
    { value: 'fire_safety', label: 'Advanced Fire Safety System' },
    { value: 'wheelchair_access', label: 'Wheelchair Accessibility' },
    { value: 'valuation_service', label: 'Gold Valuation Service' },
    { value: 'insurance_facility', label: 'Insurance Services' },
    { value: 'loan_services', label: 'Gold Loan Services' }
  ];

  return (
    <div>
      <Navbar />
    <div className="TWgold_branch_container">
      <h1 className="TWgold_branch_title">Create New Branch</h1>

      <form className="TWgold_branch_form" onSubmit={handleSubmit}>
        {/* Branch Information */}
        <div className="TWgold_branch_row">
          <div>
            <label className="TWgold_branch_label">Branch Code</label>
            <input 
              className="TWgold_branch_input" 
              value={form.branchCode} 
              disabled 
              placeholder="Will be auto-generated"
            />
            <small style={{color: '#666', fontSize: '12px'}}>Branch code will be generated automatically after creation</small>
          </div>

          <div>
            <label className="TWgold_branch_label">Branch Name *</label>
            <input 
              className="TWgold_branch_input" 
              name="branchName" 
              value={form.branchName} 
              onChange={handleChange} 
              placeholder="Enter full branch name"
              required 
            />
          </div>

          <div>
            <label className="TWgold_branch_label">Established Date *</label>
            <input 
              className="TWgold_branch_input" 
              type="date" 
              name="establishedDate" 
              value={form.establishedDate} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>

        {/* Address Section */}
        <fieldset className="TWgold_branch_fieldset">
          <legend className="TWgold_branch_legend">Branch Address</legend>
          <div className="TWgold_branch_grid">
            <div>
              <label className="TWgold_branch_label">Street Address *</label>
              <input className="TWgold_branch_input" name="street" value={form.address.street} onChange={handleAddressChange} required />
            </div>
            <div>
              <label className="TWgold_branch_label">City *</label>
              <input className="TWgold_branch_input" name="city" value={form.address.city} onChange={handleAddressChange} required />
            </div>
            <div>
              <label className="TWgold_branch_label">State *</label>
              <input className="TWgold_branch_input" name="state" value={form.address.state} onChange={handleAddressChange} required />
            </div>
            <div>
              <label className="TWgold_branch_label">Pincode *</label>
              <input className="TWgold_branch_input" name="pincode" value={form.address.pincode} onChange={handleAddressChange} required />
            </div>
            <div>
              <label className="TWgold_branch_label">Landmark</label>
              <input className="TWgold_branch_input" name="landmark" value={form.address.landmark} onChange={handleAddressChange} />
            </div>
          </div>
        </fieldset>

        {/* Contact Information */}
        <fieldset className="TWgold_branch_fieldset">
          <legend className="TWgold_branch_legend">Contact Information</legend>
          <div className="TWgold_branch_grid">
            <div>
              <label className="TWgold_branch_label">Mobile Number *</label>
              <input className="TWgold_branch_input" name="phone" value={form.contact.phone} onChange={handleContactChange} required />
            </div>
            <div>
              <label className="TWgold_branch_label">Landline Number *</label>
              <input className="TWgold_branch_input" name="landline" value={form.contact.landline} onChange={handleContactChange} required />
            </div>
            <div>
              <label className="TWgold_branch_label">Email Address *</label>
              <input className="TWgold_branch_input" type="email" name="email" value={form.contact.email} onChange={handleContactChange} required />
            </div>
            <div>
              <label className="TWgold_branch_label">Emergency Contact</label>
              <input className="TWgold_branch_input" name="emergencyContact" value={form.contact.emergencyContact} onChange={handleContactChange} />
            </div>
            <div>
              <label className="TWgold_branch_label">GSTIN Number *</label>
              <input className="TWgold_branch_input" name="gstin" value={form.contact.gstin} onChange={handleContactChange} required />
            </div>
          </div>
        </fieldset>

        {/* Financial Information */}
        <fieldset className="TWgold_branch_fieldset">
          <legend className="TWgold_branch_legend">Financial Settings</legend>
          <div className="TWgold_branch_grid">
            <div>
              <label className="TWgold_branch_label">Opening Balance (₹) *</label>
              <input 
                className="TWgold_branch_input" 
                type="number" 
                name="openingBalance" 
                value={form.financials.openingBalance} 
                onChange={handleFinancialChange} 
                required 
              />
            </div>
            <div>
              <label className="TWgold_branch_label">Branch Limit (₹) *</label>
              <input 
                className="TWgold_branch_input" 
                type="number" 
                name="branchLimit" 
                value={form.financials.branchLimit} 
                onChange={handleFinancialChange} 
                required 
              />
            </div>
          </div>
        </fieldset>

        {/* Manager Information */}
        <fieldset className="TWgold_branch_fieldset">
          <legend className="TWgold_branch_legend">Branch Manager</legend>
          <div className="TWgold_branch_grid">
    <div>
      <label className="TWgold_branch_label">Assign Manager</label>
      <select className="TWgold_branch_input" name="manager" value={form.manager} onChange={handleChange}>
        <option value="">-- Select Branch Manager --</option>
        {loading ? (
          <option value="" disabled>Loading managers...</option>
        ) : managers && Array.isArray(managers) && managers.length > 0 ? (
          managers.map(m => (
            <option key={m._id || m.id} value={m._id || m.id}>
              {m.name || m.fullName || 'Unknown'} - {m.department || 'No Department'}
            </option>
          ))
        ) : (
          <option value="" disabled>No managers available</option>
        )}
      </select>
      {error && <div style={{color: 'var(--error)', fontSize: '12px', marginTop: '5px'}}>{error}</div>}
    </div>
  </div>
          
          <div className="TWgold_branch_grid" style={{marginTop: '20px'}}>
            <div>
              <label className="TWgold_branch_label">Manager Login ID *</label>
              <input 
                className="TWgold_branch_input" 
                name="loginId" 
                value={form.managerLogin.loginId} 
                onChange={handleManagerLoginChange} 
                required 
              />
            </div>
            <div>
              <label className="TWgold_branch_label">Password *</label>
              <input 
                className="TWgold_branch_input" 
                type="password" 
                name="password" 
                value={form.managerLogin.password} 
                onChange={handleManagerLoginChange} 
                required 
              />
            </div>
            <div>
              <label className="TWgold_branch_label">Confirm Password *</label>
              <input 
                className="TWgold_branch_input" 
                type="password" 
                name="confirmPassword" 
                value={form.managerLogin.confirmPassword} 
                onChange={handleManagerLoginChange} 
                required 
              />
              {passwordError && <div style={{color: 'var(--error)', fontSize: '12px', marginTop: '5px'}}>{passwordError}</div>}
            </div>
          </div>
        </fieldset>

        {/* Facilities Section */}
        <fieldset className="TWgold_branch_fieldset">
          <legend className="TWgold_branch_legend">Branch Facilities & Services</legend>
          <div className="TWgold_branch_facilities">
            {facilityOptions.map(facility => (
              <label key={facility.value} className="TWgold_branch_facility">
                <input 
                  type="checkbox" 
                  checked={form.facilities.includes(facility.value)} 
                  onChange={() => toggleFacility(facility.value)} 
                /> 
                {facility.label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Other Fields */}
        <div className="TWgold_branch_row">
          <div>
            <label className="TWgold_branch_label">Regional Office</label>
            <input className="TWgold_branch_input" name="regionalOffice" value={form.regionalOffice} onChange={handleChange} />
          </div>
          <div>
            <label className="TWgold_branch_label">Zone</label>
            <input className="TWgold_branch_input" name="zone" value={form.zone} onChange={handleChange} />
          </div>
          <div>
            <label className="TWgold_branch_label">Status</label>
            <select className="TWgold_branch_input" name="status" value={form.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {error && <div className="TWgold_branch_error">{error}</div>}
        {success && <div className="TWgold_branch_success">{success}</div>}

        <div className="TWgold_branch_actions">
          <button type="submit" className="TWgold_branch_btn" disabled={loading}>
            {loading ? 'Creating Branch...' : 'Create Branch'}
          </button>
          <button type="button" className="TWgold_branch_btn_secondary" onClick={() => window.history.back()}>
            Cancel
          </button>
        </div>
      </form>
    </div>
    </div>
  );
}

export default TWgoldBranchCreate;