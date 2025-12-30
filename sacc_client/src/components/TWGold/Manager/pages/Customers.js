const Customers = ({
    query,
    setQuery,
    customers,
    onSearch
  }) => (
    <div className="twgold_manager_card">
      <h3>Customer Management</h3>
  
      <input
        className="twgold_manager_input"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search by Name, Mobile or Aadhaar"
      />
  
      <button
        className="twgold_manager_button"
        onClick={onSearch}
      >
        Search
      </button>
  
      <table className="twgold_manager_table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>KYC</th>
            <th>History</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td>{c.mobile}</td>
              <td>{c.kycStatus}</td>
              <td>
                <button className="twgold_manager_text_btn">
                  View Loans
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
  export default Customers;
  