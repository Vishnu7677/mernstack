import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../TWGold/TWGLogin/axiosConfig';

const LoanCreation = () => {
  // Loan creation form state
  const [loanForm, setLoanForm] = useState({
    custName: '',
    aadhaar: '',
    mobile: '',
    purity: '18', // Store as number string for easy logic
    goldWeight: '',
    reqAmount: '',
    tenure: '24'
  });

  // Calculation results from Backend
  const [calcResults, setCalcResults] = useState({
    goldValue: 0,
    ltv: 0,
    interestRate: 0,
    emiAmount: 0,
    totalInterest: 0
  });

  // Gold rates (HO Fixed)
  const [goldRates, setGoldRates] = useState({});

  useEffect(() => {
    fetchGoldRates();
  }, []);

  const fetchGoldRates = async () => {
    try {
      const res = await api.get('/twgoldrate/gold-rates/current');
      if (res.data.success) {
        setGoldRates(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch gold rates', err);
    }
  };

  
  // Calculate loan details via Backend API
  const calculateLoan = useCallback(async () => {
    try {
      const res = await api.post('/twgoldloan/loans/calculate', {
        carat: `${loanForm.purity}K`,
        weight: Number(loanForm.goldWeight),
        requestedAmount: Number(loanForm.reqAmount),
        tenure: Number(loanForm.tenure)
      });
  
      if (res.data.success) {
        setCalcResults(res.data.data);
      }
    } catch (err) {
      console.error("Calculation Error:", err.response?.data || err);
      resetCalc();
    }
  }, [
    loanForm.purity,
    loanForm.goldWeight,
    loanForm.reqAmount,
    loanForm.tenure
  ]);

   /* ================= CALCULATE EFFECT ================= */
  // Combined effect to trigger calculation whenever relevant fields change
  useEffect(() => {
    const { goldWeight, reqAmount, tenure } = loanForm;
  
    if (
      Number(goldWeight) <= 0 ||
      Number(reqAmount) <= 0 ||
      Number(tenure) <= 0
    ) {
      resetCalc();
      return;
    }
  
    const timer = setTimeout(() => {
      calculateLoan();
    }, 400);
  
    return () => clearTimeout(timer);
  
  }, [
    loanForm.goldWeight,
    loanForm.reqAmount,
    loanForm.tenure,
    loanForm.purity,
    calculateLoan
  ]);
  
  
  
  const resetCalc = () => {
    setCalcResults({
      goldValue: 0,
      ltv: 0,
      interestRate: 0,
      emiAmount: 0,
      totalInterest: 0
    });
  };

  const resetForm = () => {
    setLoanForm({
      custName: '',
      aadhaar: '',
      mobile: '',
      purity: '18',
      goldWeight: '',
      reqAmount: '',
      tenure: '24'
    });
    resetCalc();
  };

  const createLoan = async () => {
    try {
      // Note: Ensure you have a mechanism to get a real customerId. 
      // Using a placeholder or the name for now as per your snippet.
      const res = await api.post('/twgoldloan/loans', {
        customerName: loanForm.custName, 
        aadhaar: loanForm.aadhaar,
        goldItems: [{
          itemType: 'jewellery',
          description: 'Gold Ornament',
          weight: Number(loanForm.goldWeight),
          purity: Number(loanForm.purity),
          carat: `${loanForm.purity}K`,      // for loan schema
goldType: `${loanForm.purity}k`    // for rate lookup

        }],
        requestedAmount: Number(loanForm.reqAmount),
        tenure: Number(loanForm.tenure)
      });

      alert(`Loan Created: ${res.data.data.loanId}`);
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || 'Loan creation failed');
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setLoanForm(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const getLtvGaugeStyle = () => {
    const ltv = calcResults.ltv || 0;
    const deg = Math.min(ltv * 3.6, 360);
    let color = '#27ae60'; // Green
    if (ltv > 55) color = '#f39c12'; // Orange/High
    if (ltv > 85) color = '#e74c3c'; // Red/Critical

    return {
      background: `conic-gradient(${color} 0deg, ${color} ${deg}deg, #ddd ${deg}deg 360deg)`
    };
  };

  return (
    <section id="loan-creation" className="twgold_gold_loan_section">
      <h2>New Loan Account Creation</h2>
      
      {/* HO Fixed Rates */}
      <div className="twgold_gold_loan_rate-table">
        <h4>HO Fixed Gold Rates (per gram)</h4>
        <table>
          <thead>
            <tr>
              {Object.keys(goldRates).map(k => <th key={k}>{k.toUpperCase()}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              {Object.values(goldRates).map((v, i) => <td key={i}>₹{v}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="twgold_gold_loan_form-grid">
        <div className="twgold_gold_loan_form-group">
          <label htmlFor="custName">Customer Name</label>
          <input type="text" id="custName" value={loanForm.custName} onChange={handleInputChange} required />
        </div>
        
        <div className="twgold_gold_loan_form-group">
          <label htmlFor="aadhaar">Aadhaar No.</label>
          <input type="text" id="aadhaar" maxLength="12" value={loanForm.aadhaar} onChange={handleInputChange} required />
        </div>
        
        <div className="twgold_gold_loan_form-group">
          <label htmlFor="mobile">Mobile No.</label>
          <input type="tel" id="mobile" maxLength="10" value={loanForm.mobile} onChange={handleInputChange} required />
        </div>
        
        <div className="twgold_gold_loan_form-group">
          <label htmlFor="purity">Gold Purity</label>
          <select id="purity" value={loanForm.purity} onChange={handleInputChange}>
            {/* Logic Correction: Map keys to show 18K, 22K etc */}
            {Object.keys(goldRates).map(key => (
              <option key={key} value={key.replace('k', '').toUpperCase()}>
                {key.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        
        <div className="twgold_gold_loan_form-group">
          <label htmlFor="goldWeight">Gold Weight (gm)</label>
          <input type="number" id="goldWeight" step="0.01" value={loanForm.goldWeight} onChange={handleInputChange} required />
        </div>
        
        <div className="twgold_gold_loan_form-group">
          <label htmlFor="reqAmount">Required Loan Amount (₹)</label>
          <input type="number" id="reqAmount" value={loanForm.reqAmount} onChange={handleInputChange} required />
        </div>
        
        <div className="twgold_gold_loan_form-group">
          <label htmlFor="tenure">Tenure (Months)</label>
          <select id="tenure" value={loanForm.tenure} onChange={handleInputChange}>
            <option value="6">6</option>
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="36">36</option>
          </select>
        </div>
      </div>
      
      {/* Calculation Results Displaying Backend Data */}
      <div className="twgold_gold_loan_form-grid">
        <div className="twgold_gold_loan_form-group">
          <label>Gold Value (₹)</label>
          <div className="twgold_gold_loan_calc-result">
            ₹{calcResults.goldValue.toLocaleString()}
          </div>
        </div>
        
        <div className="twgold_gold_loan_form-group">
          <label>LTV (%)</label>
          <div className="twgold_gold_loan_calc-result">
            {calcResults.ltv.toFixed(1)}%
          </div>
          <div className="twgold_gold_loan_ltv-gauge">
            <div className="twgold_gold_loan_ltv-fill" style={getLtvGaugeStyle()}></div>
          </div>
        </div>
        
        <div className="twgold_gold_loan_form-group">
          <label>Interest Rate (% p.a.)</label>
          <div className="twgold_gold_loan_calc-result">
            {calcResults.interestRate.toFixed(2)}% p.a.
          </div>
        </div>
        
        <div className="twgold_gold_loan_form-group">
          <label>Monthly EMI (₹)</label>
          <div className="twgold_gold_loan_calc-result">
            ₹{calcResults.emiAmount.toLocaleString()}
          </div>
        </div>
        
        <div className="twgold_gold_loan_form-group">
          <label>Total Interest (₹)</label>
          <div className="twgold_gold_loan_calc-result">
            ₹{calcResults.totalInterest.toLocaleString()}
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button className="twgold_gold_loan_btn twgold_gold_loan_success" onClick={createLoan}>
          Create Loan Account
        </button>
        <button className="twgold_gold_loan_btn twgold_gold_loan_secondary" onClick={resetForm}>
          Reset
        </button>
      </div>
    </section>
  );
};

export default LoanCreation;