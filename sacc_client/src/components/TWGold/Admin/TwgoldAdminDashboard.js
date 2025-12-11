import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Gem, 
  FileText, 
  TrendingUp, 
  DollarSign,
  Activity,
  Shield
} from 'lucide-react';
import { useTwgoldAuth } from '../TWGLogin/TwgoldAuthContext';
import './adminstyles.css';
import Navbar from './Navbar';

const TwgoldAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBranches: 0,
    totalEmployees: 0,
    activeLoans: 0,
    totalGoldWeight: 0,
    pendingApprovals: 0,
    totalLoanValue: '₹12.5Cr'
  });

  const { user } = useTwgoldAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulated API call - replace with actual API
      setTimeout(() => {
        setStats({
          totalBranches: 24,
          totalEmployees: 156,
          activeLoans: 1245,
          totalGoldWeight: 24500,
          pendingApprovals: 23,
          totalLoanValue: '₹12.5Cr'
        });
      }, 1000);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const dashboardStats = [
    {
      title: 'Total Branches',
      value: stats.totalBranches.toString(),
      icon: Building2,
      color: 'blue',
      change: '+2 this month'
    },
    {
      title: 'Total Employees',
      value: stats.totalEmployees.toString(),
      icon: Users,
      color: 'green',
      change: '+12 this month'
    },
    {
      title: 'Active Loans',
      value: stats.activeLoans.toLocaleString(),
      icon: FileText,
      color: 'purple',
      change: '+45 this week'
    },
    {
      title: 'Gold Rate (24k)',
      value: '₹6,245',
      icon: Gem,
      color: 'yellow',
      change: '+₹120 today'
    },
    {
      title: 'Total Loan Value',
      value: stats.totalLoanValue,
      icon: DollarSign,
      color: 'emerald',
      change: '+₹1.2Cr this month'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals.toString(),
      icon: Activity,
      color: 'orange',
      change: '-5 this week'
    }
  ];

  const recentActivities = [
    { id: 1, action: 'Gold rate updated', user: 'Admin', time: '2 minutes ago' },
    { id: 2, action: 'New branch created', user: 'Admin', time: '1 hour ago' },
    { id: 3, action: 'Loan approved', user: 'Branch Manager', time: '2 hours ago' },
    { id: 4, action: 'Employee added', user: 'Admin', time: '3 hours ago' },
    { id: 5, action: 'Settings updated', user: 'Admin', time: '5 hours ago' }
  ];

  return (
    <div>
      <Navbar /> 
    <div className="admin_gold_dashboard">
      {/* Enhanced Dashboard Header */}
      <div className="admin_gold_dashboard_header">
        <div className="admin_gold_dashboard_title_section">
          <h1>Dashboard Overview</h1>
          <p>Welcome back, {user?.name || 'Admin'}! Here's what's happening with your business today.</p>
        </div>
        <div className="admin_gold_dashboard_user_info">
          <span className="admin_gold_welcome_text">
            Administrator Privileges Active
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="admin_gold_stats_grid">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`admin_gold_stat_card admin_gold_stat_${stat.color}`}>
              <div className="admin_gold_stat_icon">
                <Icon size={24} />
              </div>
              <div className="admin_gold_stat_content">
                <h3>{stat.value}</h3>
                <p>{stat.title}</p>
                <span>{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Dashboard Grid */}
      <div className="admin_gold_dashboard_grid">
        <div className="admin_gold_dashboard_card">
          <div className="admin_gold_card_icon">👥</div>
          <h3 className="admin_gold_card_title">User Management</h3>
          <p className="admin_gold_card_description">Manage users and permissions</p>
        </div>
        
        <div className="admin_gold_dashboard_card">
          <div className="admin_gold_card_icon">⚙️</div>
          <h3 className="admin_gold_card_title">System Settings</h3>
          <p className="admin_gold_card_description">Configure system parameters</p>
        </div>
        
        <div className="admin_gold_dashboard_card">
          <div className="admin_gold_card_icon">📋</div>
          <h3 className="admin_gold_card_title">Audit Logs</h3>
          <p className="admin_gold_card_description">View system activities</p>
        </div>
        
        <div className="admin_gold_dashboard_card">
          <div className="admin_gold_card_icon">📊</div>
          <h3 className="admin_gold_card_title">Reports</h3>
          <p className="admin_gold_card_description">Generate and view reports</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin_gold_dashboard_content">
        <div className="admin_gold_recent_activity">
          <h2>Recent Activity</h2>
          <div className="admin_gold_activity_list">
            {recentActivities.map(activity => (
              <div key={activity.id} className="admin_gold_activity_item">
                <div className="admin_gold_activity_dot"></div>
                <div className="admin_gold_activity_content">
                  <p>{activity.action}</p>
                  <span>By {activity.user} • {activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin_gold_quick_actions">
          <h2>Quick Actions</h2>
          <div className="admin_gold_actions_grid">
            <button className="admin_gold_action_btn">
              <Gem size={20} />
              Update Gold Rate
            </button>
            <button className="admin_gold_action_btn">
              <Building2 size={20} />
              Add Branch
            </button>
            <button className="admin_gold_action_btn">
              <Users size={20} />
              Manage Employees
            </button>
            <button className="admin_gold_action_btn">
              <Shield size={20} />
              Compliance Reports
            </button>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="admin_gold_dashboard_charts">
        <div className="admin_gold_chart_section">
          <h3 className="admin_gold_chart_title">Branch Performance</h3>
          <div className="admin_gold_chart_placeholder">
            <div className="admin_gold_chart_placeholder_content">
              <TrendingUp size={48} />
              <p>Performance analytics will be displayed here</p>
            </div>
          </div>
        </div>

        <div className="admin_gold_chart_section">
          <h3 className="admin_gold_chart_title">System Activities</h3>
          <div className="admin_gold_activities_list">
            <div className="admin_gold_activity_item">
              <span className="admin_gold_activity_icon">➕</span>
              <div className="admin_gold_activity_content">
                <p className="admin_gold_activity_text">New branch created - Mumbai Central</p>
                <span className="admin_gold_activity_time">2 hours ago</span>
              </div>
            </div>
            <div className="admin_gold_activity_item">
              <span className="admin_gold_activity_icon">📈</span>
              <div className="admin_gold_activity_content">
                <p className="admin_gold_activity_text">Gold rate updated to ₹6,245/g</p>
                <span className="admin_gold_activity_time">4 hours ago</span>
              </div>
            </div>
            <div className="admin_gold_activity_item">
              <span className="admin_gold_activity_icon">👤</span>
              <div className="admin_gold_activity_content">
                <p className="admin_gold_activity_text">New employee registered - Raj Sharma</p>
                <span className="admin_gold_activity_time">6 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default TwgoldAdminDashboard;