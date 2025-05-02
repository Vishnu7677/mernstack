import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { schoolSignup, verifySchoolOtp } from '../../../../Services/api';
import './scholar-signup.css';

const SchoolSignup = () => {
  const [formData, setFormData] = useState({
    institutionName: '',
    houseNumber: '',
    street: '',
    village: '',
    district: '',
    pincode: '',
    state: '',
    country: '',
    licenceNumber: '',
    licencePhoto: null,
    category: '',
    phone: '',
    altPhone: '',
    email: '',
    altEmail: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        licencePhoto: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.institutionName.trim()) newErrors.institutionName = 'Institution name is required';
    if (!formData.houseNumber.trim()) newErrors.houseNumber = 'House number is required';
    if (!formData.street.trim()) newErrors.street = 'Street is required';
    if (!formData.village.trim()) newErrors.village = 'Village is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Valid 6-digit pincode is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.licenceNumber.trim()) newErrors.licenceNumber = 'Licence number is required';
    if (!formData.licencePhoto) newErrors.licencePhoto = 'Licence photo is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Valid 10-digit phone number is required';
    if (formData.altPhone && !/^\d{10}$/.test(formData.altPhone)) newErrors.altPhone = 'Valid 10-digit phone number is required';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (formData.altEmail && !/^\S+@\S+\.\S+$/.test(formData.altEmail)) newErrors.altEmail = 'Valid email is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
  
    try {
      const formDataToSend = new FormData();
      
      // Append all text fields
      formDataToSend.append('institutionName', formData.institutionName);
      formDataToSend.append('houseNumber', formData.houseNumber);
      formDataToSend.append('street', formData.street);
      formDataToSend.append('village', formData.village);
      formDataToSend.append('district', formData.district);
      formDataToSend.append('pincode', formData.pincode);
      formDataToSend.append('state', formData.state);
      formDataToSend.append('country', formData.country);
      formDataToSend.append('licenceNumber', formData.licenceNumber);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('altPhone', formData.altPhone);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('altEmail', formData.altEmail);
      
      // Append the file
      if (formData.licencePhoto) {
        formDataToSend.append('licencePhoto', formData.licencePhoto);
      }
  
      // Don't set Content-Type header manually - let browser set it with boundary
      await schoolSignup(formDataToSend);
      setOtpSent(true);
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };
  

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      await verifySchoolOtp({ 
        phone: formData.phone, 
        email: formData.email,
        otp 
      });
      navigate('/scholar/apply/school-or-college');
    } catch (error) {
      setErrors({ otp: 'Invalid OTP' });
      navigate('/scholar/apply');
    }
  };

  if (otpSent) {
    return (
      <form onSubmit={handleOtpSubmit}>
        <div className="form-group">
          <label>
            Enter OTP sent to your phone and email
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className={`form-control ${errors.otp ? 'is-invalid' : ''}`}
            required
          />
          {errors.otp && <div className="invalid-feedback">{errors.otp}</div>}
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-block mt-4"
        >
          Verify OTP
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Institution Name */}
      <div className="scholar_signup_form_group">
        <label htmlFor="institutionName" className="scholar_signup_label">
          School/College Name
        </label>
        <input
          type="text"
          id="institutionName"
          name="institutionName"
          value={formData.institutionName}
          onChange={handleChange}
          className="scholar_signup_input"
        />
        {errors.institutionName && <p className="scholar_signup_error">{errors.institutionName}</p>}
      </div>

      {/* Address Section */}
      <div className="scholar_signup_address_section">
        <h3 className="scholar_signup_section_title">Address Details</h3>
        
        {/* House Number */}
        <div className="scholar_signup_form_group">
          <label htmlFor="houseNumber" className="scholar_signup_label">
            House/Building Number
          </label>
          <input
            type="text"
            id="houseNumber"
            name="houseNumber"
            value={formData.houseNumber}
            onChange={handleChange}
            className="scholar_signup_input"
          />
          {errors.houseNumber && <p className="scholar_signup_error">{errors.houseNumber}</p>}
        </div>

        {/* Street */}
        <div className="scholar_signup_form_group">
          <label htmlFor="street" className="scholar_signup_label">
            Street
          </label>
          <input
            type="text"
            id="street"
            name="street"
            value={formData.street}
            onChange={handleChange}
            className="scholar_signup_input"
          />
          {errors.street && <p className="scholar_signup_error">{errors.street}</p>}
        </div>

        {/* Village */}
        <div className="scholar_signup_form_group">
          <label htmlFor="village" className="scholar_signup_label">
            Village/Town/City
          </label>
          <input
            type="text"
            id="village"
            name="village"
            value={formData.village}
            onChange={handleChange}
            className="scholar_signup_input"
          />
          {errors.village && <p className="scholar_signup_error">{errors.village}</p>}
        </div>

        {/* District */}
        <div className="scholar_signup_form_group">
          <label htmlFor="district" className="scholar_signup_label">
            District
          </label>
          <input
            type="text"
            id="district"
            name="district"
            value={formData.district}
            onChange={handleChange}
            className="scholar_signup_input"
          />
          {errors.district && <p className="scholar_signup_error">{errors.district}</p>}
        </div>

        {/* Pincode */}
        <div className="scholar_signup_form_group">
          <label htmlFor="pincode" className="scholar_signup_label">
            Pincode
          </label>
          <input
            type="text"
            id="pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            className="scholar_signup_input"
            maxLength="6"
          />
          {errors.pincode && <p className="scholar_signup_error">{errors.pincode}</p>}
        </div>

        {/* State */}
        <div className="scholar_signup_form_group">
          <label htmlFor="state" className="scholar_signup_label">
            State
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="scholar_signup_input"
          />
          {errors.state && <p className="scholar_signup_error">{errors.state}</p>}
        </div>

        {/* Country */}
        <div className="scholar_signup_form_group">
          <label htmlFor="country" className="scholar_signup_label">
            Country
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="scholar_signup_input"
          />
          {errors.country && <p className="scholar_signup_error">{errors.country}</p>}
        </div>
      </div>

      {/* Category */}
      <div className="scholar_signup_form_group">
        <label htmlFor="category" className="scholar_signup_label">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="scholar_signup_select"
        >
          <option value="">Select Category</option>
          <option value="UGC">UGC</option>
          <option value="AICTE">AICTE</option>
          <option value="CBSE">CBSE</option>
          <option value="State">State Board</option>
          <option value="Other">Other</option>
        </select>
        {errors.category && <p className="scholar_signup_error">{errors.category}</p>}
      </div>

      {/* Licence Number */}
      <div className="scholar_signup_form_group">
        <label htmlFor="licenceNumber" className="scholar_signup_label">
          Licence Number
        </label>
        <input
          type="text"
          id="licenceNumber"
          name="licenceNumber"
          value={formData.licenceNumber}
          onChange={handleChange}
          className="scholar_signup_input"
        />
        {errors.licenceNumber && <p className="scholar_signup_error">{errors.licenceNumber}</p>}
      </div>

      {/* Licence Photo */}
      <div className="scholar_signup_form_group">
        <label htmlFor="licencePhoto" className="scholar_signup_label">
          Licence Photo
        </label>
        <input
          type="file"
          id="licencePhoto"
          name="licencePhoto"
          accept="image/*"
          onChange={handleFileChange}
          className="scholar_signup_input"
        />
        {previewImage && (
          <div className="image-preview">
            <img 
              src={previewImage} 
              alt="Licence preview" 
              style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px' }}
            />
          </div>
        )}
        {errors.licencePhoto && <p className="scholar_signup_error">{errors.licencePhoto}</p>}
      </div>


      {/* Phone */}
      <div className="scholar_signup_form_group">
        <label htmlFor="phone" className="scholar_signup_label">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="scholar_signup_input"
        />
        {errors.phone && <p className="scholar_signup_error">{errors.phone}</p>}
      </div>

      {/* Alt Phone */}
      <div className="scholar_signup_form_group">
        <label htmlFor="altPhone" className="scholar_signup_label">
          Alternative Phone/Telephone (Optional)
        </label>
        <input
          type="tel"
          id="altPhone"
          name="altPhone"
          value={formData.altPhone}
          onChange={handleChange}
          className="scholar_signup_input"
        />
        {errors.altPhone && <p className="scholar_signup_error">{errors.altPhone}</p>}
      </div>

      {/* Email */}
      <div className="scholar_signup_form_group">
        <label htmlFor="email" className="scholar_signup_label">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="scholar_signup_input"
        />
        {errors.email && <p className="scholar_signup_error">{errors.email}</p>}
      </div>

      {/* Alt Email */}
      <div className="scholar_signup_form_group">
        <label htmlFor="altEmail" className="scholar_signup_label">
          Alternative Email (Optional)
        </label>
        <input
          type="email"
          id="altEmail"
          name="altEmail"
          value={formData.altEmail}
          onChange={handleChange}
          className="scholar_signup_input"
        />
        {errors.altEmail && <p className="scholar_signup_error">{errors.altEmail}</p>}
      </div>

      {errors.submit && <p className="scholar_signup_error">{errors.submit}</p>}

      <button
        type="submit"
        className="scholar_signup_button"
      >
        Sign Up
      </button>
    </form>
  );
};

export default SchoolSignup;