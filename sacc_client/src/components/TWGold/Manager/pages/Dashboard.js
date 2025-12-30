import DashboardSkeleton from './DashboardSkeleton';

const Dashboard = ({ stats, monthlyStats, slaBuckets, loading }) => {
    if (loading) return <DashboardSkeleton />;

  if (!stats) {
    return <div className="twgold_manager_card">No data available</div>;
  }
  
    return (
      <>
        {/* ================= KPI CARDS ================= */}
        <div className="twgold_manager_cards_grid">
          <div className="twgold_manager_card kpi">
            <h3>Total Active Loans</h3>
            <p>{stats.activeLoans ?? 0}</p>
          </div>
  
          <div className="twgold_manager_card kpi">
            <h3>Total Gold (grams)</h3>
            <p>{stats.totalGold ?? 0}</p>
          </div>
  
          <div className="twgold_manager_card kpi">
            <h3>Today's Disbursement</h3>
            <p>₹ {stats.todayDisbursement ?? 0}</p>
          </div>
  
          <div className="twgold_manager_card kpi">
            <h3>Pending Approvals</h3>
            <p>{stats.pendingApprovals ?? 0}</p>
          </div>
        </div>
  
        {/* ================= MONTHLY STATS ================= */}
        <div className="twgold_manager_card">
          <h3>Monthly Loan Trend</h3>
  
          <table className="twgold_manager_table compact">
            <thead>
              <tr>
                <th>Month</th>
                <th>Approved</th>
                <th>Rejected</th>
              </tr>
            </thead>
            <tbody>
              {monthlyStats.map((row, idx) => (
                <tr key={idx}>
                  <td>
                    {row._id.month}/{row._id.year}
                  </td>
                  <td className="success">{row.approved}</td>
                  <td className="danger">{row.rejected}</td>
                </tr>
              ))}
  
              {!monthlyStats.length && (
                <tr>
                  <td colSpan="3" align="center">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
  
        {/* ================= SLA BUCKETS ================= */}
        <div className="twgold_manager_card">
          <h3>Approval SLA Buckets</h3>
  
          {slaBuckets ? (
            <div className="sla_grid">
              <div className="sla_box green">
                <span>0 – 24 hrs</span>
                <b>{slaBuckets['0-24h']}</b>
              </div>
  
              <div className="sla_box orange">
                <span>24 – 48 hrs</span>
                <b>{slaBuckets['24-48h']}</b>
              </div>
  
              <div className="sla_box red">
                <span>48+ hrs</span>
                <b>{slaBuckets['48h+']}</b>
              </div>
            </div>
          ) : (
            <p>No SLA data</p>
          )}
        </div>
      </>
    );
  };
  
  export default Dashboard;
  