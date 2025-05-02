import React from 'react';
import '../AllLoans/EmployeeBankLoanTable.css';

function PaidLoans() {
    return (
        <div className="employeebank_page-body">
            <div className="employeebank_container-xl">
                <div className="employeebank_row employeebank_row-cards">
                    <div className="employeebank_col-12">
                        <h2>Paid Loans</h2>
                        <div className="employeebank_card">
                            <div className="employeebank_table-responsive">
                                <table className="employeebank_table employeebank_table-vcenter employeebank_table-mobile-lg employeebank_card-table">
                                    <thead>
                                        <tr>
                                            <th>Plan No</th>
                                            <th>Loan Amount</th>
                                            <th>Per Installment</th>
                                            <th>Total Installement</th>
                                            <th>Next Installment</th>
                                            <th>Status</th>
                                            <th className="employeebank_w-1"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td data-label="Plan No">
                                                <div>
                                                    7Adf1701984797
                                                    <br />
                                                    <span className="employeebank_text-info">Student</span>
                                                </div>
                                            </td>
                                            <td data-label="Loan Amount">
                                                <div>9900000₹</div>
                                            </td>
                                            <td data-label="Per Installment">
                                                <div>297000₹</div>
                                            </td>
                                            <td data-label="Total Installement">
                                                <div>
                                                    35
                                                    <br />
                                                    <span className="employeebank_text-info">0 Given</span>
                                                </div>
                                            </td>
                                            <td data-label="Next Installment">
                                                <div>--</div>
                                            </td>
                                            <td data-label="Status">
                                                <div>
                                                    <span className="employeebank_badge employeebank_bg-warning">Pending</span>
                                                </div>
                                            </td>
                                            <td data-label="View Log">
                                                <div className="employeebank_btn-list employeebank_flex-nowrap">
                                                    <a
                                                        href="https://product.geniusocean.com/genius-bank/user/loan-logs/152"
                                                        className="employeebank_btn"
                                                    >
                                                        Logs
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <nav>
                                <ul className="employeebank_pagination">
                                    <li className="employeebank_page-item employeebank_disabled" aria-disabled="true" aria-label="&laquo; Previous">
                                        <span className="employeebank_page-link" aria-hidden="true">&lsaquo;</span>
                                    </li>
                                    <li className="employeebank_page-item employeebank_active" aria-current="page">
                                        <span className="employeebank_page-link">1</span>
                                    </li>
                                    <li className="employeebank_page-item">
                                        <a
                                            className="employeebank_page-link"
                                            href="https://product.geniusocean.com/genius-bank/user/loans?page=2"
                                        >
                                            2
                                        </a>
                                    </li>
                                    <li className="employeebank_page-item">
                                        <a
                                            className="employeebank_page-link"
                                            href="https://product.geniusocean.com/genius-bank/user/loans?page=2"
                                            rel="next"
                                            aria-label="Next &raquo;"
                                        >
                                            &rsaquo;
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaidLoans;
