import React from 'react';
import { X, Upload } from 'lucide-react';
import './AddProduct.css';

const AddProduct = ({
  formInputs,
  handleInputChange,
  handleImageUpload,
  handleSaveProduct,
  setFormInputs,
  mode,
  onCancel
}) => {
  return (
    <div className="section-card animate-fade-in add-product-page-card">
      <div className="card-section-header">
        <h2>{mode === 'add' ? 'Add New Product Listing' : 'Edit Product Details'}</h2>
        <p style={{ color: '#55625b', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
          {mode === 'add' ? 'Create a new crop listing for the marketplace.' : 'Update details for your crop listing.'}
        </p>
      </div>

      <form onSubmit={handleSaveProduct} className="add-product-form">
        <div className="form-grid-row">
          <div className="form-group">
            <label className="form-label" htmlFor="page-m-name">Product Name</label>
            <input 
              type="text" 
              id="page-m-name"
              name="name" 
              className="form-input" 
              placeholder="Enter Product Name" 
              value={formInputs.name}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-grid-row form-grid-row-2col">
          <div className="form-group">
            <label className="form-label" htmlFor="page-m-category">Category</label>
            <select 
              id="page-m-category"
              name="category" 
              className="form-input"
              value={formInputs.category}
              onChange={handleInputChange}
            >
              <option value="grains">Grains</option>
              <option value="fruits">Fruits & Vegetables</option>
              <option value="dairy">Dairy Products</option>
              <option value="spices">Spices</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="page-m-location">Farm/Location</label>
            <input 
              type="text" 
              id="page-m-location"
              name="location" 
              className="form-input" 
              placeholder="Enter Farm/Location" 
              value={formInputs.location}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-grid-row form-grid-row-2col">
          <div className="form-group">
            <label className="form-label" htmlFor="page-m-price">Price (₹)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="number" 
                id="page-m-price"
                name="priceVal" 
                className="form-input" 
                placeholder="Enter Price" 
                value={formInputs.priceVal}
                onChange={handleInputChange}
                required
                min="0"
              />
              <select 
                name="priceUnit" 
                className="form-input" 
                style={{ width: '110px' }}
                value={formInputs.priceUnit}
                onChange={handleInputChange}
              >
                <option value="Kg">Kg</option>
                <option value="Litre">Litre</option>
                <option value="Bunch">Bunch</option>
                <option value="Gram">Gram</option>
                <option value="Quintal">Quintal</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="page-m-stock">Stock Quantity</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="number" 
                id="page-m-stock"
                name="stockVal" 
                className="form-input" 
                placeholder="Enter Stock Quantity" 
                value={formInputs.stockVal}
                onChange={handleInputChange}
                required
                min="0"
              />
              <select 
                name="stockUnit" 
                className="form-input" 
                style={{ width: '110px' }}
                value={formInputs.stockUnit}
                onChange={handleInputChange}
              >
                <option value="Kg">Kg</option>
                <option value="Litres">Litres</option>
                <option value="Bunches">Bunches</option>
                <option value="Grams">Grams</option>
                <option value="Quintals">Quintals</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-grid-row">
          <div className="form-group">
            <label className="form-label" htmlFor="page-m-image">Product Image (Photo)</label>
            <div className="file-upload-wrapper">
              <Upload size={18} className="upload-icon" />
              <input 
                type="file" 
                id="page-m-image"
                accept="image/*"
                className="form-input-file" 
                onChange={handleImageUpload}
              />
              <span className="file-upload-text">Choose PNG or JPG image</span>
            </div>
            
            {formInputs.image && (
              <div className="product-image-preview-container" style={{ marginTop: '0.75rem', position: 'relative' }}>
                <img 
                  src={formInputs.image} 
                  alt="Crop preview" 
                  style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(82, 183, 136, 0.2)' }} 
                />
                <button 
                  type="button" 
                  onClick={() => setFormInputs(prev => ({ ...prev, image: '' }))}
                  style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: 'rgba(0, 0, 0, 0.6)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="page-m-description">Description</label>
            <textarea 
              id="page-m-description"
              name="description" 
              className="form-input" 
              placeholder="Enter Description" 
              rows="4"
              value={formInputs.description}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="modal-form-actions page-form-actions">
          <button type="button" onClick={onCancel} className="btn-modal-cancel">
            Cancel
          </button>
          <button type="submit" className="btn-modal-save">
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
