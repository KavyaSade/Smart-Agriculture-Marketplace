import React, { useState } from 'react';
import './Orders.css';

export default function Orders({ orders, setOrders, setAlert }) {
  const [orderFilter, setOrderFilter] = useState('all');

  const updateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAlert({ type: 'error', text: 'You must be logged in.' });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const updated = await response.json();
        setOrders(orders.map(o => {
          if (o.id === orderId) {
            return { ...o, status: updated.status };
          }
          return o;
        }));
        setAlert({ type: 'success', text: `Order status overridden to ${newStatus}!` });
      } else {
        const data = await response.json();
        setAlert({ type: 'error', text: data.message || 'Failed to override order status.' });
      }
    } catch (err) {
      console.error('Error overriding order status:', err);
      setAlert({ type: 'error', text: 'Network error.' });
    }
  };

  const filteredOrders = orders.filter(o => 
    orderFilter === 'all' || o.status === orderFilter
  );

  return (
    <div className="admin-orders-view">
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
                <th className="text-dark">Buyer Name</th>
                <th className="text-dark">Product Detail</th>
                <th className="text-dark">Total Bill</th>
                <th className="text-dark">Current Status</th>
                <th className="text-dark">Admin Status Override</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => (
                <tr key={o.id}>
                  <td className="font-bold text-dark">{o.id}</td>
                  <td className="text-dark">{o.date}</td>
                  <td className="text-dark">{o.buyerName}</td>
                  <td className="text-dark">{o.productName} (x{o.quantity} {o.unit})</td>
                  <td className="text-dark font-bold">₹{Number(o.total || 0).toFixed(2)}</td>
                  <td>
                    <span className={`order-status-badge ${o.status}`}>{o.status}</span>
                  </td>
                  <td>
                    <select
                      className="order-status-select"
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value)}
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
          <p className="empty-state-desc text-muted">There are no orders with status "{orderFilter}" currently.</p>
        </div>
      )}
    </div>
  );
}
