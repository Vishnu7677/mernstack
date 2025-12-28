import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import Navbar from './Navbar';
import { api } from '../TWGLogin/axiosConfig';
import './adminstyles.css';

const GoldRates = () => {
  const [goldRates, setGoldRates] = useState({
    '24K': 0,
    '22K': 0,
    '20K': 0,
    '18K': 0,
    'other': 0
  });

  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState({
    current: true,
    history: true
  });

  const [updating, setUpdating] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState('');

  /* ================= CURRENT RATES ================= */
  const fetchCurrentRates = async () => {
    try {
      setLoading(p => ({ ...p, current: true }));
      const res = await api.get('/twgoldrate/gold-rates/current');
  
      if (res.data.success && res.data.data) {
        const r = res.data.data.rates;

setGoldRates({
  '24K': r['24K'] ?? 0,
  '22K': r['22K'] ?? 0,
  '20K': r['20K'] ?? 0,
  '18K': r['18K'] ?? 0,
  'other': r['other'] ?? 0
});

      }
    } catch {
      alert('Failed to fetch current gold rates');
    } finally {
      setLoading(p => ({ ...p, current: false }));
    }
  };
  

  /* ================= HISTORY (PAGINATED) ================= */
  const fetchRateHistory = async (pageNo = 1) => {
    try {
      setLoading(p => ({ ...p, history: true }));
      const res = await api.get(`/twgoldrate/gold-rates/history?page=${pageNo}`);

      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      alert('Failed to fetch rate history');
    } finally {
      setLoading(p => ({ ...p, history: false }));
    }
  };

  /* ================= UPDATE RATES ================= */
  const updateRates = async () => {
    if (Object.values(goldRates).some(v => v <= 0)) {
      alert('Please enter valid rates for all gold types');
      return;
    }

    if (!window.confirm('Are you sure you want to update gold rates?')) return;

    setUpdating(true);
    try {
      const payload = {
        rates: {
          '24k': goldRates['24K'],
          '22k': goldRates['22K'],
          '20k': goldRates['20K'],
          '18k': goldRates['18K'],
          'other': goldRates['other']
        },
        remarks: remarks || undefined,
        effectiveFrom: effectiveFrom || undefined
      };

      const res = await api.post('/twgoldrate/gold-rates', payload);

      if (res.data.success) {
        alert('Gold rates updated successfully');
        fetchCurrentRates();
        fetchRateHistory(page);
        setRemarks('');
        setEffectiveFrom('');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update gold rates');
    } finally {
      setUpdating(false);
    }
  };

  /* ================= EFFECT ================= */
  useEffect(() => {
    fetchCurrentRates();
    fetchRateHistory(page);
  }, [page]);

  /* ================= HELPERS ================= */
  const calculateChange = (today, yesterday) => {
    if (!yesterday || yesterday === 0) return '0.00';
    return (((today - yesterday) / yesterday) * 100).toFixed(2);
  };

  const getYesterdayRate = (type) => {
    if (!history[1]) return goldRates[type];
    if (new Date(history[0].date).toDateString() ===
        new Date(history[1].date).toDateString()) {
      return goldRates[type];
    }
    return history[1].rates[type];
  };
  

  const goldTypeLabels = {
    '24K': '24K Gold',
    '22K': '22K Gold',
    '20K': '20K Gold',
    '18K': '18K Gold',
    'other': 'Other Gold'
  };

  return (
    <div>
      <Navbar />

      <div className="admin_gold_gold_rates">
        <div className="admin_gold_page_header">
          <h1>Gold Rate Management</h1>
          <p>Update and manage current gold rates</p>
        </div>

        <div className="admin_gold_rates_content">

          {/* CURRENT RATES */}
          <div className="admin_gold_current_rates">
            <div className="admin_gold_section_header">
              <h2>Current Gold Rates (per gram)</h2>
              {loading.current && <span className="admin_gold_loading">Loading...</span>}
            </div>

            <div className="admin_gold_rates_grid">
            {['24K', '22K', '20K', '18K', 'other'].map(type => (
                <div key={type} className="admin_gold_rate_card">
                  <div className="admin_gold_rate_header">
                    <TrendingUp size={20} />
                    <span>{goldTypeLabels[type]}</span>
                  </div>

                  <div className="admin_gold_rate_input">
                    <span>₹</span>
                    <input
                      type="number"
                      value={goldRates[type]}
                      onChange={e =>
                        setGoldRates(p => ({
                          ...p,
                          [type]: Number(e.target.value)
                        }))
                      }
                      className="admin_gold_rate_field"
                      min="0"
                      step="0.01"
                      disabled={loading.current}
                    />
                  </div>

                  {!loading.history && (
                    <div className="admin_gold_rate_change">
                      <span
  className={
    calculateChange(
      goldRates[type],
      getYesterdayRate(type)
    ) >= 0
      ? 'admin_gold_positive'
      : 'admin_gold_negative'
  }
>
  {calculateChange(goldRates[type], getYesterdayRate(type)) === '0.00'
    ? 'No change'
    : `${calculateChange(goldRates[type], getYesterdayRate(type))}%`}
</span>{' '}
from yesterday
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* UPDATE FORM */}
            <div className="admin_gold_update_form">
              <div className="admin_gold_form_group">
                <label>Effective From (Optional)</label>
                <input
                  type="datetime-local"
                  value={effectiveFrom}
                  onChange={e => setEffectiveFrom(e.target.value)}
                  className="admin_gold_form_input"
                />
              </div>

              <div className="admin_gold_form_group">
                <label>Remarks (Optional)</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  className="admin_gold_form_input"
                />
              </div>

              <button
                onClick={updateRates}
                className="admin_gold_update_btn"
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Update All Rates'}
              </button>
            </div>
          </div>

          {/* HISTORY */}
          <div className="admin_gold_rate_history">
            <div className="admin_gold_section_header">
              <h2>Rate History</h2>
              {loading.history && <span className="admin_gold_loading">Loading...</span>}
            </div>

            {!loading.history && history.length === 0 ? (
              <div className="admin_gold_no_data">No rate history available</div>
            ) : (
              <div className="admin_gold_history_table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>24K</th>
                      <th>22K</th>
                      <th>20K</th>
                      <th>18K</th>
<th>Other</th>
<th>Change %</th>

                    </tr>
                  </thead>
                  <tbody>
                    {history.map((row, i) => {
                      const today = row.rates['24K'];
                      const prev = history[i + 1]?.rates['24K'] || today;

                      return (
                        <tr key={row.date}>
                          <td>
                            <Calendar size={16} />{' '}
                            {new Date(row.date).toLocaleDateString()}
                          </td>
                          <td>₹{row.rates['24K']}</td>
                          <td>₹{row.rates['22K']}</td>
                          <td>₹{row.rates['20K']}</td>
                          <td>₹{row.rates['18K']}</td>
                          <td>₹{row.rates['other'] ?? '-'}</td>
                          <td
                            className={
                              today - prev >= 0
                                ? 'admin_gold_positive'
                                : 'admin_gold_negative'
                            }
                          >
                           {calculateChange(today, prev) === '0.00'
    ? 'No change'
    : `${calculateChange(today, prev)}%`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* PAGINATION */}
            <div className="admin_gold_pagination">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                Prev
              </button>
              <span>Page {page}</span>
              <button onClick={() => setPage(p => p + 1)}>Next</button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldRates;