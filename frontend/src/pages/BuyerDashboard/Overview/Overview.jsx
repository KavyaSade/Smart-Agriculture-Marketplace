import React from 'react';
import { ShoppingCart, Heart, ShoppingBag, CreditCard, ChevronRight } from 'lucide-react';
import './Overview.css';

const Overview = ({
  profileData,
  cart,
  wishlist,
  orders,
  handleTabChange
}) => {
  const totalSpent = orders.reduce((sum, order) => sum + order.amount, 0);
  const activeOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'shipped').length;

  return (
    <div className="overview-tab-container">

      <div className="welcome-banner-card">
        <h1 className="welcome-banner-title">Welcome back, {profileData.firstName || 'Buyer'}!</h1>
        <p className="welcome-banner-subtitle">
          Browse fresh, high-quality organic crops directly from local farms. Track your orders, manage your cart, and support local farming.
        </p>
      </div>

      <section className="summary-cards-redesign">
        <div className="summary-card-new" onClick={() => handleTabChange('cart')} style={{ cursor: 'pointer' }}>
          <div className="card-icon-wrapper-new icon-cart">
            <ShoppingCart size={22} />
          </div>
          <div className="card-details-new">
            <span className="card-value-new">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
            <span className="card-title-new">Cart Items</span>
          </div>
        </div>

        <div className="summary-card-new" onClick={() => handleTabChange('wishlist')} style={{ cursor: 'pointer' }}>
          <div className="card-icon-wrapper-new icon-wishlist">
            <Heart size={22} />
          </div>
          <div className="card-details-new">
            <span className="card-value-new">{wishlist.length}</span>
            <span className="card-title-new">Wishlist</span>
          </div>
        </div>

        <div className="summary-card-new" onClick={() => handleTabChange('orders')} style={{ cursor: 'pointer' }}>
          <div className="card-icon-wrapper-new icon-orders">
            <ShoppingBag size={22} />
          </div>
          <div className="card-details-new">
            <span className="card-value-new">{activeOrdersCount} Active</span>
            <span className="card-title-new">Placed Orders</span>
          </div>
        </div>

        <div className="summary-card-new">
          <div className="card-icon-wrapper-new icon-spent">
            <CreditCard size={22} />
          </div>
          <div className="card-details-new">
            <span className="card-value-new">₹{totalSpent.toLocaleString()}</span>
            <span className="card-title-new">Total Spent</span>
          </div>
        </div>
      </section>

      <div className="dashboard-grid-redesign">

        <div className="analytics-card-redesign orders-column">
          <div className="card-section-header-redesign">
            <h2>Recent Placed Orders</h2>
            <button onClick={() => handleTabChange('orders')} className="view-all-link">
              View All Orders
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="empty-orders-view" style={{ padding: '2rem 1rem', textAlign: 'center', color: '#7c8d84' }}>
              <p>You haven't placed any crop orders yet.</p>
              <button 
                onClick={() => handleTabChange('browse')} 
                className="btn btn-primary"
                style={{ marginTop: '0.75rem', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
              >
                Browse Crops
              </button>
            </div>
          ) : (
            <div className="orders-table-wrapper-redesign">
              <table className="orders-table-redesign">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Product</th>
                    <th>Farmer</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 4).map((order) => (
                    <tr key={order.id}>
                      <td><strong>{order.id}</strong></td>
                      <td>{order.productName} (x{order.quantity} {order.unit})</td>
                      <td>{order.farmerName}</td>
                      <td><span className="order-amount-val">₹{order.amount.toLocaleString()}</span></td>
                      <td>
                        <span className={`order-status-pill badge-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="analytics-card-redesign warnings-column">
          <div className="card-section-header-redesign">
            <h2>Marketplace Highlights</h2>
          </div>
          <div className="warnings-list-redesign">
            <div className="warning-card-redesign" style={{ background: 'rgba(82, 183, 136, 0.04)', borderColor: 'rgba(82, 183, 136, 0.15)' }}>
              <div className="warning-left">
                <div className="warning-info" style={{ marginLeft: 0 }}>
                  <strong className="warning-name" style={{ color: '#1b4332' }}>Support Local Farmers</strong>
                  <span className="warning-status" style={{ color: '#55625b' }}>Get direct supply chain freshness and save up to 25% on grains and spices.</span>
                </div>
              </div>
              <button onClick={() => handleTabChange('browse')} className="restock-action-btn" style={{ background: '#40916c', color: '#ffffff' }}>
                Shop
              </button>
            </div>

            <div className="warning-card-redesign" style={{ background: 'rgba(82, 183, 136, 0.04)', borderColor: 'rgba(82, 183, 136, 0.15)' }}>
              <div className="warning-left">
                <div className="warning-info" style={{ marginLeft: 0 }}>
                  <strong className="warning-name" style={{ color: '#1b4332' }}>Quick Checkout</strong>
                  <span className="warning-status" style={{ color: '#55625b' }}>Add contact details in settings to enjoy 1-click simulations.</span>
                </div>
              </div>
              <button onClick={() => handleTabChange('settings')} className="restock-action-btn" style={{ background: '#40916c', color: '#ffffff' }}>
                Setup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
