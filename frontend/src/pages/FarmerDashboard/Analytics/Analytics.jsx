import React from 'react';
import './Analytics.css';

const Analytics = () => {
  return (
    <div className="section-card">
      <div className="card-section-header">
        <h2>Financial Growth Report</h2>
      </div>

      <div className="dashboard-grid">
        <div className="analytics-card">
          <div className="card-section-header">
            <h2>Revenue Projections (6 Months)</h2>
          </div>

          <div className="chart-wrapper">
            <svg viewBox="0 0 500 180" className="chart-svg-container">
              <defs>
                <linearGradient id="fullAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#40916c" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#40916c" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(82, 183, 136, 0.1)" strokeDasharray="4" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(82, 183, 136, 0.1)" strokeDasharray="4" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="rgba(82, 183, 136, 0.1)" strokeDasharray="4" />
              <line x1="40" y1="150" x2="480" y2="150" stroke="rgba(82, 183, 136, 0.3)" />

              <path 
                d="M 40 140 Q 120 100 200 120 T 360 60 T 480 30" 
                fill="none" 
                stroke="#40916c" 
                strokeWidth="3.5" 
              />
              <path 
                d="M 40 140 Q 120 100 200 120 T 360 60 T 480 30 L 480 150 L 40 150 Z" 
                fill="url(#fullAreaGrad)" 
              />

              <circle cx="40" cy="140" r="5" fill="#1b4332" />
              <circle cx="130" cy="103" r="5" fill="#1b4332" />
              <circle cx="220" cy="116" r="5" fill="#1b4332" />
              <circle cx="310" cy="80" r="5" fill="#1b4332" />
              <circle cx="400" cy="52" r="5" fill="#1b4332" />
              <circle cx="480" cy="30" r="5" fill="#1b4332" />

              <text x="40" y="170" fill="#7c8d84" fontSize="10" textAnchor="middle">Jan</text>
              <text x="130" y="170" fill="#7c8d84" fontSize="10" textAnchor="middle">Feb</text>
              <text x="220" y="170" fill="#7c8d84" fontSize="10" textAnchor="middle">Mar</text>
              <text x="310" y="170" fill="#7c8d84" fontSize="10" textAnchor="middle">Apr</text>
              <text x="400" y="170" fill="#7c8d84" fontSize="10" textAnchor="middle">May</text>
              <text x="480" y="170" fill="#7c8d84" fontSize="10" textAnchor="middle">Jun</text>
            </svg>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-section-header">
            <h2>Crop Share</h2>
          </div>
          <div className="breakdown-list">
            <div className="breakdown-item">
              <div className="breakdown-label-row">
                <span>Grains</span>
                <span>52%</span>
              </div>
              <div className="breakdown-bar-bg">
                <div className="breakdown-bar-fill bg-grains" style={{ width: '52%' }}></div>
              </div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-label-row">
                <span>Fruits & Vegetables</span>
                <span>28%</span>
              </div>
              <div className="breakdown-bar-bg">
                <div className="breakdown-bar-fill bg-fruits" style={{ width: '28%' }}></div>
              </div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-label-row">
                <span>Dairy Products</span>
                <span>12%</span>
              </div>
              <div className="breakdown-bar-bg">
                <div className="breakdown-bar-fill bg-dairy" style={{ width: '12%' }}></div>
              </div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-label-row">
                <span>Spices</span>
                <span>8%</span>
              </div>
              <div className="breakdown-bar-bg">
                <div className="breakdown-bar-fill bg-spices" style={{ width: '8%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <div className="card-section-header">
          <h2>Monthly Statements</h2>
        </div>
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Orders Count</th>
                <th>Revenue Generated</th>
                <th>Inventory Dispatched</th>
                <th>Performance Index</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>June 2026</strong></td>
                <td>14 Orders</td>
                <td><span className="order-amount-val">₹48,200</span></td>
                <td>980 Kg</td>
                <td><span className="order-status-badge status-delivered">EXCELLENT</span></td>
              </tr>
              <tr>
                <td><strong>May 2026</strong></td>
                <td>12 Orders</td>
                <td><span className="order-amount-val">₹39,800</span></td>
                <td>850 Kg</td>
                <td><span className="order-status-badge status-delivered">EXCELLENT</span></td>
              </tr>
              <tr>
                <td><strong>April 2026</strong></td>
                <td>8 Orders</td>
                <td><span className="order-amount-val">₹24,500</span></td>
                <td>560 Kg</td>
                <td><span className="order-status-badge status-shipped">STABLE</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
