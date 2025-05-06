import React, { useState, useEffect } from "react";
import AdminSidebar from "../AdminSidebar/AdminSidebar";
import { Link } from "react-router-dom";
import axios from "axios";
import apiList from "../../../lib/apiList";
import '../AdminSidebar/AdminSidebar.css';  
import Cookies from "js-cookie";
import "./AdminUserlist.css";

function AdminUserList() {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get('admin_token');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(apiList.Adminuserslist, {
          headers: {
            'Authorization': `Bearer ${token}` 
          }
        });
        console.log(response.data.data[0].membership)
        setUserList(response.data.data || []);
      } catch (error) {
        console.error("Error fetching user list:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  return (
    <div className="adminuserlist_container">
      <AdminSidebar />
      
      <div className="adminuserlist_content">
        <div className="adminuserlist_header">
          <div className="adminuserlist_header-content">
            <h1 className="adminuserlist_title">Membership Requests</h1>
            <nav className="adminuserlist_breadcrumb">
              <Link to="/admin/dashboard">Dashboard</Link>
              <span>/</span>
              <Link to="/admin/membershiprequest">Membership Requests</Link>
            </nav>
          </div>
        </div>

        <div className="adminuserlist_card">
          {loading ? (
            <div className="adminuserlist_loading">Loading...</div>
          ) : (
            <div className="adminuserlist_table-container">
              <table className="adminuserlist_table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>PAN Number</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userList.length > 0 ? (
                    userList.map((user, index) => (
                      <tr key={index}>
                        <td>{user.name || "N/A"}</td>
                        <td>{user.email_id || "N/A"}</td>
                        <td>{user.pan_number || "N/A"}</td>
                        <td>{user.phone_number || "N/A"}</td>
                        <td>
                          <span className={`adminuserlist_status ${user.membership?.isVerified ? 'verified' : 'pending'}`}>
                            {user.membership?.isVerified ? "Verified" : "Pending"}
                          </span>
                        </td>
                        <td>
                          <button className="adminuserlist_button adminuserlist_button-view">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="adminuserlist_empty">
                        No membership requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default  AdminUserList ;