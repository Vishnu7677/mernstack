import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import Navbar from './Navbar';

const GoldRates = () => {
  const [goldRates, setGoldRates] = useState({
    '24k': 6245,
    '22k': 5720,
    '18k': 4685
  });

  const [history] = useState([
    { date: '2024-01-15', '24k': 6220, '22k': 5700, '18k': 4670 },
    { date: '2024-01-14', '24k': 6210, '22k': 5690, '18k': 4660 },
    { date: '2024-01-13', '24k': 6195, '22k': 5675, '18k': 4650 },
    { date: '2024-01-12', '24k': 6180, '22k': 5660, '18k': 4640 }
  ]);

  const handleRateChange = (type, value) => {
    setGoldRates(prev => ({
      ...prev,
      [type]: parseFloat(value) || 0
    }));
  };

  const updateRates = () => {
    // API call to update rates
    alert('Gold rates updated successfully!');
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
        <div className="admin_gold_current_rates">
          <h2>Current Gold Rates (per gram)</h2>
          <div className="admin_gold_rates_grid">
            {Object.entries(goldRates).map(([type, rate]) => (
              <div key={type} className="admin_gold_rate_card">
                <div className="admin_gold_rate_header">
                  <TrendingUp size={20} />
                  <span>Gold {type.toUpperCase()}</span>
                </div>
                <div className="admin_gold_rate_input">
                  <span>₹</span>
                  <input
                    type="number"
                    value={rate}
                    onChange={(e) => handleRateChange(type, e.target.value)}
                    className="admin_gold_rate_field"
                  />
                </div>
                <div className="admin_gold_rate_change">
                  <span className="admin_gold_positive">+2.1%</span> from yesterday
                </div>
              </div>
            ))}
          </div>

          <button onClick={updateRates} className="admin_gold_update_btn">
            Update All Rates
          </button>
        </div>

        <div className="admin_gold_rate_history">
          <h2>Rate History</h2>
          <div className="admin_gold_history_table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>24K (₹/g)</th>
                  <th>22K (₹/g)</th>
                  <th>18K (₹/g)</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => (
                  <tr key={record.date}>
                    <td>
                      {/* <Calendar size={16} /> */}
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td>₹{record['24k']}</td>
                    <td>₹{record['22k']}</td>
                    <td>₹{record['18k']}</td>
                    <td>
                      <span className="admin_gold_positive">
                        +{(record['24k'] - history[index + 1]?.['24k'] || 0).toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default GoldRates;