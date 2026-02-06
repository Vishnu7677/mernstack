import React, { useEffect, useState } from 'react';
import {
  fetchBranches,
  updateUserStatus,
  addEmployeeToBranch,
  updateUserPermissions
} from '../../TWGLogin/axiosConfig';

const EmployeeModal = ({ user, onClose }) => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(user.branch || '');
  const [isActive, setIsActive] = useState(user.isActive);
  const [permissions, setPermissions] = useState(user.permissions || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const data = await fetchBranches();
        setBranches(data);
      } catch (err) {
        console.error('Failed to load branches', err);
      }
    };
    loadBranches();
  }, []);

  const togglePermission = (module, access) => {
    setPermissions(prev => {
      const exists = prev.some(
        p =>
          p.module === module &&
          p.access === access &&
          (p.scope || 'branch') === 'branch'
      );
  
      if (exists) {
        return prev.filter(
          p =>
            !(
              p.module === module &&
              p.access === access &&
              (p.scope || 'branch') === 'branch'
            )
        );
      }
  
      return [
        ...prev,
        { module, access, scope: 'branch' }
      ];
    });
  };
  
  

  // 🔥 MAIN SAVE HANDLER
  const handleSave = async () => {
    try {
      setSaving(true);

      // 1️⃣ Update status (active / inactive)
      if (isActive !== user.isActive) {
        await updateUserStatus(user._id, { isActive });
      }

      // 2️⃣ Assign branch (only if changed & selected)
      if (selectedBranch && selectedBranch !== user.branch) {
        await addEmployeeToBranch(selectedBranch, user._id);
      }

      const permissionsChanged =
      JSON.stringify(permissions) !== JSON.stringify(user.permissions);
    
    if (permissionsChanged) {
      await updateUserPermissions(user._id, { permissions });
    }
    

      // ✅ Success
      onClose(); // parent can refetch users list
    } catch (error) {
      console.error('Failed to save employee changes', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>{user.name}</h3>

        <p><b>Email:</b> {user.email}</p>
        <p><b>Employee ID:</b> {user.employeeId}</p>
        <p><b>Role:</b> {user.role}</p>

        <hr />

        {/* STATUS */}
        <p>
          <b>Status:</b>{' '}
          <select
            value={isActive ? 'active' : 'inactive'}
            onChange={(e) => setIsActive(e.target.value === 'active')}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </p>

        {/* BRANCH ASSIGNMENT */}
        <p>
          <b>Assign Branch:</b>{' '}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="">-- Select Branch --</option>
            {branches.map(branch => (
              <option key={branch._id} value={branch._id}>
                {branch.branchName}
              </option>
            ))}
          </select>
        </p>

        <hr />

        {/* PERMISSIONS */}
        <h4>Permissions</h4>

        {[
          'employee_management',
          'loan_management',
          'customer_management',
          'finance',
          'reporting'
        ].map(module => (
          <div key={module} style={{ marginBottom: 6 }}>
            <b>{module}</b><br />
            {['read', 'write', 'manage'].map(access => (
              <label key={access} style={{ marginRight: 10 }}>
                <input
                  type="checkbox"
                  checked={permissions.some(
                    p => p.module === module && p.access === access
                  )}
                  onChange={() => togglePermission(module, access)}
                />
                {access}
              </label>
            ))}
          </div>
        ))}

        <hr />

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={saving}>
            Close
          </button>
          <button
            disabled={saving}
            style={{
              background: '#2563eb',
              color: '#fff',
              opacity: saving ? 0.6 : 1
            }}
            onClick={handleSave}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  zIndex: 50,
  overflowY: 'auto',
  padding: '60px 0'
};

const modal = {
  background: '#fff',
  padding: 20,
  width: 520,
  maxWidth: '95%',
  margin: 'auto',
  borderRadius: 8,
  maxHeight: '85vh',
  overflowY: 'auto'
};

export default EmployeeModal;
