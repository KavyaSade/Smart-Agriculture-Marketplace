import React, { useState } from 'react';
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
  setAlert
}) {
  const [productSearch, setProductSearch] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // state for new product inputs
  const [newProduct, setNewProduct] = useState({
    title: '',
    category: 'Vegetables',
    price: '',
    stock: '',
    unit: 'kg',
    description: '',
    image: ''
  });

  // save new product to list
  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!newProduct.title.trim()) errors.title = 'Product Title is required';
    if (!newProduct.price || parseFloat(newProduct.price) <= 0) errors.price = 'Please enter a valid price';
    if (!newProduct.stock || parseInt(newProduct.stock) < 0) errors.stock = 'Stock must be 0 or higher';
    if (!newProduct.description.trim()) errors.description = 'Description is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const createdProduct = {
      ...newProduct,
      id: `PROD-${Math.floor(100 + Math.random() * 900)}`,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      image: newProduct.image.trim() || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400'
    };

    setProducts([createdProduct, ...products]);
    setNewProduct({
      title: '',
      category: 'Vegetables',
      price: '',
      stock: '',
      unit: 'kg',
      description: '',
      image: ''
    });
    setFormErrors({});
    setAlert({ type: 'success', text: 'Product added successfully!' });
    setActiveTab('products');
  };

  // select product to edit
  const openEditProductView = (product) => {
    setEditingProduct(product);
    setActiveTab('edit-product');
  };

  // save product edit changes
  const handleEditProductSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!editingProduct.title.trim()) errors.title = 'Product Title is required';
    if (!editingProduct.price || parseFloat(editingProduct.price) <= 0) errors.price = 'Please enter a valid price';
    if (!editingProduct.stock || parseInt(editingProduct.stock) < 0) errors.stock = 'Stock must be 0 or higher';
    if (!editingProduct.description.trim()) errors.description = 'Description is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setProducts(products.map(p => p.id === editingProduct.id ? {
      ...editingProduct,
      price: parseFloat(editingProduct.price),
      stock: parseInt(editingProduct.stock)
    } : p));

    setEditingProduct(null);
    setFormErrors({});
    setAlert({ type: 'success', text: 'Product updated successfully!' });
    setActiveTab('products');
  };

  // delete product from inventory list
  const executeProductDelete = () => {
    setProducts(products.filter(p => p.id !== deletingProductId));
    setDeletingProductId(null);
    setAlert({ type: 'success', text: 'Product deleted successfully!' });
  };

  // filter products by search query
  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <>
      {/* my products list */}
      {activeTab === 'products' && (
        <div className="products-view">
          <div className="view-header-actions">
            <div className="search-input-wrapper">
              <img src="/src/assets/icons/marker.png" alt="" className="search-input-icon-png text-muted" />
              <input
                type="text"
                className="form-input search-field"
                placeholder="enter product name to search"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>
            <button className="add-new-btn" onClick={() => setActiveTab('add-product')}>
              <span style={{ marginRight: '4px', fontWeight: 'bold', fontSize: '1.1rem' }}>+</span>
              <span>Add Product</span>
            </button>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="responsive-table-wrapper">
              <table className="custom-dashboard-table">
                <thead>
                  <tr>
                    <th className="text-dark">Product</th>
                    <th className="text-dark">Category</th>
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
                            <img src={p.image} alt={p.title} className="table-product-thumb" />
                            <div>
                              <div className="table-product-name text-dark">{p.title}</div>
                              <div className="text-xs text-muted">ID: {p.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-dark">{p.category}</td>
                        <td className="text-dark">₹{p.price.toFixed(2)} / {p.unit}</td>
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
                {productSearch ? "No products match your search query." : "You have no products. Click add product to start."}
              </p>
              {productSearch && (
                <button className="btn btn-secondary" onClick={() => setProductSearch('')}>
                  Clear Search
                </button>
              )}
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
                {formErrors.stock && <span className="input-feedback-error">{formErrors.stock}</span>}
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
                <label className="form-label text-dark">Image URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="enter the image url"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
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
                  setNewProduct({ title: '', category: 'Vegetables', price: '', stock: '', unit: 'kg', description: '', image: '' });
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
                {formErrors.stock && <span className="input-feedback-error">{editingProduct.stock}</span>}
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
                <label className="form-label text-dark">Image URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="enter the image url"
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
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
