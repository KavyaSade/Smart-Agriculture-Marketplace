import React from 'react';
import { Search, Heart, MapPin, User, ShoppingCart } from 'lucide-react';
import './Browse.css';

const Browse = ({
  products,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  handleAddToCart,
  wishlist,
  handleToggleWishlist
}) => {

  const filteredProducts = products.filter(prod => {
    const matchesSearch = 
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.farmer && prod.farmer.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || prod.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="section-card animate-fade-in">
      <div className="card-section-header">
        <h2>Browse Fresh Produce</h2>
        <p style={{ color: '#55625b', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
          Explore seasonal crops directly from validated local farm inventories.
        </p>
      </div>

      <div className="inventory-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', margin: '1.5rem 0', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="search-box-wrapper" style={{ flex: '1 1 300px' }}>
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search crops, farmers or locations..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-quick-filters" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'grains', 'fruits', 'dairy', 'spices'].map(cat => (
            <button 
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
              style={{ textTransform: 'capitalize' }}
            >
              {cat === 'fruits' ? 'Fruits & Veg' : cat}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filteredProducts.map(crop => {
            const isFavorited = wishlist.includes(crop.id);
            const isOutOfStock = crop.stock <= 0 || !crop.inStock;
            const isLowStock = crop.stock > 0 && crop.stock < 20;

            return (
              <div key={crop.id} className="product-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>

                <div className="product-card-image-wrapper" style={{ height: '180px', position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
                  <img 
                    src={crop.image || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=400'} 
                    alt={crop.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span className="product-card-category" style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', backgroundColor: 'rgba(27, 67, 50, 0.85)', color: '#ffffff', padding: '0.25rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    {crop.category}
                  </span>

                  <button 
                    onClick={() => handleToggleWishlist(crop.id)} 
                    className={`wishlist-toggle-btn ${isFavorited ? 'active' : ''}`}
                    style={{
                      position: 'absolute', 
                      top: '0.75rem', 
                      right: '0.75rem', 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      border: 'none', 
                      borderRadius: '50%', 
                      width: '32px', 
                      height: '32px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer', 
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Heart size={16} fill={isFavorited ? '#dc2626' : 'none'} color={isFavorited ? '#dc2626' : '#64748b'} />
                  </button>
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
                      <span>Farmer: <strong>{crop.farmer || 'Local Farmer'}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.85rem', color: '#7c8d84' }}>
                      <MapPin size={14} />
                      <span>Location: {crop.location}</span>
                    </div>

                    <div style={{ marginBottom: '0.75rem' }}>
                      {isOutOfStock ? (
                        <span className="stock-alert-badge out-of-stock" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', background: 'rgba(220, 38, 38, 0.08)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          OUT OF STOCK
                        </span>
                      ) : isLowStock ? (
                        <span className="stock-alert-badge low-stock" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', background: 'rgba(217, 119, 6, 0.08)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          LOW STOCK ({crop.stock} {crop.stockUnit} left)
                        </span>
                      ) : (
                        <span className="stock-alert-badge in-stock" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', background: 'rgba(22, 163, 74, 0.08)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          IN STOCK ({crop.stock} {crop.stockUnit})
                        </span>
                      )}
                    </div>

                    <button 
                      onClick={() => handleAddToCart(crop)}
                      disabled={isOutOfStock}
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                    >
                      <ShoppingCart size={16} />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-records-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3>No crops found matching filters</h3>
          <p>Try modifying your search text or selected category filter.</p>
        </div>
      )}
    </div>
  );
};

export default Browse;
