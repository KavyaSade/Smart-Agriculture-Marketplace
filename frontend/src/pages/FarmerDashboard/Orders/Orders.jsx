import React from 'react';
import './Orders.css';

const Orders = ({
  orders,
  orderStatusFilter,
  setOrderStatusFilter,
  filteredOrders,
  handleOrderShip,
  handleOrderDeliver
}) => {
  return (
    <div className="section-card">
      <div className="card-section-header">
        <h2>Orders Console</h2>
        <div className="filter-buttons">
          <button 
            onClick={() => setOrderStatusFilter('all')} 
            className={`filter-btn ${orderStatusFilter === 'all' ? 'active' : ''}`}
          >
            All Orders ({orders.length})
          </button>
          <button 
            onClick={() => setOrderStatusFilter('pending')} 
            className={`filter-btn ${orderStatusFilter === 'pending' ? 'active' : ''}`}
          >
            Pending ({orders.filter(o => o.status === 'pending').length})
          </button>
          <button 
            onClick={() => setOrderStatusFilter('shipped')} 
            className={`filter-btn ${orderStatusFilter === 'shipped' ? 'active' : ''}`}
          >
            Shipped ({orders.filter(o => o.status === 'shipped').length})
          </button>
          <button 
            onClick={() => setOrderStatusFilter('delivered')} 
            className={`filter-btn ${orderStatusFilter === 'delivered' ? 'active' : ''}`}
          >
            Delivered ({orders.filter(o => o.status === 'delivered').length})
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-text">No orders match the selected category filter.</span>
        </div>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Buyer Details</th>
                <th>Delivery Location</th>
                <th>Product Description</th>
                <th>Total value</th>
                <th>Order Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td><span className="order-id">{order.id}</span></td>
                  <td>
                    <div className="buyer-info-col">
                      <span className="buyer-name-text">{order.buyerName}</span>
                      <span className="buyer-phone-text">{order.buyerPhone}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#55625b', display: 'block', maxWidth: '200px' }}>
                      {order.buyerAddress}
                    </span>
                  </td>
                  <td>
                    <div className="order-items-col">
                      <span className="order-item-title">{order.productName}</span>
                      <span className="order-item-qty">Quantity: {order.quantity} {order.unit}</span>
                    </div>
                  </td>
                  <td><span className="order-amount-val">₹{order.amount.toLocaleString()}</span></td>
                  <td>{order.date}</td>
                  <td>
                    <span className={`order-status-badge status-${order.status}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="order-actions-container">
                      {order.status === 'pending' && (
                        <button 
                          // Use database document id for API calls.
                          onClick={() => handleOrderShip(order._id)} 
                          className="btn-order-action btn-order-ship"
                        >
                          Ship Order
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button 
                          // Use database document id for API calls.
                          onClick={() => handleOrderDeliver(order._id)} 
                          className="btn-order-action btn-order-deliver"
                        >
                          Deliver
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <span className="text-muted">Finished</span>
                      )}
                    </div>
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
