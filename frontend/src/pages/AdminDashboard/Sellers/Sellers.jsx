import React, { useState } from 'react';
import './Sellers.css';

export default function Sellers({ users, setUsers, setAlert }) {
  const [sellerSearch, setSellerSearch] = useState('');

  const toggleVerificationStatus = (sellerId) => {
    setUsers(users.map(u => {
      if (u.id === sellerId) {
        const isVerified = !u.isVerified;
        setAlert({ 
          type: 'success', 
          text: `Retailer ${u.fullName} is now ${isVerified ? 'Verified' : 'Unverified'}!` 
        });
        return { ...u, isVerified };
      }
      return u;
    }));
  };

  const updateCommissionTier = (sellerId, newCommissionRate) => {
    setUsers(users.map(u => {
      if (u.id === sellerId) {
        setAlert({ 
          type: 'success', 
          text: `Commission rate updated to ${newCommissionRate}% for ${u.fullName}!` 
        });
        return { ...u, commissionRate: parseFloat(newCommissionRate) };
      }
      return u;
    }));
  };

  const activeSellers = users.filter(u => 
    u.role === 'retailer' && 
    (u.fullName.toLowerCase().includes(sellerSearch.toLowerCase()) || 
     u.farmName.toLowerCase().includes(sellerSearch.toLowerCase()))
  );

  return (
    <div className="admin-sellers-view">
      <div className="view-header-actions">
        <div className="search-input-wrapper">
          <img src="/src/assets/icons/marker.png" alt="" className="search-input-icon-png" />
          <input
            type="text"
            className="form-input search-field"
            placeholder="enter retailer name or farm name to search"
            value={sellerSearch}
            onChange={(e) => setSellerSearch(e.target.value)}
          />
        </div>
      </div>

      {activeSellers.length > 0 ? (
        <div className="responsive-table-wrapper">
          <table className="custom-dashboard-table">
            <thead>
              <tr>
                <th className="text-dark">Retailer Name</th>
                <th className="text-dark">Farm Name</th>
                <th className="text-dark">Email</th>
                <th className="text-dark">Verification</th>
                <th className="text-dark">Commission Rate</th>
                <th className="text-dark">Verification Toggle</th>
              </tr>
            </thead>
            <tbody>
              {activeSellers.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="table-product-cell">
                      <div className="sidebar-avatar" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>
                        {s.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-dark font-semibold">{s.fullName}</div>
                        <div className="text-xs text-muted">ID: {s.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-dark font-medium">{s.farmName || 'N/A'}</td>
                  <td className="text-dark">{s.email}</td>
                  <td>
                    <span className={`status-pill ${s.isVerified ? 'instock' : 'lowstock'}`}>
                      {s.isVerified ? 'Verified' : 'Pending Review'}
                    </span>
                  </td>
                  <td>
                    <select
                      className="order-status-select"
                      value={s.commissionRate || 5}
                      onChange={(e) => updateCommissionTier(s.id, e.target.value)}
                    >
                      <option value="2">2% (Premium Partner)</option>
                      <option value="5">5% (Standard Tier)</option>
                      <option value="8">8% (New Retailer)</option>
                      <option value="12">12% (Trial Tier)</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className={`action-btn-small ${s.isVerified ? 'danger' : 'success'}`}
                      onClick={() => toggleVerificationStatus(s.id)}
                    >
                      {s.isVerified ? 'Revoke Status' : 'Approve Status'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state-card">
          <img src="/src/assets/icons/multiply.png" alt="" style={{ width: '48px', height: '48px', marginBottom: '16px' }} />
          <h3 className="empty-state-title text-dark">No retailers found</h3>
          <p className="empty-state-desc text-muted">Try adjusting your search query.</p>
        </div>
      )}
    </div>
  );
}
