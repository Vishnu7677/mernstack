const EmployeeTable = ({ users, loading, onView, onToggleStatus }) => {
    if (loading) return <p>Loading...</p>;
  
    return (
      <table width="100%" border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Employee ID</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
  
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.roleDisplay}</td>
              <td>{u.employeeId || '-'}</td>
              <td>{u.isActive ? 'Active' : 'Inactive'}</td>
              <td>
                <button onClick={() => onView(u)}>View</button>
                {/* <button
                  onClick={() => onToggleStatus(u)}
                  style={{ marginLeft: 6 }}
                >
                  {u.isActive ? 'Deactivate' : 'Activate'}
                </button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  
  export default EmployeeTable;
  