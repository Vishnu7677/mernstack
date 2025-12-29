import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../TWGold/TWGLogin/axiosConfig';

const MIN_INTEREST_RATE = 8.3;
const MIN_LTV = 50;
const MAX_LTV = 85;
const CUSTOMER_ID_PREFIX = 'CRN200311';

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

  /* ================= CUSTOMER ================= */
  const [customerIdSuffix, setCustomerIdSuffix] = useState('');
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState('');

  const fullCustomerId =
    customerIdSuffix ? `${CUSTOMER_ID_PREFIX}${customerIdSuffix}` : '';

  /* ================= GOLD RATES ================= */
  const [goldRates, setGoldRates] = useState({});
  const [rateDate, setRateDate] = useState(null);

  /* ================= VALIDATION ================= */
  const [validationError, setValidationError] = useState('');

  /* ================= FETCH GOLD RATES ================= */
  useEffect(() => {
    fetchGoldRates();
  }, []);

  const fetchGoldRates = async () => {
    try {
      const res = await api.get('/twgoldrate/gold-rates/current');
      if (res.data.success) {
        setGoldRates(res.data.data.rates);
        setRateDate(res.data.data.date);
      }
    } catch (err) {
      console.error('Failed to fetch gold rates', err);
    }
  };

  /* ================= FETCH CUSTOMER ================= */
  const fetchCustomerById = async (customerId) => {
    if (!customerId) return;

    try {
      setCustomerLoading(true);
      setCustomerError('');

      const res = await api.get(
        `/twgoldcustomer/customers/by-customer-id/${customerId}`
      );

      const customer = res.data.data;

      if (!customer.isKycVerified) {
        setCustomerError('Customer KYC is not completed');
      }

      setLoanForm(prev => ({
        ...prev,
        custName: customer.name || '',
        mobile: customer.phone || '',
        aadhaar: customer.aadhaarDetails?.aadhaar_number || ''
      }));
    } catch (err) {
      setCustomerError(err.response?.data?.message || 'Customer not found');
      setLoanForm(prev => ({
        ...prev,
        custName: '',
        mobile: '',
        aadhaar: ''
      }));
    } finally {
      setCustomerLoading(false);
    }
  };

  useEffect(() => {
    if (!customerIdSuffix || customerIdSuffix.length < 3) {
      setCustomerError('');
      return;
    }

    const timer = setTimeout(() => {
      fetchCustomerById(fullCustomerId);
    }, 500);

    return () => clearTimeout(timer);
  }, [customerIdSuffix, fullCustomerId]);

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

      const data = res.data.data;

      if (data.ltv < MIN_LTV) {
        setValidationError('LTV should not be less than 50%');
      } else if (data.ltv > MAX_LTV) {
        setValidationError('LTV should not exceed 85%');
      } else if (data.interestRate < MIN_INTEREST_RATE) {
        setValidationError('Interest Rate should not be less than 8.3%');
      }
      

      setCalcResults(data);
    } catch (err) {
      setValidationError(
        err.response?.data?.message || 'Unable to calculate loan'
      );
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

    const timer = setTimeout(calculateLoan, 400);
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
    setCustomerIdSuffix('');
    setCustomerError('');
    setValidationError('');
    resetCalc();
  };

  /* ================= CREATE LOAN ================= */
  const createLoan = async () => {
    try {
      const res = await api.post('/twgoldloan/loans', {
        customerId: fullCustomerId,
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
    } catch (err) {
      alert(err.response?.data?.message || 'Loan creation failed');
    }
  };

  /* ================= INPUT HANDLER ================= */
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setLoanForm(prev => ({ ...prev, [id]: value }));
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
    !customerIdSuffix ||
    customerLoading ||
    !!customerError ||
    !calcResults.goldValue ||
    calcResults.ltv < MIN_LTV ||
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
        {rateDate && <small>Effective Date: {new Date(rateDate).toDateString()}</small>}
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

        {/* CUSTOMER ID */}
        <div className="twgold_gold_loan_form-group">
          <label>Customer ID</label>
          <div style={{ display: 'flex' }}>
            <input value={CUSTOMER_ID_PREFIX} disabled style={{ width: 140 }} />
            <input
              value={customerIdSuffix}
              maxLength={6}
              placeholder="Enter suffix"
              onChange={(e) =>
                setCustomerIdSuffix(e.target.value.replace(/\D/g, ''))
              }
            />
          </div>
          {customerLoading && <small>Fetching customer...</small>}
          {customerError && <small style={{ color: 'red' }}>⚠️ {customerError}</small>}
        </div>

        <div className="twgold_gold_loan_form-group">
          <label>Customer Name</label>
          <input id="custName" value={loanForm.custName} onChange={handleInputChange} />
        </div>

        <div className="twgold_gold_loan_form-group">
          <label>Aadhaar No</label>
          <input id="aadhaar" value={loanForm.aadhaar} />
        </div>

        <div className="twgold_gold_loan_form-group">
          <label>Mobile</label>
          <input id="mobile" value={loanForm.mobile} />
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
          <input id="goldWeight" type="number" value={loanForm.goldWeight} onChange={handleInputChange} />
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
        <div style={{ color: 'red', marginTop: 10 }}>
          ⚠️ {validationError}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
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
