import React, { useEffect, useState } from 'react';
import {
  getAllUsers,
  updateUserStatus
} from '../TWGLogin/axiosConfig';

import EmployeeFilters from './components/EmployeeFilters';
import EmployeeTable from './components/EmployeeTable';
import EmployeeModal from './components/EmployeeModal';
import Navbar from './Navbar';

const ManageEmployees = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const PAGE_SIZE = 10;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers(filters);
      setUsers(res.data.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const paginatedUsers = users.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const totalPages = Math.ceil(users.length / PAGE_SIZE);

  const toggleStatus = async (user) => {
    await updateUserStatus(user._id, { isActive: !user.isActive });
    fetchUsers();
  };

  return (
    <div>
        <Navbar/>
    <div style={{ padding: 24 }}>
      <h2>Employee Management</h2>

      <EmployeeFilters setFilters={setFilters} />

      <EmployeeTable
        users={paginatedUsers}
        loading={loading}
        onView={setSelectedUser}
        onToggleStatus={toggleStatus}
      />

      {/* Pagination */}
      <div style={{ marginTop: 16 }}>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            style={{
              marginRight: 6,
              padding: '6px 12px',
              background: page === i + 1 ? '#2563eb' : '#e5e7eb',
              color: page === i + 1 ? '#fff' : '#000'
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {selectedUser && (
        <EmployeeModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
    </div>
  );
};

export default ManageEmployees;
