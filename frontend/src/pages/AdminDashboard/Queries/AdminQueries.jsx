import React, { useState } from 'react';
import './AdminQueries.css';

export default function AdminQueries({ queries, setAlert, onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Toggle the status of a query between Pending and Resolved
  const toggleQueryStatus = async (queryId, currentStatus) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAlert({ type: 'error', text: 'Access token not found.' });
      return;
    }

    const newStatus = currentStatus === 'Pending' ? 'Resolved' : 'Pending';

    try {
      const response = await fetch(`http://localhost:5000/api/queries/${queryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setAlert({ type: 'success', text: `Query status updated to ${newStatus}.` });
        if (onRefresh) await onRefresh();
      } else {
        const errorData = await response.json();
        setAlert({ type: 'error', text: errorData.message || 'Failed to update query status.' });
      }
    } catch (err) {
      console.error('Error updating query status:', err);
      setAlert({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  // Filter queries based on search and status selects
  const filteredQueries = queries.filter(q => {
    const nameMatches = q.name ? q.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const emailMatches = q.email ? q.email.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const subjectMatches = q.subject ? q.subject.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const messageMatches = q.message ? q.message.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const matchesSearch = nameMatches || emailMatches || subjectMatches || messageMatches;

    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-queries-view">
      <div className="view-header-actions">
        <div className="search-input-wrapper">
          <img src="/src/assets/icons/marker.png" alt="" className="search-input-icon-png" />
          <input
            type="text"
            className="form-input search-field"
            placeholder="enter query name, email, subject, or message"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="order-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {filteredQueries.length > 0 ? (
        <div className="responsive-table-wrapper">
          <table className="custom-dashboard-table">
            <thead>
              <tr>
                <th className="text-dark">Date Submitted</th>
                <th className="text-dark">User Info</th>
                <th className="text-dark">Subject</th>
                <th className="text-dark">Message</th>
                <th className="text-dark">Status</th>
                <th className="text-dark">Action Change</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueries.map(q => (
                <tr key={q._id}>
                  <td className="text-dark">{new Date(q.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="text-dark font-semibold">{q.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>{q.email}</div>
                  </td>
                  <td className="text-dark font-semibold">{q.subject}</td>
                  <td className="text-dark" style={{ maxWidth: '300px', wordBreak: 'break-word' }}>{q.message}</td>
                  <td>
                    <span className={`query-status-badge ${q.status.toLowerCase()}`}>
                      {q.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`action-btn-small ${q.status === 'Pending' ? 'resolve' : 'reopen'}`}
                      onClick={() => toggleQueryStatus(q._id, q.status)}
                    >
                      {q.status === 'Pending' ? 'Resolve' : 'Mark Pending'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state-card">
          <img src="/src/assets/icons/chat.png" alt="" style={{ width: '48px', height: '48px', marginBottom: '16px' }} />
          <h3 className="empty-state-title text-dark">No queries found</h3>
          <p className="empty-state-desc text-muted">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
}
