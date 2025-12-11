import React, { useState } from 'react';

const AppraisalModal = ({ loan, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    weight: loan.weight,
    purity: loan.purity,
    valuation: loan.valuation
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    onSave({
      ...formData,
      status: 'Appraised'
    });
  };

  return (
    <div className="employee_dashboard_modal_overlay">
      <div className="employee_dashboard_modal">
        <div className="employee_dashboard_modal_header">
          <h3 className="employee_dashboard_modal_title">
            Appraise Pledge — {loan.loanId}
          </h3>
          <button className="employee_dashboard_modal_close" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="employee_dashboard_modal_content">
          <div className="employee_dashboard_form_grid">
            <div className="employee_dashboard_form_group">
              <label className="employee_dashboard_form_label">Weight (g)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="employee_dashboard_form_input"
              />
            </div>
            <div className="employee_dashboard_form_group">
              <label className="employee_dashboard_form_label">Purity</label>
              <select
                name="purity"
                value={formData.purity}
                onChange={handleChange}
                className="employee_dashboard_form_select"
              >
                <option value="22K">22K</option>
                <option value="18K">18K</option>
                <option value="21K">21K</option>
                <option value="24K">24K</option>
              </select>
            </div>
            <div className="employee_dashboard_form_group employee_dashboard_form_full">
              <label className="employee_dashboard_form_label">Assessed Value (₹)</label>
              <input
                type="number"
                name="valuation"
                value={formData.valuation}
                onChange={handleChange}
                className="employee_dashboard_form_input"
              />
            </div>
          </div>
        </div>

        <div className="employee_dashboard_modal_footer">
          <button className="employee_dashboard_cancel_btn" onClick={onClose}>
            Cancel
          </button>
          <button className="employee_dashboard_save_btn" onClick={handleSubmit}>
            Save Appraisal
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppraisalModal;