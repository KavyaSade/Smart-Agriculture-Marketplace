import React, { useState, useEffect } from 'react';
import './AdminCoupons.css';

export default function AdminCoupons({ setAlert }) {
  const showAlert = (alertObj) => {
    if (setAlert && typeof setAlert === 'function') {
      setAlert(alertObj);
    } else {
      alert(`${alertObj.type === 'success' ? '✓' : '✕'} ${alertObj.text}`);
    }
  };

  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [filter, setFilter] = useState('all'); // all, active, expired, upcoming, disabled
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [selectedUsage, setSelectedUsage] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minimumOrderAmount: '',
    maximumDiscountAmount: '',
    startDate: '',
    expiryDate: '',
    usageLimit: '',
    perUserLimit: '1',
    applicableProducts: [],
    applicableCategories: [],
    applicableFarmers: [],
    isActive: true
  });

  const categories = ['grains', 'fruits', 'vegetables', 'dairy', 'leafy-greens', 'spices'];

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/coupons', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    }
  };

  const fetchProductsAndFarmers = async () => {
    try {
      const token = localStorage.getItem('token');
      const prodRes = await fetch('http://localhost:5000/api/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }

      const usersRes = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const sellerRoles = usersData.filter(u => u.role === 'farmer' || u.role === 'retailer');
        setFarmers(sellerRoles);
      }
    } catch (err) {
      console.error('Error fetching dependencies:', err);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchProductsAndFarmers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMultiSelectChange = (name, id) => {
    setFormData(prev => {
      const currentList = prev[name] || [];
      const updatedList = currentList.includes(id)
        ? currentList.filter(item => item !== id)
        : [...currentList, id];
      return { ...prev, [name]: updatedList };
    });
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showAlert({ type: 'success', text: 'Coupon created successfully!' });
        setShowCreateModal(false);
        resetForm();
        fetchCoupons();
      } else {
        const errorData = await res.json();
        showAlert({ type: 'error', text: errorData.message || 'Failed to create coupon.' });
      }
    } catch (err) {
      console.error('Error creating coupon:', err);
      setAlert({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const handleEditCoupon = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/coupons/${selectedCoupon._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showAlert({ type: 'success', text: 'Coupon updated successfully!' });
        setShowEditModal(false);
        setSelectedCoupon(null);
        resetForm();
        fetchCoupons();
      } else {
        const errorData = await res.json();
        showAlert({ type: 'error', text: errorData.message || 'Failed to update coupon.' });
      }
    } catch (err) {
      console.error('Error updating coupon:', err);
      setAlert({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        showAlert({ type: 'success', text: 'Coupon deleted successfully.' });
        fetchCoupons();
      } else {
        showAlert({ type: 'error', text: 'Failed to delete coupon.' });
      }
    } catch (err) {
      console.error('Error deleting coupon:', err);
    }
  };

  const toggleCouponStatus = async (coupon) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/coupons/${coupon._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !coupon.isActive })
      });

      if (res.ok) {
        showAlert({ type: 'success', text: `Coupon ${coupon.isActive ? 'deactivated' : 'activated'} successfully!` });
        fetchCoupons();
      } else {
        showAlert({ type: 'error', text: 'Failed to update coupon status.' });
      }
    } catch (err) {
      console.error('Error toggling coupon status:', err);
    }
  };

  const handleOpenEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minimumOrderAmount: coupon.minimumOrderAmount,
      maximumDiscountAmount: coupon.maximumDiscountAmount,
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit || '',
      perUserLimit: coupon.perUserLimit,
      applicableProducts: coupon.applicableProducts.map(p => p._id || p),
      applicableCategories: coupon.applicableCategories,
      applicableFarmers: coupon.applicableFarmers.map(f => f._id || f),
      isActive: coupon.isActive
    });
    setShowEditModal(true);
  };

  const handleOpenUsage = async (coupon) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/coupons/analytics/usage', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const couponUsage = data.coupons.find(c => c.code === coupon.code) || {
          code: coupon.code,
          usageCount: 0,
          totalDiscount: 0,
          totalSales: 0,
          orders: []
        };
        setSelectedUsage(couponUsage);
        setShowUsageModal(true);
      }
    } catch (err) {
      console.error('Error fetching usage data:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minimumOrderAmount: '',
      maximumDiscountAmount: '',
      startDate: '',
      expiryDate: '',
      usageLimit: '',
      perUserLimit: '1',
      applicableProducts: [],
      applicableCategories: [],
      applicableFarmers: [],
      isActive: true
    });
  };

  const getStatus = (coupon) => {
    if (!coupon.isActive) return 'disabled';
    const now = new Date();
    if (coupon.startDate && now < new Date(coupon.startDate)) return 'upcoming';
    if (coupon.expiryDate && now > new Date(coupon.expiryDate)) return 'expired';
    return 'active';
  };

  const filteredCoupons = coupons.filter(c => {
    const codeMatches = c.code.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatches = c.description ? c.description.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const matchesSearch = codeMatches || descMatches;

    const status = getStatus(c);
    if (filter === 'active') return matchesSearch && status === 'active';
    if (filter === 'expired') return matchesSearch && status === 'expired';
    if (filter === 'upcoming') return matchesSearch && status === 'upcoming';
    if (filter === 'disabled') return matchesSearch && status === 'disabled';
    return matchesSearch;
  });

  return (
    <div className="admin-coupons-view">
      <div className="view-header-actions">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="form-input search-field"
            placeholder="Search by code or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="order-status-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="upcoming">Upcoming</option>
            <option value="disabled">Disabled</option>
          </select>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowCreateModal(true); }}>
            + Create Coupon
          </button>
        </div>
      </div>

      {filteredCoupons.length > 0 ? (
        <div className="responsive-table-wrapper">
          <table className="custom-dashboard-table">
            <thead>
              <tr>
                <th className="text-dark">Coupon Code</th>
                <th className="text-dark">Discount Details</th>
                <th className="text-dark">Targeting / Scope</th>
                <th className="text-dark">Usage Progress</th>
                <th className="text-dark">Valid Range</th>
                <th className="text-dark">Status</th>
                <th className="text-dark text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map(c => {
                const status = getStatus(c);
                return (
                  <tr key={c._id}>
                    <td>
                      <span className="coupon-code-badge">{c.code}</span>
                      <div className="coupon-desc-small text-muted">{c.description || 'No description'}</div>
                    </td>
                    <td>
                      <strong>
                        {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${(c.discountValue || 0).toLocaleString()} OFF`}
                      </strong>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Min Order: ₹{(c.minimumOrderAmount || 0).toLocaleString()}
                        {c.maximumDiscountAmount > 0 && ` • Max Cap: ₹${c.maximumDiscountAmount}`}
                      </div>
                    </td>
                    <td>
                      <div className="targeting-summary">
                        {c.applicableProducts?.length > 0 && (
                          <div className="target-tag">Products ({c.applicableProducts.length})</div>
                        )}
                        {c.applicableCategories?.length > 0 && (
                          <div className="target-tag">Categories ({c.applicableCategories.length})</div>
                        )}
                        {c.applicableFarmers?.length > 0 && (
                          <div className="target-tag">Farmers ({c.applicableFarmers.length})</div>
                        )}
                        {!c.applicableProducts?.length && !c.applicableCategories?.length && !c.applicableFarmers?.length && (
                          <span className="global-badge">Global (All Products)</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-dark">
                          {c.usedCount} / {c.usageLimit !== null ? c.usageLimit : '∞'} used
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          Limit: {c.perUserLimit} per buyer
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="valid-range-cell">
                        <div>Start: {c.startDate ? new Date(c.startDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A'}</div>
                        <div>End: {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A'}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill badge-${status}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        <button className="table-action-icon-btn btn-view" onClick={() => handleOpenUsage(c)} title="View Performance">
                          <img src="/src/assets/icons/graph.png" alt="Usage" className="table-action-img" />
                        </button>
                        <button className="table-action-icon-btn btn-edit" onClick={() => handleOpenEdit(c)} title="Edit Coupon">
                          <img src="/src/assets/icons/edit.png" alt="Edit" className="table-action-img" />
                        </button>
                        <button className="table-action-icon-btn btn-toggle" onClick={() => toggleCouponStatus(c)} title={c.isActive ? 'Deactivate' : 'Activate'}>
                          <img src="/src/assets/icons/shield.png" alt="Toggle" className="table-action-img" style={{ filter: c.isActive ? 'none' : 'grayscale(100%)' }} />
                        </button>
                        <button className="table-action-icon-btn btn-delete" onClick={() => handleDeleteCoupon(c._id)} title="Delete Coupon">
                          <img src="/src/assets/icons/trash.png" alt="Delete" className="table-action-img" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state" style={{ padding: '3rem 1rem' }}>
          <span className="empty-state-text">No coupons found matching your search.</span>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="modal-overlay-custom">
          <div className="modal-card-custom animate-fade-in">
            <div className="modal-header-custom">
              <h3>Create Coupon</h3>
              <button onClick={() => setShowCreateModal(false)} className="close-btn-custom">✕</button>
            </div>
            <form onSubmit={handleCreateCoupon} className="modal-form-custom">
              <div className="form-grid-custom">
                <div className="form-group">
                  <label>Coupon Code *</label>
                  <input type="text" name="code" value={formData.code} onChange={handleInputChange} required placeholder="Enter Coupon Code" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input type="text" name="description" value={formData.description} onChange={handleInputChange} placeholder="Enter Description" />
                </div>
                <div className="form-group">
                  <label>Discount Type</label>
                  <select name="discountType" value={formData.discountType} onChange={handleInputChange}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Discount Value *</label>
                  <input type="number" name="discountValue" value={formData.discountValue} onChange={handleInputChange} required placeholder="Enter Discount Value" />
                </div>
                <div className="form-group">
                  <label>Minimum Order Amount (₹)</label>
                  <input type="number" name="minimumOrderAmount" value={formData.minimumOrderAmount} onChange={handleInputChange} placeholder="Enter Minimum Order Amount" />
                </div>
                <div className="form-group">
                  <label>Maximum Discount Cap (₹)</label>
                  <input type="number" name="maximumDiscountAmount" value={formData.maximumDiscountAmount} onChange={handleInputChange} placeholder="Enter Maximum Discount Cap" />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Total Usage Limit</label>
                  <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleInputChange} placeholder="Enter Total Usage Limit (Blank for Unlimited)" />
                </div>
                <div className="form-group">
                  <label>Per User Usage Limit</label>
                  <input type="number" name="perUserLimit" value={formData.perUserLimit} onChange={handleInputChange} placeholder="Enter Per User Usage Limit" />
                </div>
              </div>

              {/* TARGETING CRITERIA */}
              <div className="targeting-selectors-group">
                <h4>Targeting Rules (Optional: Leave empty for Global Coupon)</h4>
                
                <div className="targeting-flex">
                  <div className="selector-box">
                    <h5>Restrict to Categories</h5>
                    <div className="checkbox-list">
                      {categories.map(cat => (
                        <label key={cat} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.applicableCategories.includes(cat)}
                            onChange={() => handleMultiSelectChange('applicableCategories', cat)}
                          />
                          <span>{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="selector-box">
                    <h5>Restrict to Products</h5>
                    <div className="checkbox-list select-list">
                      {products.map(p => (
                        <label key={p._id} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.applicableProducts.includes(p._id)}
                            onChange={() => handleMultiSelectChange('applicableProducts', p._id)}
                          />
                          <span>{p.name || p.title} (₹{p.price})</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="selector-box">
                    <h5>Restrict to Farmers</h5>
                    <div className="checkbox-list select-list">
                      {farmers.map(f => (
                        <label key={f._id} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.applicableFarmers.includes(f._id)}
                            onChange={() => handleMultiSelectChange('applicableFarmers', f._id)}
                          />
                          <span>{f.fullName} ({f.email})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions-custom">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="modal-overlay-custom">
          <div className="modal-card-custom animate-fade-in">
            <div className="modal-header-custom">
              <h3>Edit Coupon ({selectedCoupon?.code})</h3>
              <button onClick={() => setShowEditModal(false)} className="close-btn-custom">✕</button>
            </div>
            <form onSubmit={handleEditCoupon} className="modal-form-custom">
              <div className="form-grid-custom">
                <div className="form-group">
                  <label>Coupon Code (Read-Only)</label>
                  <input type="text" name="code" value={formData.code} disabled />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input type="text" name="description" value={formData.description} onChange={handleInputChange} placeholder="Enter Description" />
                </div>
                <div className="form-group">
                  <label>Discount Type</label>
                  <select name="discountType" value={formData.discountType} onChange={handleInputChange}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Discount Value *</label>
                  <input type="number" name="discountValue" value={formData.discountValue} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Minimum Order Amount (₹)</label>
                  <input type="number" name="minimumOrderAmount" value={formData.minimumOrderAmount} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Maximum Discount Cap (₹)</label>
                  <input type="number" name="maximumDiscountAmount" value={formData.maximumDiscountAmount} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Total Usage Limit</label>
                  <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleInputChange} placeholder="Blank for Unlimited" />
                </div>
                <div className="form-group">
                  <label>Per User Usage Limit</label>
                  <input type="number" name="perUserLimit" value={formData.perUserLimit} onChange={handleInputChange} />
                </div>
              </div>

              {/* TARGETING CRITERIA */}
              <div className="targeting-selectors-group">
                <h4>Targeting Rules (Optional: Leave empty for Global Coupon)</h4>
                
                <div className="targeting-flex">
                  <div className="selector-box">
                    <h5>Restrict to Categories</h5>
                    <div className="checkbox-list">
                      {categories.map(cat => (
                        <label key={cat} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.applicableCategories.includes(cat)}
                            onChange={() => handleMultiSelectChange('applicableCategories', cat)}
                          />
                          <span>{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="selector-box">
                    <h5>Restrict to Products</h5>
                    <div className="checkbox-list select-list">
                      {products.map(p => (
                        <label key={p._id} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.applicableProducts.includes(p._id)}
                            onChange={() => handleMultiSelectChange('applicableProducts', p._id)}
                          />
                          <span>{p.name || p.title} (₹{p.price})</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="selector-box">
                    <h5>Restrict to Farmers</h5>
                    <div className="checkbox-list select-list">
                      {farmers.map(f => (
                        <label key={f._id} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.applicableFarmers.includes(f._id)}
                            onChange={() => handleMultiSelectChange('applicableFarmers', f._id)}
                          />
                          <span>{f.fullName} ({f.email})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions-custom">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PERFORMANCE MODAL */}
      {showUsageModal && selectedUsage && (
        <div className="modal-overlay-custom">
          <div className="modal-card-custom usage animate-fade-in">
            <div className="modal-header-custom">
              <h3>Coupon Usage Performance ({selectedUsage.code})</h3>
              <button onClick={() => setShowUsageModal(false)} className="close-btn-custom">✕</button>
            </div>
            
            <div className="usage-stats-grid">
              <div className="usage-stat-card">
                <span className="stat-label">Total Applied Uses</span>
                <span className="stat-value">{selectedUsage.usageCount}</span>
              </div>
              <div className="usage-stat-card">
                <span className="stat-label">Total Sales Generated</span>
                <span className="stat-value">₹{(selectedUsage.totalSales || 0).toLocaleString()}</span>
              </div>
              <div className="usage-stat-card">
                <span className="stat-label">Total Discounts Given</span>
                <span className="stat-value">₹{(selectedUsage.totalDiscount || 0).toLocaleString()}</span>
              </div>
            </div>

            <h4 style={{ margin: '1.5rem 0 0.75rem 0', color: '#1b4332' }}>Applied Orders List</h4>
            {selectedUsage.orders?.length > 0 ? (
              <div className="responsive-table-wrapper" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                <table className="custom-dashboard-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Buyer</th>
                      <th>Product</th>
                      <th>Orig. Amount</th>
                      <th>Discount</th>
                      <th>Paid Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUsage.orders.map(o => (
                      <tr key={o.orderId}>
                        <td><strong>{o.orderId}</strong></td>
                        <td>
                          <div>{o.buyerName}</div>
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>{o.buyerEmail}</div>
                        </td>
                        <td>{o.productName}</td>
                        <td>₹{o.originalAmount}</td>
                        <td style={{ color: '#dc2626', fontWeight: 600 }}>-₹{o.discountAmount}</td>
                        <td style={{ color: '#40916c', fontWeight: 700 }}>₹{o.finalAmount}</td>
                        <td>{o.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-muted" style={{ padding: '1rem 0' }}>This coupon hasn't been applied to any completed orders yet.</div>
            )}

            <div className="modal-actions-custom">
              <button className="btn btn-primary" onClick={() => setShowUsageModal(false)}>Close View</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
