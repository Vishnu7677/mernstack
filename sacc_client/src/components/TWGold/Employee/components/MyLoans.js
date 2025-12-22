import React, { useState, useEffect } from 'react';
import { api } from '../../../TWGold/TWGLogin/axiosConfig';

const MyLoans = () => {
    const [myLoansData, setMyLoansData] = useState([]);

    useEffect(() => {
      fetchMyLoans();
    }, []);
    
    const fetchMyLoans = async () => {
      try {
        const res = await api.get('/twgoldloan/loans/my');
        if (res.data.success) {
          setMyLoansData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    

  return (
    <section id="my-loans" className="twgold_gold_loan_section">
      <h2>My Created Loans (Pending Manager Approval)</h2>
      <table className="twgold_gold_loan_table">
        <thead>
          <tr>
            <th>Loan ID</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>LTV</th>
            <th>Gold Wt</th>
            <th>Interest Rate</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="myLoansTable">
          {myLoansData.map((loan, index) => (
            <tr key={index}>
              <td>{loan.loanAccountNumber}</td>
<td>{loan.customer?.name}</td>
<td>₹{loan.sanctionedAmount}</td>
<td>{loan.loanToValueRatio.toFixed(1)}%</td>
<td>{loan.totalGoldWeight}g</td>
<td>{loan.interestRate}%</td>


              <td>
                <span className="twgold_gold_loan_tag twgold_gold_loan_pending">
                <td>{loan.status}</td>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default MyLoans;