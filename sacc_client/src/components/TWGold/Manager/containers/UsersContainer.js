import { useState } from 'react';
import { updateUserPermissions } from '../../TWGLogin/axiosConfig';
import Users from '../pages/Users';

const UsersContainer = () => {
  const [empId, setEmpId] = useState('');
  const [role, setRole] = useState('');

  const handleAdd = async () => {
    await updateUserPermissions(empId, { role });
    setEmpId('');
    setRole('');
  };

  return (
    <Users
      empId={empId}
      setEmpId={setEmpId}
      role={role}
      setRole={setRole}
      onAdd={handleAdd}
    />
  );
};

export default UsersContainer;
