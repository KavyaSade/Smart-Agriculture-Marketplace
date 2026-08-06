import React from 'react';
import './Overview.css';

export default function Overview({ 
  orders, 
  products, 
  totalRevenue, 
  revenueBalance, 
  setActiveTab, 
  openEditProductView 
}) {
  // count both low stock and out of stock items
  const lowStockCount = products.filter(p => p.stock <= 10).length;

  return (
    <div className="overview-view">
      <div className="overview-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-container green">
            <img src="/src/assets/icons/rupee.png" alt="" className="stat-card-png-icon" />
          </div>
          <div className="stat-details">
            <span className="stat-value text-dark">₹{totalRevenue.toFixed(2)}</span>
            <span className="stat-label text-muted">Total Sales</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-container blue">
            <img src="/src/assets/icons/delivery.png" alt="" className="stat-card-png-icon" />
          </div>
          <div className="stat-details">
            <span className="stat-value text-dark">{orders.length}</span>
            <span className="stat-label text-muted">Total Orders</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-container orange">
            <img src="/src/assets/icons/shopping-bag.png" alt="" className="stat-card-png-icon" />
          </div>
          <div className="stat-details">
            <span className="stat-value text-dark">{products.length}</span>
            <span className="stat-label text-muted">Total Products</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-container purple">
            <img src="/src/assets/icons/rupee.png" alt="" className="stat-card-png-icon" />
          </div>
          <div className="stat-details">
            <span className="stat-value text-dark">₹{revenueBalance.toFixed(2)}</span>
            <span className="stat-label text-muted">Payout Balance</span>
          </div>
        </div>
      </div>

      {/* split row for orders and inventory alerts */}
      <div className="overview-split-layout">
        {/* recent orders list */}
        <div className="dashboard-card">
          <div className="card-header-row">
            <h3 className="text-dark">Recent Orders</h3>
            <button className="view-all-link-btn" onClick={() => setActiveTab('orders')}>
              View All Orders
            </button>
          </div>
          
          <div className="responsive-table-wrapper">
            <table className="custom-dashboard-table">
              <thead>
                <tr>
                  <th className="text-dark">Order ID</th>
                  <th className="text-dark">Buyer</th>
                  <th className="text-dark">Product</th>
                  <th className="text-dark">Total</th>
                  <th className="text-dark">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 4).map(o => (
                  <tr key={o.id}>
                    <td className="font-bold text-dark">{o.id}</td>
                    <td className="text-dark">{o.buyerName}</td>
                    <td className="text-dark">{o.productName} (x{o.quantity})</td>
                    <td className="text-dark">₹{Number(o.total || 0).toFixed(2)}</td>
                    <td>
                      <span className={`order-status-badge ${o.status}`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* low stock warnings */}
        <div className="dashboard-card">
          <div className="card-header-row">
            <h3 className="text-dark">Inventory Warnings</h3>
            {lowStockCount > 0 && <span className="bg-orange-500 text-white rounded-full text-xs px-2 py-0.5 font-bold">{lowStockCount} alert(s)</span>}
          </div>
          
          {products.filter(p => p.stock <= 10).length > 0 ? (
            <div className="flex flex-col gap-3">
              {products.filter(p => p.stock <= 10).map(p => (
                <div key={p.id} className="warning-item-row animate-fade-in-up">
                  <img 
                    src={p.image} 
                    alt={p.title} 
                    className="warning-item-img" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400';
                    }}
                  />
                  <div className="flex-grow min-w-0">
                    <h4 className="warning-item-title truncate">{p.title}</h4>
                    <span className="warning-item-status">
                      {p.stock === 0 ? 'Out of Stock' : `Only ${p.stock} ${p.unit} remaining`}
                    </span>
                  </div>
                  <button 
                    className="warning-item-action-btn"
                    onClick={() => openEditProductView(p)}
                  >
                    Restock
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted text-sm">
              <img src="/src/assets/icons/sprout.png" alt="" style={{ width: '24px', height: '24px', margin: '0 auto 8px' }} />
              All inventory stock levels are healthy!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
