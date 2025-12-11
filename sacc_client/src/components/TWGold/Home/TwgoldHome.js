import React, { useState } from 'react';
import './Twgoldhome.css';
import TwgoldNavbar from './TwgoldNavbar';

const purityMultipliers = {
  '22K': 0.916,
  '20K': 0.833,
  '18K': 0.75,
};

const TwgoldHome = () => {
  // estimator state
  const [goldWeight, setGoldWeight] = useState('');
  const [purity, setPurity] = useState('');
  const [goldPricePerGram, setGoldPricePerGram] = useState(6000); // editable default
  const [loanPercentage, setLoanPercentage] = useState(75); // percent (0-100)
  const [estimatedAmount, setEstimatedAmount] = useState(null);
  const [breakdown, setBreakdown] = useState(null);

  const calculateLoan = () => {
    if (!goldWeight || !purity) {
      alert('Please enter gold weight and select purity');
      return;
    }

    const weight = parseFloat(goldWeight);
    const multiplier = purityMultipliers[purity] || 0.916;

    const pureGoldValue = weight * multiplier * parseFloat(goldPricePerGram || 0);
    const loanAmount = (pureGoldValue * (parseFloat(loanPercentage) / 100));

    const result = {
      pureGoldValue: Math.round(pureGoldValue),
      loanAmount: Math.round(loanAmount),
      multiplier
    };

    setBreakdown(result);
    setEstimatedAmount(result.loanAmount.toLocaleString());
  };

  return (
    <div className="twgold_loan_home_app">
      <TwgoldNavbar />
      <div className="twgold_loan_home_container">
        {/* HERO SECTION */}
        <section className="twgold_loan_home_hero">
          <div className="twgold_loan_home_hero_content">
            <div className="twgold_loan_home_hero_tag">Trust Your Treasure</div>
            <h1 className="twgold_loan_home_hero_title">Instant Gold Loans with Transparent, Secure Service</h1>
            <p className="twgold_loan_home_hero_description">
              Get quick funding against your gold with minimal paperwork, fair valuation, and full security in our high-safety vaults.
            </p>
            <div className="twgold_loan_home_hero_actions">
              <a href="#gold-loans" className="twgold_loan_home_btn_primary">Apply for Gold Loan</a>
              <a href="#franchise" className="twgold_loan_home_btn_outline">Franchise Opportunities</a>
            </div>
            <div className="twgold_loan_home_hero_meta">
              <div className="twgold_loan_home_meta_item">
                <span>Telangana & AP</span>
                Serving customers across key locations
              </div>
              <div className="twgold_loan_home_meta_item">
                <span>Fast Disbursal</span>
                Loan approval in minutes*
              </div>
            </div>
          </div>

          {/* HERO CARD leftover removed — estimator moved lower */}
        </section>

        {/* KEY FEATURES */}
        <section className="twgold_loan_home_section" id="gold-loans">
          <h2 className="twgold_loan_home_section_title">Why Choose TW Gold Loans</h2>
          <p className="twgold_loan_home_section_description">
            TW Gold Loans offers customer-friendly gold loans, transparent pricing, and secure storage so customers can unlock funds without worry.
          </p>
          <div className="twgold_loan_home_features">
            <div className="twgold_loan_home_feature_card">
              <h3>Quick Processing</h3>
              <p>Minimal documentation and on-the-spot valuation help customers receive cash in minutes.</p>
            </div>
            <div className="twgold_loan_home_feature_card">
              <h3>Transparent Valuation</h3>
              <p>Purity testing and weighing are done in front of the customer with clear explanation of the loan amount.</p>
            </div>
            <div className="twgold_loan_home_feature_card">
              <h3>Secure Storage</h3>
              <p>All pledged gold is stored in high-security vaults and covered by insurance until redemption.</p>
            </div>
            <div className="twgold_loan_home_feature_card">
              <h3>Flexible Repayment</h3>
              <p>Customer-friendly schemes with different tenures and repayment options to suit cash-flow needs.</p>
            </div>
          </div>
        </section>

        {/* ESTIMATOR - moved down and expanded */}
        <section className="twgold_loan_home_section twgold_loan_home_estimator_section" id="eligibility-estimator">
          <h2 className="twgold_loan_home_section_title">Check Eligible Amount</h2>
          <p className="twgold_loan_home_section_description">
            Use the quick estimator below to get an approximate idea of the loan you may be eligible for. Final amount depends on branch valuation and RBI norms.
          </p>

          <div className="twgold_loan_home_estimator_panel">
            <div className="twgold_loan_home_estimator_inputs">
              <label htmlFor="goldWeight" className="twgold_loan_home_form_label">Gold weight (grams)</label>
              <input
                type="number"
                id="goldWeight"
                className="twgold_loan_home_form_input"
                placeholder="e.g. 50"
                value={goldWeight}
                onChange={(e) => setGoldWeight(e.target.value)}
              />

              <label htmlFor="purity" className="twgold_loan_home_form_label">Purity</label>
              <select
                id="purity"
                className="twgold_loan_home_form_select"
                value={purity}
                onChange={(e) => setPurity(e.target.value)}
              >
                <option value="">Select carat</option>
                <option value="22K">22K</option>
                <option value="20K">20K</option>
                <option value="18K">18K</option>
              </select>

              <label htmlFor="goldPrice" className="twgold_loan_home_form_label">Gold price (₹/gram)</label>
              <input
                type="number"
                id="goldPrice"
                className="twgold_loan_home_form_input"
                value={goldPricePerGram}
                onChange={(e) => setGoldPricePerGram(e.target.value)}
              />

              <label className="twgold_loan_home_form_label">Loan percentage ({loanPercentage}%)</label>
              <input
                type="range"
                min="50"
                max="90"
                step="1"
                value={loanPercentage}
                onChange={(e) => setLoanPercentage(e.target.value)}
              />

              <button
                type="button"
                className="twgold_loan_home_btn_primary twgold_loan_home_calculate_btn"
                onClick={calculateLoan}
              >
                Calculate Approximate Loan
              </button>
            </div>

            <div className="twgold_loan_home_estimator_result">
              {estimatedAmount ? (
                <>
                  <h4>Estimated Loan Amount</h4>
                  <p className="twgold_loan_home_amount">₹ {estimatedAmount}</p>
                  <div className="twgold_loan_home_breakdown">
                    <p><strong>Pure gold value:</strong> ₹ {breakdown?.pureGoldValue?.toLocaleString()}</p>
                    <p><strong>Applied loan %:</strong> {loanPercentage}%</p>
                    <p><strong>Purity multiplier:</strong> {breakdown?.multiplier}</p>
                  </div>
                  <p className="twgold_loan_home_form_note">
                    *This is an approximate value. Final disbursal is subject to in-branch purity test, weighing, documentation and RBI-compliant norms.
                  </p>
                  <a href="https://www.twgoldloans.com/?page_id=867" className="twgold_loan_home_btn_outline" target="_blank" rel="noopener noreferrer">
                    Contact a branch for precise valuation
                  </a>
                </>
              ) : (
                <p className="twgold_loan_home_estimator_hint">
                  Enter weight and purity then click <strong>Calculate</strong> to see an estimated loan amount.
                </p>
              )}
            </div>
          </div>

          <div className="twgold_loan_home_estimator_info">
            <h4>How purity affects value</h4>
            <p>
              Purity multipliers (22K = 0.916, 20K = 0.833, 18K = 0.75) show the fraction of pure gold in your jewellery. The estimator uses these multipliers to compute the pure gold value before applying the loan percentage.
            </p>
          </div>
        </section>

        {/* GOLD BUYING */}
        <section className="twgold_loan_home_section" id="gold-buying">
          <h2 className="twgold_loan_home_section_title">Gold Buying Services</h2>
          <p className="twgold_loan_home_section_description">
            Customers can also sell old or unused gold at competitive prices with instant payment and complete documentation.
          </p>
        </section>

        {/* FRANCHISE */}
        <section className="twgold_loan_home_section" id="franchise">
          <h2 className="twgold_loan_home_section_title">Franchise Opportunities</h2>
          <p className="twgold_loan_home_section_description">
            TW Gold Loans provides franchise partners with brand support, operations training, and marketing assistance to build a profitable gold loan and gold buying business.
          </p>
          <a href="/franchise-enquiry" className="twgold_loan_home_btn_primary">Enquire for Franchise</a>
        </section>

        {/* CONTACT STRIP */}
        <section className="twgold_loan_home_section" id="contact">
          <div className="twgold_loan_home_contact_strip">
            <div className="twgold_loan_home_contact_info">
              <span>Need help or want to visit a branch?</span><br />
              Call: <a href="tel:+918008195434">+91 80081 95434</a> or email:
              <a href="mailto:twgl.articles@sacb.co.in"> twgl.articles@sacb.co.in</a>
            </div>
            <div className="twgold_loan_home_contact_action">
              <a href="https://maps.google.com" className="twgold_loan_home_btn_outline" target="_blank" rel="noopener noreferrer">
                Locate Nearest Branch
              </a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="twgold_loan_home_footer">
          <div className="twgold_loan_home_footer_inner">
            <div className="twgold_loan_home_footer_copyright">
              © TW Gold Loans. All rights reserved.
            </div>
            <div className="twgold_loan_home_footer_address">
              Regd. Office: H No. 1-98/90/24/1/1, 4th Floor (Part), KSR Towers, Hyderabad.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TwgoldHome;
