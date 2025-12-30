const NewLoan = ({ loans, loading, onDecision, processingId }) => {
    if (loading) return <div>Loading approvals...</div>;
  
    return (
      <div className="twgold_manager_card">
        <div className="twgold_manager_header_row">
          <h3>New Loan Approval Queue</h3>
          <span className="twgold_manager_badge">
            {loans.length} Pending
          </span>
        </div>
  
        <table className="twgold_manager_table">
          <thead>
            <tr>
              <th>Cust ID</th>
              <th>Customer</th>
              <th>Gold</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
  
          <tbody>
            {loans.map(loan => (
              <tr key={loan._id}>
                <td>{loan.customerId}</td>
                <td>{loan.customerName}</td>
                <td>{loan.goldWeight}g</td>
                <td>₹ {loan.amount}</td>
                <td>
                  <button
                    className="twgold_manager_action_btn approve"
                    disabled={processingId === loan._id}
                    onClick={() => onDecision(loan._id, 'approve')}
                  >
                    Approve
                  </button>
  
                  <button
                    className="twgold_manager_action_btn reject"
                    disabled={processingId === loan._id}
                    onClick={() => onDecision(loan._id, 'reject')}
                    style={{ marginLeft: '8px' }}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
  
            {loans.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  No pending approvals 🎉
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default NewLoan;
  