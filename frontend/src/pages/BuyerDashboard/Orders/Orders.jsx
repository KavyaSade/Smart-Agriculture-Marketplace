import React from 'react';
import './Orders.css';

const Orders = ({
  orders,
  handleCancelOrder
}) => {
  return (
    <div className="section-card animate-fade-in">
      <div className="card-section-header">
        <h2>Your Placed Orders</h2>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state" style={{ padding: '3rem 1rem' }}>
          <span className="empty-state-text">You have no order transactions yet.</span>
        </div>
      ) : (
        <div className="orders-table-wrapper" style={{ marginTop: '1.5rem' }}>
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Crop Description</th>
                <th>Farmer Details</th>
                <th>Total Value</th>
                <th>Order Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td><span className="order-id">{order.id}</span></td>
                  <td>
                    <div className="order-items-col">
                      <span className="order-item-title">{order.productName}</span>
                      <span className="order-item-qty">Quantity: {order.quantity} {order.unit}</span>
                    </div>
                  </td>
                  <td>
                    <span className="order-farmer-name">{order.farmerName}</span>
                  </td>
                  <td><span className="order-amount-val">₹{order.amount.toLocaleString()}</span></td>
                  <td>{order.date}</td>
                  <td>
                    <span className={`order-status-badge status-${order.status}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {order.status === 'pending' ? (
                      <button 
                        // Use database document id for API calls.
                        onClick={() => handleCancelOrder(order._id)} 
                        className="btn-order-action"
                        style={{
                          backgroundColor: 'rgba(220, 38, 38, 0.08)',
                          color: '#dc2626',
                          border: '1px solid rgba(220, 38, 38, 0.2)',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel Order
                      </button>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.8rem', color: '#7c8d84' }}>No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
