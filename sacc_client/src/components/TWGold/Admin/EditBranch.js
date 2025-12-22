import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../TWGLogin/axiosConfig';
import Navbar from './Navbar';

const EditBranch = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();

  const [branch, setBranch] = useState(null);
  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchBranch();
    fetchManagers();
    fetchEmployees();
  }, []);

  const fetchBranch = async () => {
    const res = await api.get(`/twgoldbranch/branches/${branchId}`);
    setBranch(res.data?.data || null);
  };

  const fetchManagers = async () => {
    const res = await api.get('/twgoldlogin/users/role/manager');

    setManagers(
      Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.data?.users)
        ? res.data.data.users
        : []
    );
  };

  const fetchEmployees = async () => {
    const res = await api.get('/twgoldlogin/users/role/employee');

    setEmployees(
      Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.data?.users)
        ? res.data.data.users
        : []
    );
  };

  const handleSave = async () => {
    await api.put(`/twgoldbranch/branches/${branchId}`, branch);
    navigate('/twgl&articles/admin/branches');
  };

  if (!branch) return <p>Loading...</p>;

  return (
    <>
      <Navbar />
      <div className="admin_gold_edit_branch">
        <h2>Edit Branch</h2>

        {/* Branch Name */}
        <input
          value={branch.branchName || ''}
          onChange={e =>
            setBranch({ ...branch, branchName: e.target.value })
          }
        />

        {/* Status */}
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

        <button onClick={handleSave}>Save Changes</button>
      </div>
    </>
  );
};

export default EditBranch;
