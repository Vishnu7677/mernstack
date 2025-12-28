import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../TWGold/TWGLogin/axiosConfig';

const MIN_INTEREST_RATE = 8.3;
const MAX_LTV = 85;

const LoanCreation = () => {
  /* ================= FORM STATE ================= */
  const [loanForm, setLoanForm] = useState({
    custName: '',
    aadhaar: '',
    mobile: '',
    purity: '18K',
    goldWeight: '',
    reqAmount: '',
    tenure: '24'
  });

  /* ================= CALC RESULTS ================= */
  const [calcResults, setCalcResults] = useState({
    goldValue: 0,
    ltv: 0,
    interestRate: 0,
    emiAmount: 0,
    totalInterest: 0
  });

  /* ================= GOLD RATES ================= */
  const [goldRates, setGoldRates] = useState({});
  const [rateDate, setRateDate] = useState(null);

  /* ================= VALIDATION ================= */
  const [validationError, setValidationError] = useState('');
  // TEMP: until customer search is implemented
const [selectedCustomerId, setSelectedCustomerId] = useState('');

  /* ================= FETCH GOLD RATES ================= */
  useEffect(() => {
    fetchGoldRates();
  }, []);

  const fetchGoldRates = async () => {
    try {
      const res = await api.get('/twgoldrate/gold-rates/current');
      console.log(res.data)
  
      if (res.data.success) {
        const { date, rates } = res.data.data;
  
        setGoldRates(rates);   // ✅ ONLY numeric rates
        setRateDate(date);     // ✅ keep date separate
      }
    } catch (err) {
      console.error('Failed to fetch gold rates', err);
    }
  };
  

  /* ================= CALCULATE LOAN ================= */
  const calculateLoan = useCallback(async () => {
    try {
      setValidationError('');

      const res = await api.post('/twgoldloan/loans/calculate', {
        carat: loanForm.purity,
        weight: Number(loanForm.goldWeight),
        requestedAmount: Number(loanForm.reqAmount),
        tenure: Number(loanForm.tenure)
      });

      if (res.data.success) {
        const data = res.data.data;

        // 🔐 Frontend validations
        if (data.ltv > MAX_LTV) {
          setValidationError('LTV should not exceed 85%');
        } else if (data.interestRate < MIN_INTEREST_RATE) {
          setValidationError('Interest Rate should not be less than 8.3%');
        }

        setCalcResults(data);
      }
    } catch (err) {
        console.error('Calculation Error:', err.response?.data || err);
      
        // ✅ Show backend validation message (LTV > 85)
        if (err.response?.data?.message) {
          setValidationError(err.response.data.message);
        } else {
          setValidationError('Unable to calculate loan. Please check inputs.');
        }
      
        resetCalc();
      }      
  }, [loanForm]);

  /* ================= AUTO CALCULATE ================= */
  useEffect(() => {
    const { goldWeight, reqAmount, tenure } = loanForm;

    if (
      Number(goldWeight) <= 0 ||
      Number(reqAmount) <= 0 ||
      Number(tenure) <= 0
    ) {
      resetCalc();
      setValidationError('');
      return;
    }

    const timer = setTimeout(() => {
      calculateLoan();
    }, 400);

    return () => clearTimeout(timer);
  }, [loanForm, calculateLoan]);

  /* ================= HELPERS ================= */
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
      purity: '18K',
      goldWeight: '',
      reqAmount: '',
      tenure: '24'
    });
    resetCalc();
    setValidationError('');
  };

  /* ================= CREATE LOAN ================= */
  const createLoan = async () => {
    if (!selectedCustomerId) {
      return alert('Customer ID is required');
    }
  
    if (calcResults.ltv > 85) {
      return alert('Cannot create loan. LTV exceeds 85%');
    }
  
    if (calcResults.interestRate < 8.3) {
      return alert('Invalid Interest Rate');
    }
  
    try {
      const res = await api.post('/twgoldloan/loans', {
        customerId: selectedCustomerId,
        goldItems: [
          {
            itemType: 'jewellery',
            description: 'Gold Ornament',
            weight: Number(loanForm.goldWeight),
            carat: loanForm.purity,
            purity: Number(loanForm.purity.replace('K', ''))
          }
        ],
        requestedAmount: Number(loanForm.reqAmount),
        tenure: Number(loanForm.tenure)
      });
  
      alert(`Loan Created Successfully: ${res.data.data.loanId}`);
      resetForm();
      setSelectedCustomerId('');
    } catch (err) {
      alert(err.response?.data?.message || 'Loan creation failed');
    }
  };
  

  /* ================= INPUT HANDLER ================= */
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setLoanForm(prev => ({
      ...prev,
      [id]: value
    }));
  };

  /* ================= LTV GAUGE ================= */
  const getLtvGaugeStyle = () => {
    const ltv = calcResults.ltv || 0;
    const deg = Math.min(ltv * 3.6, 360);
    let color = '#27ae60';
    if (ltv > 55) color = '#f39c12';
    if (ltv > 85) color = '#e74c3c';

    return {
      background: `conic-gradient(${color} 0deg, ${color} ${deg}deg, #ddd ${deg}deg 360deg)`
    };
  };

  const isCreateDisabled =
    !calcResults.goldValue ||
    calcResults.ltv > MAX_LTV ||
    calcResults.interestRate < MIN_INTEREST_RATE ||
    !!validationError;

  /* ================= JSX ================= */
  return (
    <section id="loan-creation" className="twgold_gold_loan_section">
      <h2>New Loan Account Creation</h2>

      {/* GOLD RATES */}
      <div className="twgold_gold_loan_rate-table">
  <h4>HO Fixed Gold Rates (per gram)</h4>

  {rateDate && (
    <small>
      Effective Date: {new Date(rateDate).toDateString()}
    </small>
  )}

  <table>
    <thead>
      <tr>
        {Object.keys(goldRates).map(k => (
          <th key={k}>{k}</th>
        ))}
      </tr>
    </thead>

    <tbody>
      <tr>
        {Object.values(goldRates).map((v, i) => (
          <td key={i}>₹{Number(v).toLocaleString()}</td>
        ))}
      </tr>
    </tbody>
  </table>
</div>


      {/* FORM */}
      <div className="twgold_gold_loan_form-grid">
      <div className="twgold_gold_loan_form-group">
  <label>Customer ID</label>
  <input
    type="text"
    value={selectedCustomerId}
    onChange={(e) => setSelectedCustomerId(e.target.value)}
    placeholder="Enter Customer ID"
    required
  />
</div>

        <div className="twgold_gold_loan_form-group">
          <label>Customer Name</label>
          <input id="custName" value={loanForm.custName} onChange={handleInputChange} />
        </div>

        <div className="twgold_gold_loan_form-group">
          <label>Aadhaar No</label>
          <input id="aadhaar" maxLength="12" value={loanForm.aadhaar} onChange={handleInputChange} />
        </div>

        <div className="twgold_gold_loan_form-group">
          <label>Mobile</label>
          <input id="mobile" maxLength="10" value={loanForm.mobile} onChange={handleInputChange} />
        </div>

        <div className="twgold_gold_loan_form-group">
          <label>Gold Purity</label>
          <select id="purity" value={loanForm.purity} onChange={handleInputChange}>
            {Object.keys(goldRates).map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        <div className="twgold_gold_loan_form-group">
          <label>Gold Weight (gm)</label>
          <input id="goldWeight" type="number" step="0.01" value={loanForm.goldWeight} onChange={handleInputChange} />
        </div>

        <div className="twgold_gold_loan_form-group">
          <label>Required Amount (₹)</label>
          <input id="reqAmount" type="number" value={loanForm.reqAmount} onChange={handleInputChange} />
        </div>

        <div className="twgold_gold_loan_form-group">
          <label>Tenure</label>
          <select id="tenure" value={loanForm.tenure} onChange={handleInputChange}>
            <option value="6">6</option>
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="36">36</option>
          </select>
        </div>
      </div>

      {/* CALC RESULTS */}
      <div className="twgold_gold_loan_form-grid">
        <div className="twgold_gold_loan_form-group">
          <label>Gold Value</label>
          <div className="twgold_gold_loan_calc-result">₹{calcResults.goldValue.toLocaleString()}</div>
        </div>

        <div className="twgold_gold_loan_form-group">
          <label>LTV (%)</label>
          <div className="twgold_gold_loan_calc-result">{calcResults.ltv.toFixed(1)}%</div>
          <div className="twgold_gold_loan_ltv-gauge">
            <div className="twgold_gold_loan_ltv-fill" style={getLtvGaugeStyle()} />
          </div>
        </div>

        <div className="twgold_gold_loan_form-group">
          <label>Interest Rate</label>
          <div className="twgold_gold_loan_calc-result">
            {calcResults.interestRate.toFixed(2)}% p.a.
          </div>
        </div>

        <div className="twgold_gold_loan_form-group">
          <label>EMI</label>
          <div className="twgold_gold_loan_calc-result">
            ₹{calcResults.emiAmount.toLocaleString()}
          </div>
        </div>

        <div className="twgold_gold_loan_form-group">
          <label>Total Interest</label>
          <div className="twgold_gold_loan_calc-result">
            ₹{calcResults.totalInterest.toLocaleString()}
          </div>
        </div>
      </div>

      {validationError && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          ⚠️ {validationError}
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <button
          className="twgold_gold_loan_btn twgold_gold_loan_success"
          disabled={isCreateDisabled}
          onClick={createLoan}
        >
          Create Loan Account
        </button>

        <button
          className="twgold_gold_loan_btn twgold_gold_loan_secondary"
          onClick={resetForm}
        >
          Reset
        </button>
      </div>
    </section>
  );
};

export default LoanCreation;
