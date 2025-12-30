const Repayments = ({
    loanNo,
    setLoanNo,
    loan,
    loading,
    onFetch,
    onSubmit
  }) => (
    <div className="twgold_manager_card">
      <h3>Record EMI / Foreclosure</h3>
  
      <div className="twgold_manager_form_row">
        <input
          className="twgold_manager_input"
          value={loanNo}
          onChange={e => setLoanNo(e.target.value)}
          placeholder="Enter Loan Number"
        />
        <button
          className="twgold_manager_button"
          onClick={onFetch}
        >
          Fetch
        </button>
      </div>
  
      {loading && <p>Loading...</p>}
  
      {loan && (
        <div className="twgold_manager_info">
          <p>Customer: <b>{loan.customerName}</b></p>
          <p>Outstanding: ₹ {loan.outstanding}</p>
          <button
            className="twgold_manager_button"
            onClick={() => onSubmit(loan.outstanding)}
          >
            Close Loan
          </button>
        </div>
      )}
    </div>
  );
  
  export default Repayments;
  