import React from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import './Products.css';

const Products = ({
  handleOpenAddModal,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  filteredProducts,
  products,
  handleToggleStock,
  handleOpenEditModal,
  handleDeleteProduct
}) => {
  return (
    <div className="section-card">
      <div className="card-section-header">
        <h2>My Crop Inventory</h2>
        <button onClick={handleOpenAddModal} className="btn btn-primary btn-add-product">
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      <div className="products-filter-row">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search listings..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          {['all', 'grains', 'fruits', 'dairy', 'spices'].map(cat => (
            <button 
              key={cat}
              onClick={() => setCategoryFilter(cat)} 
              className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
            >
              {cat === 'all' && 'All'}
              {cat === 'grains' && 'Grains'}
              {cat === 'fruits' && 'Fruits & Veg'}
              {cat === 'dairy' && 'Dairy Products'}
              {cat === 'spices' && 'Spices'}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-text">No crop listings match your search criteria.</span>
          <button onClick={handleOpenAddModal} className="btn btn-secondary">
            <span>Add New Product</span>
          </button>
        </div>
      ) : (
        <div className="dashboard-products-grid">
          {filteredProducts.map((prod, idx) => {
            const originalIndex = products.indexOf(prod);
            return (
              <div key={idx} className="farmer-product-card">
                <div className="product-image-container">
                  <img src={prod.image} alt={prod.name} className="product-img" />
                  <span className="product-category-tag">{prod.category.toUpperCase()}</span>
                </div>
                <div className="product-details-body">
                  <div className="product-title-row">
                    <h3 className="product-name-heading">{prod.name}</h3>
                    <span className="product-farm-loc">{prod.location}</span>
                  </div>
                  <div className="product-price-stock-row">
                    <span className="p-price">₹{prod.price} / {prod.priceUnit}</span>
                    <span className="p-stock">Stock: {prod.stock} {prod.stockUnit}</span>
                  </div>
                  <div className="product-status-row">
                    <span className={`status-badge ${prod.inStock ? 'status-in-stock' : 'status-out-of-stock'}`}>
                      {prod.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <label className="stock-toggle-label">
                      <input 
                        type="checkbox" 
                        className="switch-input" 
                        checked={prod.inStock} 
                        onChange={() => handleToggleStock(originalIndex)}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                  <div className="product-card-actions">
                    <button 
                      onClick={() => handleOpenEditModal(originalIndex)} 
                      className="btn-card-action btn-card-edit"
                    >
                      <Edit size={14} />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(originalIndex)} 
                      className="btn-card-action btn-card-delete"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Products;
