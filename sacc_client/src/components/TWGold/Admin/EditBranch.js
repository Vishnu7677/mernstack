import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './Editbranch.css';

import {
  getBranchById,
  updateBranch,
  getUsersByRole,
  addEmployeeToBranch,
  addEmployeesToBranchBulk
} from '../TWGLogin/axiosConfig';

import EmployeeSearch from '../components/EmployeeSearch';
import Toast from '../../Toast';
import EditBranchSkeleton from './EditBranchSkeleton';

const EditBranch = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();

  const [branch, setBranch] = useState(null);
  const [originalBranch, setOriginalBranch] = useState(null);
  const [managers, setManagers] = useState([]);

  // employee selection
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, []);

  const loadData = async () => {
    try {
      const [branchRes, managerRes] = await Promise.all([
        getBranchById(branchId),
        getUsersByRole('manager')
      ]);

      const branchData = branchRes.data?.data;
      setBranch(branchData);
      setOriginalBranch(branchData);

      setManagers(
        Array.isArray(managerRes.data?.data)
          ? managerRes.data.data
          : managerRes.data?.data?.users || []
      );
    } catch (err) {
      Toast('error', 'Failed to load branch details');
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     EMPLOYEE SELECTION
  ================================= */

  const toggleEmployee = (employeeId) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  /* ================================
     SAVE HANDLER
  ================================= */

  const isDirty =
    JSON.stringify(branch) !== JSON.stringify(originalBranch) ||
    selectedEmployees.length > 0;

  const handleSave = async () => {
    if (!isDirty) return;

    try {
      setSaving(true);

      // 1️⃣ Update branch core data
      await updateBranch(branchId, {
        branchName: branch.branchName,
        status: branch.status,
        manager: branch.manager
      });

      // 2️⃣ Assign employees
      if (selectedEmployees.length === 1) {
        await addEmployeeToBranch(branchId, selectedEmployees[0]);
      }

      if (selectedEmployees.length > 1) {
        await addEmployeesToBranchBulk(branchId, {
          employees: selectedEmployees
        });
      }

      Toast('success', 'Branch updated successfully');
      navigate('/twgl&articles/admin/branches');
    } catch (err) {
      Toast(
        'error',
        err.response?.data?.message || 'Failed to update branch'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <EditBranchSkeleton />;
  if (!branch) return <p>Branch not found</p>;

  return (
    <>
      <Navbar />

      <div className="edit-branch-container">
        <div className="edit-branch-card">
          <h2>Edit Branch</h2>

          {/* Branch Name */}
          <label>Branch Name</label>
          <input
            type="text"
            value={branch.branchName || ''}
            onChange={e =>
              setBranch({ ...branch, branchName: e.target.value })
            }
          />

          {/* Status */}
          <label>Status</label>
          <select
            value={branch.status || 'active'}
            onChange={e =>
              setBranch({ ...branch, status: e.target.value })
            }
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>

          {/* Manager */}
          <label>Branch Manager</label>
          <select
            value={branch.manager || ''}
            onChange={e =>
              setBranch({ ...branch, manager: e.target.value })
            }
          >
            <option value="">Select Manager</option>
            {managers.map(m => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Employees */}
          <div className="employee-assign-section">
            <h4>Assign Employees</h4>

            <EmployeeSearch
              selectedEmployees={selectedEmployees}
              onToggleEmployee={toggleEmployee}
              role="employee"
            />

            {selectedEmployees.length > 0 && (
              <p className="selected-count">
                Selected: {selectedEmployees.length}
              </p>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="save-btn"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  );
};

export default EditBranch;
