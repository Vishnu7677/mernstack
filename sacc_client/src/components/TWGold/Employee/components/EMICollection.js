import React, { useState } from 'react';
import { api } from '../../../TWGold/TWGLogin/axiosConfig';
const EMICollection = () => {
    const [emiData, setEmiData] = useState([]);

  // Collect EMI
  const collectEMI = async (loanId) => {
    try {
      await api.post('/twgoldloan/loans/collect-emi', {
        loanId,
        amount: 2500,
        paymentMethod: 'cash'
      });
  
      alert('EMI collected successfully');
    } catch (err) {
      alert('EMI collection failed');
    }
  };
  

  return (
    <section id="emi-collection" className="twgold_gold_loan_section">
      <h2>EMI Collection</h2>
      <div className="twgold_gold_loan_form-grid">
        <div className="twgold_gold_loan_form-group">
          <label htmlFor="emiSearch">Search Loan ID / Customer</label>
          <input 
            type="text" 
            id="emiSearch" 
            placeholder="GL-XXX or customer name" 
          />
        </div>
        <div className="twgold_gold_loan_form-group">
          <label htmlFor="paymentMode">Payment Mode</label>
          <select id="paymentMode">
            <option>Cash</option>
            <option>UPI</option>
            <option>Bank Transfer</option>
          </select>
        </div>
      </div>
      
      <table className="twgold_gold_loan_table" id="emiTable">
        <thead>
          <tr>
            <th>Loan ID</th>
            <th>Customer</th>
            <th>Due Amount</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {emiData.map((item, index) => (
            <tr key={index}>
              <td>{item.id}</td>
              <td>{item.customer}</td>
              <td>{item.dueAmount}</td>
              <td>{item.dueDate}</td>
              <td className="twgold_gold_loan_status-pending">{item.status}</td>
              <td>
                <button 
                  className="twgold_gold_loan_btn twgold_gold_loan_success" 
                  onClick={() => collectEMI(item.id)}
                >
                  Collect
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default EMICollection;