import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageBranches.css';

const ManageBranches = () => {
  const [branches, setBranches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: { street: '', city: '', state: '', pincode: '' },
    contact: { phone: '', email: '' },
    cashLimit: ''
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/twgl&articles/branches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBranches(response.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/twgl&articles/branches', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowForm(false);
      setFormData({
        name: '', code: '', address: { street: '', city: '', state: '', pincode: '' },
        contact: { phone: '', email: '' }, cashLimit: ''
      });
      fetchBranches();
    } catch (error) {
      console.error('Error creating branch:', error);
    }
  };

  return (
    <div className="admin_gold_manage_branches">
      <div className="admin_gold_page_header">
        <h1 className="admin_gold_page_title">Manage Branches</h1>
        <button 
          className="admin_gold_add_btn"
          onClick={() => setShowForm(true)}
        >
          Add New Branch
        </button>
      </div>

      {showForm && (
        <div className="admin_gold_modal_overlay">
          <div className="admin_gold_modal">
            <h2 className="admin_gold_modal_title">Create New Branch</h2>
            <form onSubmit={handleSubmit} className="admin_gold_form">
              <div className="admin_gold_form_group">
                <label className="admin_gold_form_label">Branch Name</label>
                <input
                  type="text"
                  className="admin_gold_form_input"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="admin_gold_form_group">
                <label className="admin_gold_form_label">Branch Code</label>
                <input
                  type="text"
                  className="admin_gold_form_input"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  required
                />
              </div>
              <div className="admin_gold_form_actions">
                <button type="submit" className="admin_gold_submit_btn">Create</button>
                <button 
                  type="button" 
                  className="admin_gold_cancel_btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin_gold_branches_grid">
        {branches.map((branch) => (
          <div key={branch._id} className="admin_gold_branch_card">
            <h3 className="admin_gold_branch_name">{branch.name}</h3>
            <p className="admin_gold_branch_code">Code: {branch.code}</p>
            <p className="admin_gold_branch_address">
              {branch.address.city}, {branch.address.state}
            </p>
            <p className="admin_gold_branch_contact">{branch.contact.phone}</p>
            <div className="admin_gold_branch_actions">
              <button className="admin_gold_edit_btn">Edit</button>
              <button className="admin_gold_delete_btn">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageBranches;