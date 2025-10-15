import React, { useState, useRef } from 'react';
import './TournamentsApp.css';

const MemberPopup = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    father: '',
    mother: '',
    dob: '',
    aadhar: '',
    phone: '',
    institution: '',
    village: '',
    mail: '',
    photo: null
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const fileInputRef = useRef(null);

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
      }

      setPhotoPreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.father || !formData.mother || !formData.dob || 
        !formData.aadhar || !formData.phone || !formData.village) {
      alert('Please fill all required fields');
      return;
    }

    if (!formData.photo) {
      alert('Please upload a photo');
      return;
    }

    if (onSave(formData)) {
      setFormData({
        name: '',
        father: '',
        mother: '',
        dob: '',
        aadhar: '',
        phone: '',
        institution: '',
        village: '',
        mail: '',
        photo: null
      });
      setPhotoPreview('');
    }
  };

  return (
    <div className="tournaments_popup">
      <div className="tournaments_popup__overlay" onClick={onClose}></div>
      <div className="tournaments_popup__content">
        <div className="tournaments_popup__header">
          <h3>Add Team Member</h3>
          <button className="tournaments_popup__close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="tournaments_popup__form">
          {/* Photo Upload */}
          <div className="tournaments_form__group">
            <label className="tournaments_form__label">Member Photo:</label>
            <div className="tournaments_photo-upload" onClick={handlePhotoClick}>
              {photoPreview ? (
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="tournaments_photo-upload__preview show"
                />
              ) : (
                <div>
                  <div className="tournaments_photo-upload__icon">📷</div>
                  <div className="tournaments_photo-upload__text">
                    Click to upload photo
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              <div className="tournaments_photo-upload__btn">
                {photoPreview ? 'Change Photo' : 'Upload Photo'}
              </div>
            </div>
          </div>

          {/* Member Details */}
          {['name','father','mother','dob','aadhar','phone','institution','village','mail'].map(field => (
            <div key={field} className="tournaments_form__group">
              <label className="tournaments_form__label">{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
              <input
                type={field==='dob'?'date': field==='mail'?'email': 'text'}
                className="tournaments_form__input"
                value={formData[field]}
                onChange={handleInputChange(field)}
                maxLength={field==='aadhar'?12: field==='phone'?10: undefined}
                required={['name','father','mother','dob','aadhar','phone','village'].includes(field)}
              />
            </div>
          ))}

          <div className="tournaments_popup__actions">
            <button type="submit" className="tournaments_btn tournaments_btn--primary">
              Save Member
            </button>
            <button type="button" className="tournaments_btn tournaments_btn--secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberPopup;
