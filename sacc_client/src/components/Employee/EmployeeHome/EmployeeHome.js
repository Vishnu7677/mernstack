import React, { useEffect, useState } from 'react';
import './EmployeeHome.css';
import EmployeeNavbar from '../EmployeeNavbar/employeeNav';
import apiList from '../../../lib/apiList';
import axios from "axios";
import Cookies from "js-cookie";


const EmployeeHome = () => {
    const [employeeDetails, setEmployeeDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = Cookies.get('employee_token');

    useEffect(() => {
        const fetchUsers = async () => {
          try {
            setLoading(true);
            const response = await axios.get(apiList.getEmployee, {
              headers: {
                'Authorization': `Bearer ${token}` 
              }
            });

            setEmployeeDetails(response.data.data.data || []);
          } catch (error) {
            console.error("Error fetching user list:", error);
          } finally {
            setLoading(false);
          }
        };
        fetchUsers();
      }, [token]);
    

    if (!employeeDetails) {
        return <div>{loading}</div>;
    }

    return (
        <div>
            <EmployeeNavbar />
        <div className="employeehome_page-wrapper">
            
            <div className="employeehome_container">
                <div className="employeehome_card">
                    <div className="employeehome_card-header">
                        <h2>Welcome, {employeeDetails.employee_name}</h2>
                    </div>
                    <div className="employeehome_card-body">
                        <div className="employeehome_details">
                        <div className="employeehome_detail-item">
                                <img src={employeeDetails.employee_photo} alt='' style={{width:"20%"}}/>
                            </div>
                            <div className="employeehome_detail-item">
                                <span className="employeehome_label">Employee ID:</span>
                                <span className="employeehome_value">{employeeDetails.employee_id}</span>
                            </div>
                            <div className="employeehome_detail-item">
                                <span className="employeehome_label">Position:</span>
                                <span className="employeehome_value">{employeeDetails.designation}</span>
                            </div>
                            <div className="employeehome_detail-item">
                                <span className="employeehome_label">Department:</span>
                                <span className="employeehome_value">{employeeDetails.department}</span>
                            </div>
                            <div className="employeehome_detail-item">
                                <span className="employeehome_label">Email:</span>
                                <span className="employeehome_value">{employeeDetails.employee_email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="employeehome_transaction-section">
                    <h3>Recent Transactions</h3>
                    <table className="employeehome_table">
                        <thead>
                            <tr>
                                <th>Txn ID</th>
                                <th>Amount</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        {/* <tbody>
                            {employeeDetails.transactions.map((txn, index) => (
                                <tr key={index}>
                                    <td>{txn.txnId}</td>
                                    <td>{txn.amount}₹</td>
                                    <td>{txn.date}</td>
                                </tr>
                            ))}
                        </tbody> */}
                    </table>
                </div>
            </div>
        </div>
        </div>
    );
};

export default EmployeeHome;
