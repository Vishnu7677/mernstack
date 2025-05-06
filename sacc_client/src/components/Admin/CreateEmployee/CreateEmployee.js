import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CreateEmployee.css';
import apiList from '../../../lib/apiList';
import Cookies from "js-cookie";
import AdminSidebar from '../AdminSidebar/AdminSidebar';

const CreateEmployee = () => {
    const [formData, setFormData] = useState({
        employee_name: '',
        employee_phone: '',
        employee_photo: '',
        designation: '',
        employee_email: '',
        employee_password: '',
    });
    const token = Cookies.get('admin_token');

    const [employeeId, setEmployeeId] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.setAttribute('autocomplete', 'off');
        });
    }, []);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];
        
        // Check if the file exists
        if (!file) return;
    
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            setError('Only JPG and PNG images are allowed.');
            return;
        }
    
        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            setError('File size must be under 5MB.');
            return;
        }
    
        // If validation passes, update formData
        setFormData((prev) => ({
            ...prev,
            [name]: file,
        }));
    
        setError(''); // Clear any previous error
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
    
        try {
            // Create a new FormData instance
            const submissionData = new FormData();
    
            // Append form fields to FormData
            Object.keys(formData).forEach((key) => {
                if (key === 'employee_photo' && formData[key]) {
                    submissionData.append(key, formData[key]); // Append the photo file
                } else if (formData[key]) {
                    submissionData.append(key, formData[key]); // Append other fields
                }
            });
    
            // Debugging log for FormData entries
            console.log('FormData entries:', Array.from(submissionData.entries()));
    
            // Send the request
            const result = await axios.post(apiList.AdminEmployeeCreation, submissionData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data', // Ensure multipart/form-data
                },
            });
    
            // Set success state
            setEmployeeId(result.data.result.employee_id);
        } catch (err) {
            console.error('Error during submission:', err);
            setError(err.response?.data?.message || err.message);
        } finally {
            setIsLoading(false);
        }
    };
    


    return (
        <div className={`admin-layout container-fluid`}>
            <div>
                <AdminSidebar />
            </div>
            <div className='admin-content mt-0'>
                <div className="employee_form_container">
                    <h2 className="employee_form_title">Create New Employee</h2>

                    {error && <p className="employee_error">{error}</p>}

                    <form className="employee_form" onSubmit={handleSubmit} autoComplete="off">
                        <div className="input_row">
                            <div className="input_column">
                                <label htmlFor="employee_name">Employee Name</label>
                                <input
                                    type="text"
                                    name="employee_name"
                                    value={formData.employee_name}
                                    onChange={handleChange}
                                    placeholder="Employee Name"
                                    className="employee_input"
                                    required
                                    autoComplete='off'
                                />
                            </div>
                            <div className="input_column">
                                <label htmlFor="employee_phone">Phone Number</label>
                                <input
                                    type="text"
                                    name="employee_phone"
                                    value={formData.employee_phone}
                                    onChange={handleChange}
                                    placeholder="Phone Number"
                                    className="employee_input"
                                    required
                                    autoComplete='off'
                                />
                            </div>
                        </div>
                        <div className="input_row">
                            <div className="input_column">
                                <label htmlFor="designation">Designation</label>
                                <input
                                    type="text"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    placeholder="Designation"
                                    className="employee_input"
                                    required
                                />
                            </div>
                            <div className="input_column">
                                <label htmlFor="employee_email">Email</label>
                                <input
                                    type="email"
                                    name="employee_email"
                                    value={formData.employee_email}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    className="employee_input"
                                    required
                                />
                            </div>
                        </div>
                        <div className="input_row">
                            <div className="input_column">
                                <label htmlFor="employee_password">Password</label>
                                <input
                                    type="password"
                                    name="employee_password"
                                    value={formData.employee_password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    className="employee_input"
                                    required
                                />
                            </div>
                        </div>

                        <div className="input_row">
                            <div className="input_column">
                                <label htmlFor="employee_photo">Upload Photo</label>
                                <input
                                    type="file"
                                    name="employee_photo"
                                    onChange={handleFileChange}
                                    className="employee_input"
                                    
                                />
                            </div>
                        </div>

                        <button type="submit" className="employee_submit_button" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Employee'}
                        </button>
                    </form>

                    {employeeId && (
                        <div className="employee_id_display">
                            <p>Employee Created! Employee ID: <strong>{employeeId}</strong></p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateEmployee;
