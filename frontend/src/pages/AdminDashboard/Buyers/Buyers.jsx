import React, { useState } from 'react';
import './Buyers.css';

export default function Buyers({ users, orders }) {
  const [buyerSearch, setBuyerSearch] = useState('');

  const registeredBuyers = users.filter(u => 
    u.role === 'buyer' && 
    (u.fullName.toLowerCase().includes(buyerSearch.toLowerCase()) || 
     u.email.toLowerCase().includes(buyerSearch.toLowerCase()))
  );

  return (
    <div className="admin-buyers-view">
      <div className="view-header-actions">
        <div className="search-input-wrapper">
          <img src="/src/assets/icons/marker.png" alt="" className="search-input-icon-png" />
          <input
            type="text"
            className="form-input search-field"
            placeholder="enter buyer name or email to search"
            value={buyerSearch}
            onChange={(e) => setBuyerSearch(e.target.value)}
          />
        </div>
      </div>

      {registeredBuyers.length > 0 ? (
        <div className="responsive-table-wrapper">
          <table className="custom-dashboard-table">
            <thead>
              <tr>
                <th className="text-dark">Buyer Name</th>
                <th className="text-dark">Email Address</th>
                <th className="text-dark">Joined Date</th>
                <th className="text-dark">Address Location</th>
                <th className="text-dark">Orders Completed</th>
                <th className="text-dark">Total Spend (₹)</th>
              </tr>
            </thead>
            <tbody>
              {registeredBuyers.map(b => {
                const buyerOrders = orders.filter(o => o.buyerName.toLowerCase() === b.fullName.toLowerCase());
                const spentAmount = buyerOrders.reduce((sum, o) => sum + o.total, 0);

                return (
                  <tr key={b.id}>
                    <td>
                      <div className="table-product-cell">
                        <div className="sidebar-avatar" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>
                          {b.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-dark font-semibold">{b.fullName}</div>
                          <div className="text-xs text-muted">ID: {b.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-dark">{b.email}</td>
                    <td className="text-dark">{b.joinedDate || '2026-01-10'}</td>
                    <td className="text-dark truncate" style={{ maxWidth: '200px' }}>{b.location || 'Maharashtra, India'}</td>
                    <td className="text-dark font-bold">{buyerOrders.length}</td>
                    <td className="text-dark font-bold">₹{spentAmount.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state-card">
          <img src="/src/assets/icons/multiply.png" alt="" style={{ width: '48px', height: '48px', marginBottom: '16px' }} />
          <h3 className="empty-state-title text-dark">No buyers found</h3>
          <p className="empty-state-desc text-muted">Try adjusting your search query.</p>
        </div>
      )}
    </div>
  );
}
