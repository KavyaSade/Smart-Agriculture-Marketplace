import React, { useState } from 'react';
import './Products.css';

export default function Products({ products, setProducts, setAlert, onRefresh }) {
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [priceMinFilter, setPriceMinFilter] = useState('');
  const [priceMaxFilter, setPriceMaxFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [deletingProductId, setDeletingProductId] = useState(null);

  const approveProductListing = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAlert({ type: 'error', text: 'Access denied.' });
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setAlert({ type: 'success', text: 'Product listing approved by Administrator!' });
        if (onRefresh) await onRefresh();
      } else {
        const errorData = await response.json();
        setAlert({ type: 'error', text: errorData.message || 'Failed to approve product.' });
      }
    } catch (err) {
      console.error('Error approving product:', err);
      setAlert({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const rejectProductListing = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAlert({ type: 'error', text: 'Access denied.' });
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}/reject`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setAlert({ type: 'success', text: 'Product listing rejected by Administrator.' });
        if (onRefresh) await onRefresh();
      } else {
        const errorData = await response.json();
        setAlert({ type: 'error', text: errorData.message || 'Failed to reject product.' });
      }
    } catch (err) {
      console.error('Error rejecting product:', err);
      setAlert({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const deleteProductListing = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAlert({ type: 'error', text: 'Access denied.' });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/products/${deletingProductId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setAlert({ type: 'success', text: 'Product listing removed by Administrator!' });
        setDeletingProductId(null);
        if (onRefresh) await onRefresh();
      } else {
        const errorData = await response.json();
        setAlert({ type: 'error', text: errorData.message || 'Failed to delete product.' });
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setAlert({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const clearAllFilters = () => {
    setProductSearch('');
    setCategoryFilter('all');
    setLocationFilter('');
    setPriceMinFilter('');
    setPriceMaxFilter('');
    setAvailabilityFilter('all');
  };

  const filteredProducts = products.filter(p => {
    const titleMatches = p.title ? p.title.toLowerCase().includes(productSearch.toLowerCase()) : false;
    const categoryMatches = p.category ? p.category.toLowerCase().includes(productSearch.toLowerCase()) : false;
    const matchesSearch = titleMatches || categoryMatches;
    
    const matchesCategory = categoryFilter === 'all' || (p.category && p.category.toLowerCase() === categoryFilter.toLowerCase());
    const matchesLocation = !locationFilter || (p.location && p.location.toLowerCase().includes(locationFilter.toLowerCase()));
    const matchesPriceMin = !priceMinFilter || p.price >= parseFloat(priceMinFilter);
    const matchesPriceMax = !priceMaxFilter || p.price <= parseFloat(priceMaxFilter);
    
    let matchesAvailability = true;
    if (availabilityFilter === 'instock') {
      matchesAvailability = p.stock > 0;
    } else if (availabilityFilter === 'outofstock') {
      matchesAvailability = p.stock === 0;
    } else if (availabilityFilter === 'lowstock') {
      matchesAvailability = p.stock > 0 && p.stock <= 10;
    }

    return matchesSearch && matchesCategory && matchesLocation && matchesPriceMin && matchesPriceMax && matchesAvailability;
  });

  return (
    <div className="admin-products-view">
      <div className="view-header-actions">
        <div className="search-input-wrapper">
          <img src="/src/assets/icons/marker.png" alt="" className="search-input-icon-png" />
          <input
            type="text"
            className="form-input search-field"
            placeholder="enter product name or category to search"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Admin filter controls row */}
      <div className="filter-controls-row" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: 'var(--card-bg, #ffffff)',
        borderRadius: '12px',
        border: '1px solid var(--border-color, #e2e8f0)'
      }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="text-xs font-bold text-dark mb-1 block">Category</label>
          <select
            className="form-input"
            style={{ padding: '6px 10px', height: '38px' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Fruits">Fruits</option>
            <option value="Grains">Grains</option>
            <option value="Dairy">Dairy</option>
            <option value="Tubers">Tubers</option>
            <option value="Organic Fertilisers">Organic Fertilisers</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="text-xs font-bold text-dark mb-1 block">Location</label>
          <input
            type="text"
            className="form-input"
            style={{ padding: '6px 10px', height: '38px' }}
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="text-xs font-bold text-dark mb-1 block">Min Price (₹)</label>
          <input
            type="number"
            className="form-input"
            style={{ padding: '6px 10px', height: '38px' }}
            placeholder="Min"
            value={priceMinFilter}
            onChange={(e) => setPriceMinFilter(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="text-xs font-bold text-dark mb-1 block">Max Price (₹)</label>
          <input
            type="number"
            className="form-input"
            style={{ padding: '6px 10px', height: '38px' }}
            placeholder="Max"
            value={priceMaxFilter}
            onChange={(e) => setPriceMaxFilter(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="text-xs font-bold text-dark mb-1 block">Availability</label>
          <select
            className="form-input"
            style={{ padding: '6px 10px', height: '38px' }}
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
          >
            <option value="all">All Stock Statuses</option>
            <option value="instock">In Stock</option>
            <option value="lowstock">Low Stock</option>
            <option value="outofstock">Out of Stock</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0, display: 'flex', alignItems: 'flex-end' }}>
          <button 
            type="button" 
            className="btn btn-secondary w-full"
            style={{ height: '38px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={clearAllFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="responsive-table-wrapper">
          <table className="custom-dashboard-table">
            <thead>
              <tr>
                <th className="text-dark">Product ID</th>
                <th className="text-dark">Product Detail</th>
                <th className="text-dark">Category</th>
                <th className="text-dark">Location</th>
                <th className="text-dark">Unit Price</th>
                <th className="text-dark">Stock Level</th>
                <th className="text-dark">Status</th>
                <th className="text-dark">Actions Moderation</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id}>
                  <td className="font-bold text-dark">{p.id}</td>
                  <td>
                    <div className="table-product-cell">
                      <img 
                        src={p.image} 
                        alt={p.title} 
                        className="table-product-thumb" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400';
                        }}
                      />
                      <div>
                        <div className="table-product-name text-dark font-semibold">{p.title}</div>
                        <div className="text-xs text-muted">ID: {p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-dark">{p.category}</td>
                  <td className="text-dark">{p.location || 'N/A'}</td>
                  <td className="text-dark">₹{Number(p.price || 0).toFixed(2)} / {p.unit}</td>
                  <td className="text-dark font-medium">{p.stock} {p.unit}</td>
                  <td>
                    <span className={`order-status-badge status-${p.status || 'approved'}`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                      {(p.status || 'approved').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {(p.status === 'pending' || p.status === 'rejected') && (
                        <button
                          className="action-btn-small success"
                          style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => approveProductListing(p.id)}
                        >
                          Approve
                        </button>
                      )}
                      {(p.status === 'pending' || p.status === 'approved' || !p.status) && (
                        <button
                          className="action-btn-small warning"
                          style={{ backgroundColor: '#f59e0b', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => rejectProductListing(p.id)}
                        >
                          Reject
                        </button>
                      )}
                      <button
                        className="action-btn-small danger"
                        onClick={() => setDeletingProductId(p.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state-card">
          <img src="/src/assets/icons/multiply.png" alt="" style={{ width: '48px', height: '48px', marginBottom: '16px' }} />
          <h3 className="empty-state-title text-dark">No products found</h3>
          <p className="empty-state-desc text-muted">Try adjusting your filters or search terms.</p>
        </div>
      )}

      {deletingProductId && (
        <div className="overlay-dialog-backdrop">
          <div className="dialog-modal-card">
            <h3 className="dialog-title">Moderate Product Removal?</h3>
            <p className="dialog-message text-muted">
              Are you sure you want to remove this listing? This will permanently delete it from the database.
            </p>
            <div className="dialog-actions">
              <button 
                className="dialog-btn cancel" 
                onClick={() => setDeletingProductId(null)}
              >
                Cancel Keep
              </button>
              <button 
                className="dialog-btn danger-confirm" 
                onClick={deleteProductListing}
              >
                Delete Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
