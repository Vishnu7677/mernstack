import React from 'react';

const KYCUpdate = () => {
  return (
    <section id="kyc-update" className="twgold_gold_loan_section">
      <h2>KYC Update</h2>
      <div className="twgold_gold_loan_form-grid">
        <div className="twgold_gold_loan_form-group">
          <label htmlFor="kycSearch">Search Customer</label>
          <input type="text" id="kycSearch" placeholder="Loan ID / Aadhaar / Name" />
        </div>
        <div className="twgold_gold_loan_form-group">
          <label>Address Proof</label>
          <input type="file" accept=".pdf,.jpg,.png" />
        </div>
        <div className="twgold_gold_loan_form-group">
          <label>Bank Proof</label>
          <input type="file" accept=".pdf,.jpg,.png" />
        </div>
        <div className="twgold_gold_loan_form-group">
          <label>Updated Mobile</label>
          <input type="tel" placeholder="New mobile number" />
        </div>
      </div>
      <button className="twgold_gold_loan_btn twgold_gold_loan_primary">Update KYC</button>
    </section>
  );
};

export default KYCUpdate;