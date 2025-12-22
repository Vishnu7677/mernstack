import React from 'react';

const TodaySummary = () => {
  return (
    <section id="today-summary" className="twgold_gold_loan_section twgold_gold_loan_active-section">
      <h2>Today's Summary</h2>
      <div className="twgold_gold_loan_card-grid">
        <div className="twgold_gold_loan_card">
          <div className="twgold_gold_loan_card-title">Loans Created</div>
          <div className="twgold_gold_loan_card-value">3</div>
        </div>
        <div className="twgold_gold_loan_card">
          <div className="twgold_gold_loan_card-title">EMI Collected</div>
          <div className="twgold_gold_loan_card-value twgold_gold_loan_rupees">₹15,200</div>
        </div>
        <div className="twgold_gold_loan_card">
          <div className="twgold_gold_loan_card-title">Pending Approval</div>
          <div className="twgold_gold_loan_card-value twgold_gold_loan_warning">2</div>
        </div>
        <div className="twgold_gold_loan_card">
          <div className="twgold_gold_loan_card-title">KYC Updated</div>
          <div className="twgold_gold_loan_card-value">1</div>
        </div>
      </div>
    </section>
  );
};

export default TodaySummary;