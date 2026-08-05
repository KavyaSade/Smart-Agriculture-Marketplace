import React from 'react';
import './Overview.css';

export default function Overview({ 
  users, 
  products, 
  orders, 
  platformEarnings, 
  setActiveTab,
  setAlert
}) {
  const totalSellers = users.filter(u => u.role === 'retailer').length;
  const totalBuyers = users.filter(u => u.role === 'buyer').length;

  const totalSales = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = orders.length > 0 ? totalSales / orders.length : 0;

  const triggerExport = (reportType) => {
    setAlert({ type: 'success', text: `Exporting ${reportType} report... PDF download started!` });
  };

  return (
    <div className="admin-overview-view">
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper blue">
            <img src="/src/assets/icons/group.png" alt="" className="admin-stat-icon" />
          </div>
          <div className="stat-details">
            <span className="stat-value text-dark">{users.length}</span>
            <span className="stat-label text-muted">Total Users</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper green">
            <img src="/src/assets/icons/sprout.png" alt="" className="admin-stat-icon" />
          </div>
          <div className="stat-details">
            <span className="stat-value text-dark">{totalSellers}</span>
            <span className="stat-label text-muted">Active Retailers</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper orange">
            <img src="/src/assets/icons/shopping-bag.png" alt="" className="admin-stat-icon" />
          </div>
          <div className="stat-details">
            <span className="stat-value text-dark">{totalBuyers}</span>
            <span className="stat-label text-muted">Registered Buyers</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper wheat">
            <img src="/src/assets/icons/wheat.png" alt="" className="admin-stat-icon" />
          </div>
          <div className="stat-details">
            <span className="stat-value text-dark">{products.length}</span>
            <span className="stat-label text-muted">Live Products</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper purple">
            <img src="/src/assets/icons/delivery.png" alt="" className="admin-stat-icon" />
          </div>
          <div className="stat-details">
            <span className="stat-value text-dark">{orders.length}</span>
            <span className="stat-label text-muted">Total Orders</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper gold">
            <img src="/src/assets/icons/rupee.png" alt="" className="admin-stat-icon" />
          </div>
          <div className="stat-details">
            <span className="stat-value text-dark">₹{platformEarnings.toFixed(2)}</span>
            <span className="stat-label text-muted">Commissions Earned</span>
          </div>
        </div>
      </div>

      <div className="admin-split-layout">
        <div className="dashboard-card">
          <div className="card-header-row">
            <h3 className="text-dark">Recent System Events</h3>
            <button className="view-all-link-btn" onClick={() => setActiveTab('users')}>
              Manage Accounts
            </button>
          </div>
          <div className="system-logs-list">
            <div className="log-item">
              <span className="log-badge success">USER REG</span>
              <span className="log-text text-dark">New Retailer <strong>Rishi</strong> registered from Nellore.</span>
              <span className="log-time text-muted">10 mins ago</span>
            </div>
            <div className="log-item">
              <span className="log-badge info">ORDER PLACED</span>
              <span className="log-text text-dark">Order <strong>ORD-9021</strong> placed for Organic Red Tomatoes by <strong>Dileep</strong>.</span>
              <span className="log-time text-muted">1 hour ago</span>
            </div>
            <div className="log-item">
              <span className="log-badge warning">STOCK ALERT</span>
              <span className="log-text text-dark">Retailer product <strong>Raw Farm Fresh Milk</strong> fell below stock safety threshold.</span>
              <span className="log-time text-muted">3 hours ago</span>
            </div>
            <div className="log-item">
              <span className="log-badge danger">WITHDRAWAL</span>
              <span className="log-text text-dark">Retailer <strong>Kavya</strong> requested payout release of <strong>₹12,500.00</strong>.</span>
              <span className="log-time text-muted">5 hours ago</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="dashboard-card">
            <div className="card-header-row">
              <h3 className="text-dark">Quick Platform Actions</h3>
            </div>
            <div className="quick-actions-grid">
              <button className="quick-btn" onClick={() => setActiveTab('users')}>
                Approve Retailers
              </button>
              <button className="quick-btn" onClick={() => setActiveTab('products')}>
                Moderate Items
              </button>
              <button className="quick-btn" onClick={() => setActiveTab('payments')}>
                Release Payouts
              </button>
              <button className="quick-btn" onClick={() => setActiveTab('settings')}>
                Adjust Fee Rate
              </button>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header-row">
              <h3 className="text-dark">Export Data Reports</h3>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <button className="quick-btn w-full flex items-center gap-2" onClick={() => triggerExport('Users Registry')} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                <img src="/src/assets/icons/group.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                <span>Export Users Registry (PDF)</span>
              </button>
              <button className="quick-btn w-full flex items-center gap-2" onClick={() => triggerExport('Products Listing')} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                <img src="/src/assets/icons/wheat.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                <span>Export Products Catalog (PDF)</span>
              </button>
              <button className="quick-btn w-full flex items-center gap-2" onClick={() => triggerExport('Transactions Ledger')} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                <img src="/src/assets/icons/rupee.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                <span>Export Orders & Payments (PDF)</span>
              </button>
            </div>
            <div className="text-xs text-muted mt-3" style={{ borderTop: '1px solid rgba(82, 183, 136, 0.1)', paddingTop: '8px' }}>
              • Average Order Value: <strong>₹{avgOrderValue.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
