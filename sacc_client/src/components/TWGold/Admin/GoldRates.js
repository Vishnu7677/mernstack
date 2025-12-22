import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import Navbar from './Navbar';
import { api } from '../TWGLogin/axiosConfig';
import './adminstyles.css'

const GoldRates = () => {
  const [goldRates, setGoldRates] = useState({
    '24k': 0,
    '22k': 0,
    '18k': 0,
    '14k': 0,
    'other': 0
  });
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState({
    current: true,
    history: true
  });
  const [updating, setUpdating] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState('');

  // Fetch current gold rates
  const fetchCurrentRates = async () => {
    try {
      setLoading(prev => ({ ...prev, current: true }));
      const response = await api.get('/twgoldrate/gold-rates/current');
      
      if (response.data.success) {
        setGoldRates(prev => ({
          ...prev,
          ...response.data.data
        }));
      }
    } catch (error) {
      console.error('Error fetching current rates:', error);
      alert('Failed to fetch current gold rates');
    } finally {
      setLoading(prev => ({ ...prev, current: false }));
    }
  };

  // Fetch rate history
  const fetchRateHistory = async () => {
    try {
      setLoading(prev => ({ ...prev, history: true }));
      const response = await api.get('/twgoldrate/gold-rates/history');
      
      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching rate history:', error);
      alert('Failed to fetch rate history');
    } finally {
      setLoading(prev => ({ ...prev, history: false }));
    }
  };

  // Update gold rates
  const updateRates = async () => {
    // Validation
    if (Object.values(goldRates).some(rate => rate <= 0)) {
      alert('Please enter valid rates for all gold types (must be greater than 0)');
      return;
    }
  
    if (!window.confirm('Are you sure you want to update gold rates?')) {
      return;
    }
  
    setUpdating(true);
    try {
      const payload = {
        rates: goldRates,
        remarks: remarks.trim() || undefined,
        effectiveFrom: effectiveFrom || undefined
      };
  
      const response = await api.post('/twgoldrate/gold-rates', payload);
      
      if (response.data.success) {
        alert(response.data.message || 'Gold rates updated successfully!');
        
        // Update local state with returned data
        if (response.data.data) {
          setGoldRates(prev => ({
            ...prev,
            ...response.data.data
          }));
        }
        
        // Refresh history
        await fetchRateHistory();
        // Clear form fields
        setRemarks('');
        setEffectiveFrom('');
      } else {
        alert(response.data.error || 'Failed to update rates');
      }
    } catch (error) {
      console.error('Error updating rates:', error);
      
      let errorMessage = 'Failed to update gold rates';
      if (error.response) {
        // The error is from the server
        errorMessage = error.response.data?.error || 
                      error.response.data?.message || 
                      errorMessage;
      } else if (error.request) {
        // The request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleRateChange = (type, value) => {
    const numValue = parseFloat(value) || 0;
    setGoldRates(prev => ({
      ...prev,
      [type]: numValue
    }));
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchCurrentRates();
    fetchRateHistory();
  }, []);

  // Calculate percentage change for display
  const calculateChange = (currentRate, previousRate) => {
    if (!previousRate || previousRate === 0) return '0.00';
    const change = ((currentRate - previousRate) / previousRate) * 100;
    return change.toFixed(2);
  };

  // Get yesterday's rate for comparison
  const getYesterdayRate = (type) => {
    if (history.length > 0) {
      const yesterday = history[0]?.rates.find(r => r.type === type)?.rate;
      return yesterday || 0;
    }
    return 0;
  };

  // Gold type labels for display
  const goldTypeLabels = {
    '24k': '24K Gold',
    '22k': '22K Gold',
    '18k': '18K Gold',
    '14k': '14K Gold',
    'other': 'Other Gold'
  };

  return (
    <div>
      <Navbar />
      <div className="admin_gold_gold_rates">
        <div className="admin_gold_page_header">
          <h1>Gold Rate Management</h1>
          <p>Update and manage current gold rates across all branches</p>
        </div>

        <div className="admin_gold_rates_content">
          {/* Current Rates Section */}
          <div className="admin_gold_current_rates">
            <div className="admin_gold_section_header">
              <h2>Current Gold Rates (per gram)</h2>
              {loading.current && <span className="admin_gold_loading">Loading...</span>}
            </div>
            
            <div className="admin_gold_rates_grid">
              {Object.keys(goldRates).map((type) => (
                <div key={type} className="admin_gold_rate_card">
                  <div className="admin_gold_rate_header">
                    <TrendingUp size={20} />
                    <span>{goldTypeLabels[type]}</span>
                  </div>
                  <div className="admin_gold_rate_input">
                    <span>₹</span>
                    <input
                      type="number"
                      value={goldRates[type] || ''}
                      onChange={(e) => handleRateChange(type, e.target.value)}
                      className="admin_gold_rate_field"
                      placeholder="Enter rate"
                      min="0"
                      step="0.01"
                      disabled={loading.current}
                    />
                  </div>
                  <div className="admin_gold_rate_change">
                    {!loading.current && (
                      <>
                        <span className={
                          parseFloat(calculateChange(goldRates[type], getYesterdayRate(type))) >= 0 
                            ? "admin_gold_positive" 
                            : "admin_gold_negative"
                        }>
                          {calculateChange(goldRates[type], getYesterdayRate(type))}%
                        </span> 
                        from yesterday
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Update Form Fields */}
            <div className="admin_gold_update_form">
              <div className="admin_gold_form_group">
                <label htmlFor="effectiveFrom">Effective From (Optional):</label>
                <input
                  type="datetime-local"
                  id="effectiveFrom"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  className="admin_gold_form_input"
                  disabled={updating}
                />
              </div>
              
              <div className="admin_gold_form_group">
                <label htmlFor="remarks">Remarks (Optional):</label>
                <input
                  type="text"
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="admin_gold_form_input"
                  placeholder="Add remarks for this update"
                  disabled={updating}
                />
              </div>

              <button 
                onClick={updateRates} 
                className="admin_gold_update_btn"
                disabled={updating || loading.current}
              >
                {updating ? 'Updating...' : 'Update All Rates'}
              </button>
            </div>
          </div>

          {/* Rate History Section */}
          <div className="admin_gold_rate_history">
            <div className="admin_gold_section_header">
              <h2>Rate History</h2>
              {loading.history && <span className="admin_gold_loading">Loading...</span>}
            </div>
            
            {!loading.history && history.length === 0 ? (
              <div className="admin_gold_no_data">
                No rate history available
              </div>
            ) : (
              <div className="admin_gold_history_table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>24K (₹/g)</th>
                      <th>22K (₹/g)</th>
                      <th>18K (₹/g)</th>
                      <th>14K (₹/g)</th>
                      <th>Change %</th>
                      <th>Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((record, index) => {
                      // Find rates for each type
                      const rate24k = record.rates.find(r => r.type === '24k')?.rate || 0;
                      const rate22k = record.rates.find(r => r.type === '22k')?.rate || 0;
                      const rate18k = record.rates.find(r => r.type === '18k')?.rate || 0;
                      const rate14k = record.rates.find(r => r.type === '14k')?.rate || 0;
                      
                      // Get previous day's rate for comparison
                      const prevRate24k = history[index + 1]?.rates.find(r => r.type === '24k')?.rate || rate24k;
                      const changeAmount = rate24k - prevRate24k;
                      
                      return (
                        <tr key={record.date}>
                          <td>
                            <Calendar size={16} />
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td>₹{rate24k.toFixed(2)}</td>
                          <td>₹{rate22k.toFixed(2)}</td>
                          <td>₹{rate18k.toFixed(2)}</td>
                          <td>₹{rate14k.toFixed(2)}</td>
                          <td>
                            <span className={
                              parseFloat(record.changePercent) >= 0 
                                ? "admin_gold_positive" 
                                : "admin_gold_negative"
                            }>
                              {record.changePercent}%
                            </span>
                          </td>
                          <td>
                            <span className={
                              changeAmount >= 0 
                                ? "admin_gold_positive" 
                                : "admin_gold_negative"
                            }>
                              {changeAmount >= 0 ? '+' : ''}{changeAmount.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldRates;