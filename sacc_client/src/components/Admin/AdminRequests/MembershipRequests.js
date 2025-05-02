import React, { useState, useEffect } from "react";
import AdminSidebar from "../AdminSidebar/AdminSidebar";
import { Link } from "react-router-dom";
import axios from "axios";
import apiList from "../../../lib/apiList";
import Popup from "../Popup/Popup";  
import './membership.css';  
import Cookies from "js-cookie";

function MembershipRequest() {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = Cookies.get('admin_token');
        setLoading(true);
        const response = await axios.get(apiList.getUsers, {
          headers: {
            'Authorization': `Bearer ${token}` 
          }
        });
        setUserList(response.data.data || []);
      } catch (error) {
        console.error("Error fetching user list:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleActionChange = (userId, action) => {
    setSelectedAction(action);
    setSelectedUserId(userId);
  };

  const handleConfirmAction = async () => {
    if (selectedAction && selectedUserId) {
      try {
        const token = Cookies.get('admin_token');
        const response = await axios.post(
          apiList.AdminMembershipUpdate, 
          {
            _id: selectedUserId,
            action: selectedAction,
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (response.data.message === 'User details updated successfully') {
          alert(`User has been ${selectedAction}ed successfully.`);
          setUserList(prev => prev.map(user => 
            user._id === selectedUserId 
              ? { 
                  ...user, 
                  membership: {
                    ...user.membership,
                    membership_status: selectedAction === 'accept' ? 'accepted' : 'rejected',
                    isVerified: selectedAction === 'accept'
                  }
                } 
              : user
          ));
        } else {
          alert("Update failed: " + (response.data.message || "Unknown error"));
        }
      } catch (error) {
        console.error("Error updating user:", error);
        alert("Failed to update user status: " + (error.response?.data?.message || error.message));
      } finally {
        setSelectedAction(null);
        setSelectedUserId(null);
      }
    }
  };

  const handleClosePopup = () => {
    setSelectedAction(null);
    setSelectedUserId(null);
  };

  return (
    <div className="membership-request-container">
      <AdminSidebar />
      
      <div className="membership-request-content">
        <div className="membership-request-header">
          <div className="header-content">
            <h2>Membership Requests</h2>
            <nav className="breadcrumb">
              <Link to="/admin/dashboard">Dashboard</Link>
              <span className="divider">/</span>
              <span>Membership Requests</span>
            </nav>
          </div>
        </div>

        <div className="membership-request-card">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading requests...</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="membership-request-table">
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
                          <span className={`status-badge ${user.isVerified ? 'verified' : 'pending'}`}>
                            {user.isVerified ? "Verified" : "Pending"}
                          </span>
                        </td>
                        <td>
                          <select
                            className="action-select"
                            onChange={(e) => handleActionChange(user._id, e.target.value)}
                            value=""
                          >
                            <option value="" disabled>Select action</option>
                            <option value="accept">Accept</option>
                            <option value="reject">Reject</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="no-data">
                      <td colSpan="6">
                        <div className="empty-state">
                          <i className="fas fa-users empty-icon"></i>
                          <p>No membership requests found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Popup
        show={selectedAction !== null}
        onClose={handleClosePopup}
        onConfirm={handleConfirmAction}
        action={selectedAction}
      />
    </div>
  );
}

export default MembershipRequest;