import React, { useState } from 'react';
import './Products.css';

export default function Products({ products, setProducts, setAlert }) {
  const [productSearch, setProductSearch] = useState('');
  const [deletingProductId, setDeletingProductId] = useState(null);

  const deleteProductListing = () => {
    setProducts(products.filter(p => p.id !== deletingProductId));
    setDeletingProductId(null);
    setAlert({ type: 'success', text: 'Product listing removed by Administrator!' });
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="admin-products-view">
      <div className="view-header-actions">
        <div className="search-input-wrapper">
          <img src="/src/assets/icons/marker.png" alt="" className="search-input-icon-png" />
          <input
            type="text"
            className="form-input search-field"
            placeholder="enter product name to search"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
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
                <th className="text-dark">Unit Price</th>
                <th className="text-dark">Stock Level</th>
                <th className="text-dark">Actions Moderation</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id}>
                  <td className="font-bold text-dark">{p.id}</td>
                  <td>
                    <div className="table-product-cell">
                      <img src={p.image} alt={p.title} className="table-product-thumb" />
                      <div>
                        <div className="table-product-name text-dark font-semibold">{p.title}</div>
                        <div className="text-xs text-muted">ID: {p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-dark">{p.category}</td>
                  <td className="text-dark">₹{p.price.toFixed(2)} / {p.unit}</td>
                  <td className="text-dark font-medium">{p.stock} {p.unit}</td>
                  <td>
                    <button
                      className="action-btn-small danger"
                      onClick={() => setDeletingProductId(p.id)}
                    >
                      Delete Item
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
          <h3 className="empty-state-title text-dark">No products found</h3>
          <p className="empty-state-desc text-muted">Try adjusting your search terms.</p>
        </div>
      )}

      {deletingProductId && (
        <div className="overlay-dialog-backdrop">
          <div className="dialog-modal-card">
            <h3 className="dialog-title">Moderate Product Removal?</h3>
            <p className="dialog-message text-muted">
              Are you sure you want to remove this listing? The seller will be notified.
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
