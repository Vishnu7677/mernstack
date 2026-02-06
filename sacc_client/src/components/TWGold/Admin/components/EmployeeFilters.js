const EmployeeFilters = ({ setFilters }) => {
    const handleChange = (e) => {
      setFilters((prev) => ({
        ...prev,
        [e.target.name]: e.target.value || undefined,
      }));
    };
  
    return (
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          placeholder="Search by name"
          name="name"
          onChange={handleChange}
        />
  
        <select name="role" onChange={handleChange}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
          <option value="clerk">Clerk</option>
        </select>
  
        <input
          placeholder="Branch"
          name="branch"
          onChange={handleChange}
        />
  
        <input
          placeholder="Department"
          name="department"
          onChange={handleChange}
        />
      </div>
    );
  };
  
  export default EmployeeFilters;
  