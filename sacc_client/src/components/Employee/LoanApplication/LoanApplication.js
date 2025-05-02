import React, { useState } from "react";
import './LoanApplication.css';
import EmployeeNavbar from "../EmployeeNavbar/employeeNav";

const LoanApplication = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        loanAmount: "",
        loanTerm: "",
        income: "",
    });

    const nextStep = () => setStep(prevStep => prevStep + 1);
    const prevStep = () => setStep(prevStep => prevStep - 1);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Submitted", formData);
    };

    return (
        <div>
                <EmployeeNavbar />
        <div className="bank_container">
            <h1 className="bank_header">Loan Application Form</h1>

            <div className="bank_progress-bar">
                <div className={`bank_step ${step >= 1 ? "bank_step-completed" : ""}`}>Step 1</div>
                <div className={`bank_step ${step >= 2 ? "bank_step-completed" : ""}`}>Step 2</div>
                <div className={`bank_step ${step >= 3 ? "bank_step-completed" : ""}`}>Step 3</div>
            </div>

            {step === 1 && (
                <PersonalInfo formData={formData} handleChange={handleChange} nextStep={nextStep} />
            )}
            {step === 2 && (
                <LoanDetails formData={formData} handleChange={handleChange} nextStep={nextStep} prevStep={prevStep} />
            )}
            {step === 3 && (
                <ReviewSubmit formData={formData} handleSubmit={handleSubmit} prevStep={prevStep} />
            )}
        </div>
        </div>
    );
};

const PersonalInfo = ({ formData, handleChange, nextStep }) => (
    <div className="bank_form-step">
        <h2 className="bank_subheader">Step 1: Personal Information</h2>
        <form className="bank_form">
            <div className="bank_field">
                <label className="bank_label">Name:</label>
                <input className="bank_input" type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="bank_field">
                <label className="bank_label">Email:</label>
                <input className="bank_input" type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="bank_field">
                <label className="bank_label">Phone:</label>
                <input className="bank_input" type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="bank_field">
                <label className="bank_label">Address:</label>
                <input className="bank_input" type="text" name="address" value={formData.address} onChange={handleChange} required />
            </div>
            <button type="button" className="bank_button bank_button-next" onClick={nextStep}>Next</button>
        </form>
    </div>
);

const LoanDetails = ({ formData, handleChange, nextStep, prevStep }) => (
    <div className="bank_form-step">
        <h2 className="bank_subheader">Step 2: Loan Details</h2>
        <form className="bank_form">
            <div className="bank_field">
                <label className="bank_label">Loan Amount:</label>
                <input className="bank_input" type="number" name="loanAmount" value={formData.loanAmount} onChange={handleChange} required />
            </div>
            <div className="bank_field">
                <label className="bank_label">Loan Term (years):</label>
                <input className="bank_input" type="number" name="loanTerm" value={formData.loanTerm} onChange={handleChange} required />
            </div>
            <div className="bank_field">
                <label className="bank_label">Annual Income:</label>
                <input className="bank_input" type="number" name="income" value={formData.income} onChange={handleChange} required />
            </div>
            <button type="button" className="bank_button bank_button-prev" onClick={prevStep}>Previous</button>
            <button type="button" className="bank_button bank_button-next" onClick={nextStep}>Next</button>
        </form>
    </div>
);

const ReviewSubmit = ({ formData, handleSubmit, prevStep }) => (
    <div className="bank_form-step">
        <h2 className="bank_subheader">Step 3: Review & Submit</h2>
        <div className="bank_summary">
            <h3>Personal Information</h3>
            <p>Name: {formData.name}</p>
            <p>Email: {formData.email}</p>
            <p>Phone: {formData.phone}</p>
            <p>Address: {formData.address}</p>
        </div>
        <div className="bank_summary">
            <h3>Loan Details</h3>
            <p>Loan Amount: {formData.loanAmount}</p>
            <p>Loan Term: {formData.loanTerm} years</p>
            <p>Annual Income: {formData.income}</p>
        </div>
        <button type="button" className="bank_button bank_button-prev" onClick={prevStep}>Previous</button>
        <button type="button" className="bank_button bank_button-submit" onClick={handleSubmit}>Submit</button>
    </div>
);

export default LoanApplication;
