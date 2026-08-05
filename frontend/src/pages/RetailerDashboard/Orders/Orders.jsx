import React, { useState } from 'react';
import './Orders.css';

export default function Orders({ orders, setOrders, setAlert }) {
  const [orderFilter, setOrderFilter] = useState('all');

  // change order status
  const handleOrderStatusChange = (orderId, newStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    setAlert({ type: 'success', text: `Order marked as ${newStatus}!` });
  };

  // filter orders by active status
  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  return (
    <div className="orders-view">
      <div className="orders-filter-bar">
        {['all', 'pending', 'shipped', 'delivered', 'cancelled'].map(tab => (
          <button
            key={tab}
            className={`order-filter-tab ${orderFilter === tab ? 'active' : ''}`}
            onClick={() => setOrderFilter(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {filteredOrders.length > 0 ? (
        <div className="responsive-table-wrapper">
          <table className="custom-dashboard-table">
            <thead>
              <tr>
                <th className="text-dark">Order ID</th>
                <th className="text-dark">Date</th>
                <th className="text-dark">Customer</th>
                <th className="text-dark">Product Details</th>
                <th className="text-dark">Total Paid</th>
                <th className="text-dark">Status</th>
                <th className="text-dark">Action Change</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => (
                <tr key={o.id}>
                  <td className="font-bold text-dark">{o.id}</td>
                  <td className="text-dark">{o.date}</td>
                  <td className="text-dark">{o.buyerName}</td>
                  <td className="text-dark">{o.productName} (x{o.quantity} {o.unit})</td>
                  <td className="text-dark">₹{o.total.toFixed(2)}</td>
                  <td>
                    <span className={`order-status-badge ${o.status}`}>{o.status}</span>
                  </td>
                  <td>
                    <select
                      className="order-status-select"
                      value={o.status}
                      onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state-card">
          <img src="/src/assets/icons/delivery.png" alt="" style={{ width: '48px', height: '48px', marginBottom: '16px' }} />
          <h3 className="empty-state-title text-dark">No orders found</h3>
          <p className="empty-state-desc text-muted">
            There are no orders with status "{orderFilter}" currently.
          </p>
        </div>
      )}
    </div>
  );
}
