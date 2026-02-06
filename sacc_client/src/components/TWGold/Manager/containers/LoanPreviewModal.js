import './LoanPreviewModal.css'
import { generateLoanPreviewPDF } from '../utils/loanPdfGenerator';
import { generateLoanSanctionPDF } from '../utils/loanSanctionPdfGenerator';

const LoanPreviewModal = ({ loan, onApprove, onReject, onClose, processing }) => {

    const handleApprove = () => {
        onApprove();
        generateLoanSanctionPDF(loan, loan.createdBy);
    };

    return (
        <div className="twgold_modal_backdrop">
            <div className="twgold_modal">

                <div className="twgold_modal_header">
                    <h3>Loan Preview</h3>
                    <button onClick={onClose}>✖</button>
                </div>

                <div className="twgold_modal_body">

                    {/* CUSTOMER */}
                    <section>
                        <h4>Customer Details</h4>
                        <p><b>Name:</b> {loan.customer.name}</p>
                        <p><b>Customer ID:</b> {loan.customer.customerId}</p>
                        <p><b>Phone:</b> {loan.customer.phone}</p>
                    </section>

                    {/* GOLD */}
                    <section>
                        <h4>Gold Details</h4>
                        {loan.goldItems.map(item => (
                            <div key={item._id} className="twgold_item_row">
                                <span>{item.description}</span>
                                <span>{item.carat} • {item.weight}g</span>
                                <span>₹ {item.estimatedValue}</span>
                            </div>
                        ))}
                        <p><b>Total Weight:</b> {loan.totalGoldWeight} g</p>
                        <p><b>Total Value:</b> ₹ {loan.totalGoldValue}</p>
                    </section>

                    {/* LOAN */}
                    <section>
                        <h4>Loan Summary</h4>
                        <p><b>Requested:</b> ₹ {loan.requestedAmount}</p>
                        <p><b>Sanctioned:</b> ₹ {loan.sanctionedAmount}</p>
                        <p><b>LTV:</b> {loan.loanToValueRatio.toFixed(2)}%</p>
                        <p><b>Interest:</b> {loan.interestRate.toFixed(2)}%</p>
                        <p><b>EMI:</b> ₹ {loan.emiAmount}</p>
                        <p><b>Tenure:</b> {loan.tenure} months</p>
                        <p><b>Risk:</b> {loan.riskCategory}</p>
                    </section>

                    {/* RATE */}
                    <section>
                        <h4>Gold Rate Used</h4>
                        <p>{loan.goldRateUsed.carat} : ₹ {loan.goldRateUsed.rate} / g</p>
                    </section>

                </div>

                <div className="twgold_modal_footer">
                    <button
                        className="print"
                        onClick={() => generateLoanPreviewPDF(loan)}
                    >
                        Print PDF
                    </button>

                    <button
                        className="reject"
                        disabled={processing}
                        onClick={onReject}
                    >
                        Reject
                    </button>

                    <button
                        className="approve"
                        disabled={processing}
                        onClick={handleApprove}
                    >
                        Approve & Print
                    </button>

                </div>


            </div>
        </div>
    );
};

export default LoanPreviewModal;
