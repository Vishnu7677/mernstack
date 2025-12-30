import { useEffect, useState } from 'react';
import {
  getManagerDashboard,
  getManagerMonthlyStats,
  getManagerSLABuckets
} from '../../TWGLogin/axiosConfig';
import Dashboard from '../pages/Dashboard';

const DashboardContainer = () => {
  const [stats, setStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [slaBuckets, setSlaBuckets] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getManagerDashboard(),
      getManagerMonthlyStats(),
      getManagerSLABuckets()
    ])
      .then(([dashboardRes, monthlyRes, slaRes]) => {
        setStats(dashboardRes.data.data);
        setMonthlyStats(monthlyRes.data.data.approvalTrend || []);
        setSlaBuckets(slaRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const decrementPending = () => {
    setStats(prev =>
      prev
        ? {
            ...prev,
            pendingApprovals: Math.max(
              (prev.pendingApprovals || 0) - 1,
              0
            ),
          }
        : prev
    );
  };

  return (
    <Dashboard
      loading={loading}
      stats={stats}
      monthlyStats={monthlyStats}
      slaBuckets={slaBuckets}
      onApprovalAction={decrementPending}
    />
  );
};

export default DashboardContainer;
