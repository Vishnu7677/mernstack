import React, { useState } from "react";
import EmployeeNavbar from "../Employee/EmployeeNavbar/employeeNav";
import apiList from "../../lib/apiList";
import axios from "axios";
import Cookies from "js-cookie";
import { FaCheckCircle, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import showToast from "../Toast";
import { ToastContainer } from "react-toastify";
import "./AccountOpeningForm.css";

const AccountOpeningForm = () => {
  const [step, setStep] = useState(1);
  const [membershipId, setMembershipId] = useState("");
  const [memberDetails, setMemberDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formDetails, setFormDetails] = useState({
    accountType: "",
    accountOwnership: "Individual",
    depositAmount: "",
    paymentMode: "Cash",
    accountStatus: "Active",
    isVerified: true
  });
  const [accountDetails, setAccountDetails] = useState({
    accountNumber: "",
    customerId: "",
    accountType: "",
    depositAmount: ""
  });

  const validateMembershipId = (id) => /^LNSASS110\d{6}$/.test(id);

  const fetchMemberDetails = async () => {
    const fullMembershipId = `LNSASS110${membershipId}`;
    if (!validateMembershipId(fullMembershipId)) {
      showToast("error", "Invalid Membership ID. Please enter 6 digits.");
      return;
    }
    setLoading(true);
    try {
      const token = Cookies.get("employee_token");
      const response = await axios.get(
        `${apiList.getUserDeatilsbymembershipid.replace(":membershipId", fullMembershipId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200 && response.data.success) {
        setMemberDetails(response.data.data);
        showToast("success", "Member details fetched successfully!");
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      showToast("error", "Error fetching member details. Please try again.");
      setMemberDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get("employee_token");
      const fullMembershipId = `LNSASS110${membershipId}`;
      
      // Prepare all account data to send to backend
      const accountData = {
        membershipId: fullMembershipId,
        accountType: formDetails.accountType,
        accountOwnership: formDetails.accountOwnership,
        depositAmount: parseFloat(formDetails.depositAmount),
        paymentMode: formDetails.paymentMode,
        accountStatus: formDetails.accountStatus,
        isVerified: formDetails.isVerified
      };
      

      const response = await axios.post(
        apiList.createAccount, 
        accountData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.data) {
        setAccountDetails({
          accountNumber: response.data.data.accountNumber,
          customerId: response.data.data.customerId,
          accountType: response.data.data.accountType,
          depositAmount: response.data.data.depositAmount
        });
        showToast("success", "Account created successfully!");
        setStep(4);
      } else {
        throw new Error("Account details not received");
      }
    } catch (error) {
      console.error("Account creation error:", error);
      showToast("error", error.response?.data?.message || "Error submitting form.");
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const accountTypeLabels = {
    savings: "Savings Account",
    current: "Current Account",
    fixed: "Fixed Deposit"
  };

  const ownershipLabels = {
    Individual: "Individual",
    Joint: "Joint",
    Minor: "Minor"
  };

  const paymentModeLabels = {
    Cash: "Cash",
    Cheque: "Cheque",
    "NEFT/RTGS": "NEFT/RTGS",
    UPI: "UPI"
  };
  return (
    <div className="accountopening_container">
      <ToastContainer/>
      <EmployeeNavbar />
      <div className="accountopening_form-container">
        <h1 className="accountopening_title">Account Opening Form</h1>

        <div className="accountopening_progress-container">
          {[1, 2, 3].map((num) => (
            <React.Fragment key={num}>
              <div
                className={`accountopening_progress-step ${step > num ? "accountopening_step-completed" : step === num ? "accountopening_step-active" : ""}`}
              >
                {step > num ? <FaCheckCircle className="accountopening_check-icon" /> : num}
              </div>
              {num < 3 && (
                <div className={`accountopening_progress-line ${step > num ? "accountopening_line-completed" : ""}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <div className="accountopening_step-content">
            <label className="accountopening_label">Enter Membership ID</label>
            <div className="accountopening_input-group">
              <span className="accountopening_input-prefix">LNSASS110</span>
              <input
                type="text"
                className="accountopening_input"
                placeholder="Enter last 6 digits"
                value={membershipId}
                onChange={(e) => setMembershipId(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
              />
            </div>
            {loading && <p className="accountopening_loading">Loading member details...</p>}
            {memberDetails && (
              <div className="accountopening_member-details">
                <h3 className="accountopening_member-title">Member Details</h3>
                <div className="accountopening_member-grid">
                  <div>
                    <span className="accountopening_detail-label">Name:</span>
                    <span className="accountopening_detail-value">{memberDetails.name}</span>
                  </div>
                  <div>
                    <span className="accountopening_detail-label">Membership Type:</span>
                    <span className="accountopening_detail-value">{memberDetails.membership?.membership_type}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="accountopening_button-group">
              <button 
                onClick={fetchMemberDetails} 
                className="accountopening_button accountopening_button-primary"
                disabled={loading}
              >
                {loading ? 'Fetching...' : 'Fetch Details'}
              </button>
              {memberDetails && (
                <button 
                  onClick={() => setStep(2)} 
                  className="accountopening_button accountopening_button-next"
                >
                  Next <FaArrowRight className="accountopening_button-icon" />
                </button>
              )}
            </div>
          </div>
        )}

{step === 2 && (
          <div className="accountopening_step-content">
            <div className="accountopening_form-group">
              <label className="accountopening_label">Account Type*</label>
              <select 
                className="accountopening_select" 
                name="accountType" 
                onChange={handleInputChange}
                value={formDetails.accountType}
                required
              >
                <option value="">Select account type</option>
                <option value="savings">Savings Account</option>
                <option value="current">Current Account</option>
                <option value="fixed">Fixed Deposit</option>
              </select>
            </div>

            <div className="accountopening_form-group">
              <label className="accountopening_label">Account Ownership*</label>
              <select 
                className="accountopening_select" 
                name="accountOwnership" 
                onChange={handleInputChange}
                value={formDetails.accountOwnership}
                required
              >
                <option value="Individual">Individual</option>
                <option value="Joint">Joint</option>
                <option value="Minor">Minor</option>
              </select>
            </div>
            
            <div className="accountopening_form-group">
              <label className="accountopening_label">Initial Deposit Amount (₹)*</label>
              <input 
                type="number" 
                className="accountopening_input" 
                name="depositAmount" 
                onChange={handleInputChange}
                value={formDetails.depositAmount}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="accountopening_form-group">
              <label className="accountopening_label">Payment Mode*</label>
              <select 
                className="accountopening_select" 
                name="paymentMode" 
                onChange={handleInputChange}
                value={formDetails.paymentMode}
                required
              >
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="NEFT/RTGS">NEFT/RTGS</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
            
            <div className="accountopening_button-group">
              <button 
                onClick={handlePrevious} 
                className="accountopening_button accountopening_button-secondary"
              >
                <FaArrowLeft className="accountopening_button-icon" /> Back
              </button>
              <button 
                onClick={() => setStep(3)} 
                className="accountopening_button accountopening_button-next"
                disabled={!formDetails.accountType || !formDetails.depositAmount}
              >
                Next <FaArrowRight className="accountopening_button-icon" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="accountopening_step-content">
            <h3 className="accountopening_review-title">Review Account Details</h3>
            
            <div className="accountopening_review-details">
              <div className="accountopening_review-row">
                <span className="accountopening_review-label">Membership ID:</span>
                <span className="accountopening_review-value">LNSASS110{membershipId}</span>
              </div>
              <div className="accountopening_review-row">
                <span className="accountopening_review-label">Member Name:</span>
                <span className="accountopening_review-value">{memberDetails.name}</span>
              </div>
              <div className="accountopening_review-row">
                <span className="accountopening_review-label">Account Type:</span>
                <span className="accountopening_review-value">
                  {accountTypeLabels[formDetails.accountType]}
                </span>
              </div>
              <div className="accountopening_review-row">
                <span className="accountopening_review-label">Account Ownership:</span>
                <span className="accountopening_review-value">
                  {ownershipLabels[formDetails.accountOwnership]}
                </span>
              </div>
              <div className="accountopening_review-row">
                <span className="accountopening_review-label">Initial Deposit:</span>
                <span className="accountopening_review-value">
                  ₹{parseFloat(formDetails.depositAmount).toFixed(2)}
                </span>
              </div>
              <div className="accountopening_review-row">
                <span className="accountopening_review-label">Payment Mode:</span>
                <span className="accountopening_review-value">
                  {paymentModeLabels[formDetails.paymentMode]}
                </span>
              </div>
            </div>
            
            <div className="accountopening_button-group">
              <button 
                onClick={handlePrevious} 
                className="accountopening_button accountopening_button-secondary"
              >
                <FaArrowLeft className="accountopening_button-icon" /> Back
              </button>
              <button 
                onClick={handleSubmit} 
                className="accountopening_button accountopening_button-submit"
              >
                Confirm & Create Account
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="accountopening_success-container">
            <div className="accountopening_success-icon">
              <FaCheckCircle />
            </div>
            <h3 className="accountopening_success-title">Account Created Successfully!</h3>
            <p className="accountopening_success-message">
              The account has been successfully created for {memberDetails.name}.
            </p>
            <div className="accountopening_success-details">
              <p>Account Number: <strong>{accountDetails.accountNumber}</strong></p>
              <p>Customer ID: <strong>{accountDetails.customerId}</strong></p>
              <p>Account Type: <strong>
                {accountTypeLabels[accountDetails.accountType]}
              </strong></p>
              <p>Initial Balance: <strong>₹{parseFloat(accountDetails.depositAmount).toFixed(2)}</strong></p>
            </div>
            <button 
              onClick={() => {
                setStep(1);
                setMembershipId("");
                setMemberDetails(null);
                setFormDetails({
                  accountType: "",
                  accountOwnership: "Individual",
                  depositAmount: "",
                  paymentMode: "Cash"
                });
                setAccountDetails({
                  accountNumber: "",
                  customerId: "",
                  accountType: "",
                  depositAmount: ""
                });
              }}
              className="accountopening_button accountopening_button-primary"
            >
              Create Another Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountOpeningForm;