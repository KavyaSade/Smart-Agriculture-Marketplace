import React, { useState } from 'react';
import './Users.css';

export default function Users({ users, setUsers, setAlert }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const toggleUserStatus = (userId) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'active' ? 'blocked' : 'active';
        setAlert({ type: 'success', text: `User status changed to ${newStatus}!` });
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="admin-users-view">
      <div className="view-header-actions">
        <div className="search-input-wrapper">
          <img src="/src/assets/icons/marker.png" alt="" className="search-input-icon-png" />
          <input
            type="text"
            className="form-input search-field"
            placeholder="enter user name or email to search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="order-status-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="retailer">Retailers</option>
            <option value="buyer">Buyers</option>
            <option value="admin">Administrators</option>
            <option value="user">Users</option>
          </select>
        </div>
      </div>

      {filteredUsers.length > 0 ? (
        <div className="responsive-table-wrapper">
          <table className="custom-dashboard-table">
            <thead>
              <tr>
                <th className="text-dark">User ID</th>
                <th className="text-dark">Full Name</th>
                <th className="text-dark">Email Address</th>
                <th className="text-dark">Role</th>
                <th className="text-dark">Status</th>
                <th className="text-dark">Action Change</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td className="font-bold text-dark">{u.id}</td>
                  <td>
                    <div className="table-product-cell">
                      <div className="sidebar-avatar" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>
                        {u.fullName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-dark font-semibold">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="text-dark">{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.role}`}>
                      {u.role === 'retailer' ? 'Retailer' : u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${u.status === 'active' ? 'instock' : 'outofstock'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`action-btn-small ${u.status === 'active' ? 'danger' : 'success'}`}
                      onClick={() => toggleUserStatus(u.id)}
                    >
                      {u.status === 'active' ? 'Block User' : 'Activate'}
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
          <h3 className="empty-state-title text-dark">No users found</h3>
          <p className="empty-state-desc text-muted">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
}
