const NewLoan = ({ loans, processingIds, onView }) => {
  return (
    <div className="twgold_manager_card">
      <h3>New Loan Approval Queue</h3>

      <table className="twgold_manager_table">
        <thead>
          <tr>
            <th>Cust ID</th>
            <th>Name</th>
            <th>Gold</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {loans.map(loan => (
            <tr key={loan._id}>
              <td>{loan.customer.customerId}</td>
              <td>{loan.customer.name}</td>
              <td>{loan.totalGoldWeight} g</td>
              <td>₹ {loan.sanctionedAmount}</td>
              <td>
                <button
                  className="twgold_manager_action_btn view"
                  onClick={() => onView(loan)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}

          {loans.length === 0 && (
            <tr>
              <td colSpan="5" align="center">
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
  