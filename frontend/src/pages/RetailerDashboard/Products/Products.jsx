import React, { useState } from 'react';
import ImageUploader from '../../../components/ImageUploader/ImageUploader';
import './Products.css';

export default function Products({
  products,
  setProducts,
  activeTab,
  setActiveTab,
  editingProduct,
  setEditingProduct,
  deletingProductId,
  setDeletingProductId,
  setAlert,
  onRefresh
}) {
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [priceMinFilter, setPriceMinFilter] = useState('');
  const [priceMaxFilter, setPriceMaxFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [formErrors, setFormErrors] = useState({});

  // state for new product inputs
  const [newProduct, setNewProduct] = useState({
    title: '',
    category: 'Vegetables',
    price: '',
    stock: '',
    unit: 'kg',
    description: '',
    image: '',
    location: ''
  });

  const handleFileChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_size = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          if (isEdit) {
            setEditingProduct(prev => ({ ...prev, image: dataUrl }));
          } else {
            setNewProduct(prev => ({ ...prev, image: dataUrl }));
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // save new product to database
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!newProduct.title.trim()) errors.title = 'Product Title is required';
    if (!newProduct.price || parseFloat(newProduct.price) <= 0) errors.price = 'Please enter a valid price';
    if (!newProduct.stock || parseInt(newProduct.stock) < 0) errors.stock = 'Stock must be 0 or higher';
    if (!newProduct.description.trim()) errors.description = 'Description is required';
    if (!newProduct.location.trim()) errors.location = 'Location is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setAlert({ type: 'error', text: 'You must be logged in.' });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock),
          image: newProduct.image.trim() || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400'
        })
      });

      if (response.ok) {
        setNewProduct({
          title: '',
          category: 'Vegetables',
          price: '',
          stock: '',
          unit: 'kg',
          description: '',
          image: '',
          location: ''
        });
        setFormErrors({});
        setAlert({ type: 'success', text: 'Product added successfully!' });
        if (onRefresh) await onRefresh();
        setActiveTab('products');
      } else {
        const errorData = await response.json();
        setAlert({ type: 'error', text: errorData.message || 'Failed to add product.' });
      }
    } catch (err) {
      console.error('Error adding product:', err);
      setAlert({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  // select product to edit
  const openEditProductView = (product) => {
    setEditingProduct({
      ...product,
      location: product.location || ''
    });
    setActiveTab('edit-product');
  };

  // save product edit changes
  const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!editingProduct.title.trim()) errors.title = 'Product Title is required';
    if (!editingProduct.price || parseFloat(editingProduct.price) <= 0) errors.price = 'Please enter a valid price';
    if (!editingProduct.stock || parseInt(editingProduct.stock) < 0) errors.stock = 'Stock must be 0 or higher';
    if (!editingProduct.description.trim()) errors.description = 'Description is required';
    if (!editingProduct.location.trim()) errors.location = 'Location is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setAlert({ type: 'error', text: 'You must be logged in.' });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editingProduct,
          price: parseFloat(editingProduct.price),
          stock: parseInt(editingProduct.stock)
        })
      });

      if (response.ok) {
        setEditingProduct(null);
        setFormErrors({});
        setAlert({ type: 'success', text: 'Product updated successfully!' });
        if (onRefresh) await onRefresh();
        setActiveTab('products');
      } else {
        const errorData = await response.json();
        setAlert({ type: 'error', text: errorData.message || 'Failed to update product.' });
      }
    } catch (err) {
      console.error('Error updating product:', err);
      setAlert({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  // delete product from database
  const executeProductDelete = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAlert({ type: 'error', text: 'You must be logged in.' });
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
        setDeletingProductId(null);
        setAlert({ type: 'success', text: 'Product deleted successfully!' });
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

  // filter products by search, category, location, price, and availability
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category.toLowerCase() === categoryFilter.toLowerCase();
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

  const clearAllFilters = () => {
    setProductSearch('');
    setCategoryFilter('all');
    setLocationFilter('');
    setPriceMinFilter('');
    setPriceMaxFilter('');
    setAvailabilityFilter('all');
  };

  return (
    <>
      {/* my products list */}
      {activeTab === 'products' && (
        <div className="products-view">
          {/* Header search bar */}
          <div className="view-header-actions">
            <div className="search-input-wrapper">
              <img src="/src/assets/icons/marker.png" alt="" className="search-input-icon-png text-muted" />
              <input
                type="text"
                className="form-input search-field"
                placeholder="Search by title..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>
            <button className="add-new-btn" onClick={() => setActiveTab('add-product')}>
              <span style={{ marginRight: '4px', fontWeight: 'bold', fontSize: '1.1rem' }}>+</span>
              <span>Add Product</span>
            </button>
          </div>

          {/* Filter Bar */}
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
                    <th className="text-dark">Product</th>
                    <th className="text-dark">Category</th>
                    <th className="text-dark">Location</th>
                    <th className="text-dark">Price</th>
                    <th className="text-dark">Stock Level</th>
                    <th className="text-dark">Status</th>
                    <th className="text-dark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => {
                    let stockStatus = 'instock';
                    if (p.stock === 0) stockStatus = 'outofstock';
                    else if (p.stock <= 10) stockStatus = 'lowstock';

                    return (
                      <tr key={p.id}>
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
                              <div className="table-product-name text-dark">{p.title}</div>
                              <div className="text-xs text-muted">ID: {p.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-dark">{p.category}</td>
                        <td className="text-dark">{p.location || 'N/A'}</td>
                        <td className="text-dark">₹{Number(p.price || 0).toFixed(2)} / {p.unit}</td>
                        <td className="text-dark">{p.stock} {p.unit}</td>
                        <td>
                          <span className={`status-pill ${stockStatus}`}>
                            {stockStatus === 'instock' && 'In Stock'}
                            {stockStatus === 'lowstock' && 'Low Stock'}
                            {stockStatus === 'outofstock' && 'Out of Stock'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons-cell">
                            <button 
                              className="action-icon-btn edit" 
                              onClick={() => openEditProductView(p)}
                              title="Edit Product"
                            >
                              <img src="/src/assets/icons/edit.png" alt="" className="action-btn-png" />
                            </button>
                            <button 
                              className="action-icon-btn delete" 
                              onClick={() => setDeletingProductId(p.id)}
                              title="Delete Product"
                            >
                              <img src="/src/assets/icons/delete.png" alt="" className="action-btn-png" />
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
            <div className="empty-state-card">
              <img src="/src/assets/icons/delete.png" alt="" style={{ width: '48px', height: '48px', marginBottom: '16px' }} />
              <h3 className="empty-state-title text-dark">No products found</h3>
              <p className="empty-state-desc text-muted">
                No products match your filters. Try adjusting your search criteria.
              </p>
              <button className="btn btn-secondary" onClick={clearAllFilters}>
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* add product form */}
      {activeTab === 'add-product' && (
        <div className="add-product-view dashboard-card">
          <form onSubmit={handleAddProductSubmit}>
            <div className="form-grid-layout">
              <div className="form-group">
                <label className="form-label text-dark">Product Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="enter the product name"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                />
                {formErrors.title && <span className="input-feedback-error">{formErrors.title}</span>}
              </div>

              <div className="form-group">
                <label className="form-label text-dark">Category *</label>
                <select
                  className="form-input"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Grains">Grains</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Tubers">Tubers</option>
                  <option value="Organic Fertilisers">Organic Fertilisers</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label text-dark">Price per Unit (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="enter the product price"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
                {formErrors.price && <span className="input-feedback-error">{formErrors.price}</span>}
              </div>

              <div className="form-group">
                <label className="form-label text-dark">Stock Quantity *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="enter the product stock"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                />
                {formErrors.stock && <span className="input-feedback-error">{newProduct.stock}</span>}
              </div>

              <div className="form-group">
                <label className="form-label text-dark">Unit of Measure</label>
                <select
                  className="form-input"
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                >
                  <option value="kg">kilogram (kg)</option>
                  <option value="liter">liter (l)</option>
                  <option value="pieces">piece (pcs)</option>
                  <option value="bag">bag</option>
                  <option value="bunch">bunch</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label text-dark">Location *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="enter farm location (e.g. Nellore, Andhra Pradesh)"
                  value={newProduct.location}
                  onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
                />
                {formErrors.location && <span className="input-feedback-error">{formErrors.location}</span>}
              </div>

              <div className="form-group">
                <ImageUploader
                  image={newProduct.image}
                  onImageChange={(dataUrl) => setNewProduct({ ...newProduct, image: dataUrl })}
                  label="Upload Product Photo *"
                />
              </div>

              <div className="form-group form-group-full">
                <label className="form-label text-dark">Detailed Description *</label>
                <textarea
                  rows="4"
                  className="form-input textarea-field"
                  placeholder="enter the product description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
                {formErrors.description && <span className="input-feedback-error">{formErrors.description}</span>}
              </div>
            </div>

            <div className="form-actions-bar">
              <button 
                type="button" 
                className="cancel-action-btn" 
                onClick={() => {
                  setNewProduct({ title: '', category: 'Vegetables', price: '', stock: '', unit: 'kg', description: '', image: '', location: '' });
                  setFormErrors({});
                  setActiveTab('products');
                }}
              >
                Cancel
              </button>
              <button type="submit" className="submit-action-btn">
                Create Listing
              </button>
            </div>
          </form>
        </div>
      )}

      {/* edit product form */}
      {activeTab === 'edit-product' && editingProduct && (
        <div className="edit-product-view dashboard-card">
          <form onSubmit={handleEditProductSubmit}>
            <div className="form-grid-layout">
              <div className="form-group">
                <label className="form-label text-dark">Product Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="enter the product name"
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                />
                {formErrors.title && <span className="input-feedback-error">{formErrors.title}</span>}
              </div>

              <div className="form-group">
                <label className="form-label text-dark">Category *</label>
                <select
                  className="form-input"
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Grains">Grains</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Tubers">Tubers</option>
                  <option value="Organic Fertilisers">Organic Fertilisers</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label text-dark">Price per Unit (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="enter the product price"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                />
                {formErrors.price && <span className="input-feedback-error">{formErrors.price}</span>}
              </div>

              <div className="form-group">
                <label className="form-label text-dark">Stock Quantity *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="enter the product stock"
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                />
                {formErrors.stock && <span className="input-feedback-error">{formErrors.stock}</span>}
              </div>

              <div className="form-group">
                <label className="form-label text-dark">Unit of Measure</label>
                <select
                  className="form-input"
                  value={editingProduct.unit}
                  onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                >
                  <option value="kg">kilogram (kg)</option>
                  <option value="liter">liter (l)</option>
                  <option value="pieces">piece (pcs)</option>
                  <option value="bag">bag</option>
                  <option value="bunch">bunch</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label text-dark">Location *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="enter farm location (e.g. Nellore, Andhra Pradesh)"
                  value={editingProduct.location}
                  onChange={(e) => setEditingProduct({ ...editingProduct, location: e.target.value })}
                />
                {formErrors.location && <span className="input-feedback-error">{formErrors.location}</span>}
              </div>

              <div className="form-group">
                <ImageUploader
                  image={editingProduct.image}
                  onImageChange={(dataUrl) => setEditingProduct({ ...editingProduct, image: dataUrl })}
                  label="Upload Product Photo"
                />
              </div>

              <div className="form-group form-group-full">
                <label className="form-label text-dark">Detailed Description *</label>
                <textarea
                  rows="4"
                  className="form-input textarea-field"
                  placeholder="enter the product description"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                />
                {formErrors.description && <span className="input-feedback-error">{formErrors.description}</span>}
              </div>
            </div>

            <div className="form-actions-bar">
              <button 
                type="button" 
                className="cancel-action-btn" 
                onClick={() => {
                  setEditingProduct(null);
                  setFormErrors({});
                  setActiveTab('products');
                }}
              >
                Cancel
              </button>
              <button type="submit" className="submit-action-btn">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* product delete modal */}
      {deletingProductId && (
        <div className="overlay-dialog-backdrop">
          <div className="dialog-modal-card">
            <h3 className="dialog-title">Delete Product Listing?</h3>
            <p className="dialog-message text-muted">
              Are you sure you want to delete this product? You cannot get it back.
            </p>
            <div className="dialog-actions">
              <button 
                className="dialog-btn cancel" 
                onClick={() => setDeletingProductId(null)}
              >
                Keep Listing
              </button>
              <button 
                className="dialog-btn danger-confirm" 
                onClick={() => {
                  executeProductDelete();
                  setActiveTab('products');
                }}
              >
                Delete Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
