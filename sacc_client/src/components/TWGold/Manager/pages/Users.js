const Users = ({
    empId,
    setEmpId,
    role,
    setRole,
    onAdd
  }) => (
    <div className="twgold_manager_card">
      <h3>Branch User Management</h3>
  
      <input
        className="twgold_manager_input"
        value={empId}
        onChange={e => setEmpId(e.target.value)}
        placeholder="Employee ID"
      />
  
      <select
        className="twgold_manager_select"
        value={role}
        onChange={e => setRole(e.target.value)}
      >
        <option value="">Select Role</option>
        <option value="clerk">Clerk</option>
        <option value="assistant_manager">Assistant Manager</option>
      </select>
  
      <button className="twgold_manager_button" onClick={onAdd}>
        Add User
      </button>
    </div>
  );
  
  export default Users;
  