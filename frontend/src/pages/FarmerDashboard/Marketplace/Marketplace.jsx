import React from 'react';
import { Search, User, MapPin, Package } from 'lucide-react';
import './Marketplace.css';

const Marketplace = ({
  marketSearchQuery,
  setMarketSearchQuery,
  marketCategoryFilter,
  setMarketCategoryFilter,
  filteredMarketCrops,
  handleSimulatePurchase
}) => {
  return (
    <div className="section-card animate-fade-in">
      <div className="card-section-header">
        <h2>Crop Marketplace Catalog</h2>
        <p style={{ color: '#55625b', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
          Browse agricultural listings from other farmers and simulate orders.
        </p>
      </div>

      <div className="inventory-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', margin: '1.5rem 0', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="search-box-wrapper" style={{ flex: '1 1 300px' }}>
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search crops, farmers or locations..." 
            className="search-input"
            value={marketSearchQuery}
            onChange={(e) => setMarketSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-quick-filters" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'grains', 'fruits', 'dairy', 'spices'].map(cat => (
            <button 
              key={cat}
              onClick={() => setMarketCategoryFilter(cat)}
              className={`filter-btn ${marketCategoryFilter === cat ? 'active' : ''}`}
              style={{ textTransform: 'capitalize' }}
            >
              {cat === 'fruits' ? 'Fruits & Veg' : cat}
            </button>
          ))}
        </div>
      </div>

      {filteredMarketCrops.length > 0 ? (
        <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filteredMarketCrops.map(crop => (
            <div key={crop.id} className="product-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="product-card-image-wrapper" style={{ height: '180px', position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
                <img 
                  src={crop.image} 
                  alt={crop.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span className="product-card-category" style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', backgroundColor: 'rgba(27, 67, 50, 0.85)', color: '#ffffff', padding: '0.25rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  {crop.category}
                </span>
              </div>

              <div className="product-card-body" style={{ padding: '1rem 0 0 0', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1b4332' }} className="welcome-banner-title">{crop.name}</h3>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#40916c' }}>
                    ₹{crop.price}/{crop.priceUnit}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#55625b', margin: '0 0 1rem 0', flexGrow: 1 }} className="welcome-banner-subtitle">
                  {crop.description}
                </p>

                <div style={{ borderTop: '1px solid rgba(82, 183, 136, 0.1)', paddingTop: '0.75rem', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem', fontSize: '0.85rem', color: '#7c8d84' }}>
                    <User size={14} />
                    <span>Farmer: <strong>{crop.farmer}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.85rem', color: '#7c8d84' }}>
                    <MapPin size={14} />
                    <span>Location: {crop.location}</span>
                  </div>

                  <button 
                    onClick={() => handleSimulatePurchase(crop)}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Simulate Purchase
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-records-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Package size={48} style={{ color: '#7c8d84', marginBottom: '1rem' }} />
          <h3>No crops found matching filters</h3>
          <p>Try modifying your search text or selected category filter.</p>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
