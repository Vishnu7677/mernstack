const ManagerLoanList = () => (
    <div className="twgold_manager_card">
      <h3>Active Loan Ledger</h3>
  
      <table className="twgold_manager_table">
        <thead>
          <tr>
            <th>Loan No</th>
            <th>Customer</th>
            <th>Principal</th>
            <th>Next Due</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>GL25000142</td>
            <td>Ramesh Verma</td>
            <td>₹ 80,000</td>
            <td>15 Jan 2026</td>
            <td><span className="status_active">Active</span></td>
          </tr>
          <tr>
            <td>GL25000145</td>
            <td>Sita Sharma</td>
            <td>₹ 1,20,000</td>
            <td>10 Dec 2025</td>
            <td><span className="status_overdue">Overdue</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
  
  export default ManagerLoanList;
  