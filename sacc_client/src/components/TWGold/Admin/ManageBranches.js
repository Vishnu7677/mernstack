import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../TWGLogin/axiosConfig';
import './ManageBranches.css';
import Navbar from './Navbar';

const ManageBranches = () => {
  const [branches, setBranches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/twgoldbranch/branches');
  
      console.log(res.data.data.branches);
  
      if (
        res.data?.success &&
        res.data?.data?.branches &&
        Array.isArray(res.data.data.branches)
      ) {
        setBranches(res.data.data.branches);
      } else {
        setBranches([]);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([]);
    }
  };
  

  return (
    <>
    <Navbar/>
    <div className="admin_gold_manage_branches">
      {/* Header */}
      <div className="admin_gold_page_header">
        <h1 className="admin_gold_page_title">Manage Branches</h1>

        <button
          className="admin_gold_add_btn"
          onClick={() => navigate('/twgl&articles/admin/branches/create')}
        >
          Add New Branch
        </button>
      </div>

      {/* Branches Grid */}
      <div className="admin_gold_branches_grid">
        {branches.length === 0 ? (
          <p className="admin_gold_empty_text">No branches found</p>
        ) : (
          branches.map(branch => (
            <div key={branch._id} className="admin_gold_branch_card">
              <h3 className="admin_gold_branch_name">
                {branch.branchName || branch.name || 'Unnamed Branch'}
              </h3>

              <p className="admin_gold_branch_code">
                Code: {branch.branchCode || branch.code || 'N/A'}
              </p>

              <p className="admin_gold_branch_address">
                {branch.address?.city || 'City'}, {branch.address?.state || 'State'}
              </p>

              <p className="admin_gold_branch_contact">
                {branch.contact?.phone || 'No Contact'}
              </p>

              <div className="admin_gold_branch_actions">
              <button
  className="admin_gold_edit_btn"
  onClick={() =>
    navigate(`/twgl&articles/admin/branches/edit/${branch._id}`)
  }
>
  Edit
</button>

                <button className="admin_gold_delete_btn">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </>
  );
};

export default ManageBranches;
