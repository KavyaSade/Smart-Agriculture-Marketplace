import React, { useState } from 'react';
import { Search, Heart, MapPin, User, ShoppingCart } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import ProductDetailsModal from '../../../components/ProductDetailsModal';
import FarmerProfileModal from '../../../components/FarmerProfileModal';
import './Browse.css';

const Browse = ({
  products,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  handleAddToCart,
  wishlist,
  handleToggleWishlist,
  cart = [],
  onGoToCart,
  currentUser,
  onStartChat
}) => {
  // Modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedFarmerEmail, setSelectedFarmerEmail] = useState(null);

  // State for filtering by location.
  const [locationFilter, setLocationFilter] = useState('');

  // State for filtering by maximum price.
  const [maxPriceFilter, setMaxPriceFilter] = useState('');

  // State for filtering by availability status.
  const [inStockOnly, setInStockOnly] = useState(false);

  // Filter crops list based on search, category, location, price, and availability.
  const filteredProducts = products.filter(prod => {
    const nameText = prod.name || prod.title || '';
    const locationText = prod.location || '';
    const farmerText = prod.farmerName || prod.farmer || '';

    // Search query matches crop name, farm location, or farmer name.
    const matchesSearch = 
      nameText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      locationText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmerText.toLowerCase().includes(searchQuery.toLowerCase());

    // Match categories (map vegetable/fruit to fruits category).
    const catText = (prod.category || '').toLowerCase();
    const matchesCategory = categoryFilter === 'all' || 
                            catText === categoryFilter.toLowerCase() ||
                            (categoryFilter === 'fruits' && (catText === 'fruits' || catText === 'vegetables' || catText === 'fruit' || catText === 'vegetable'));

    // Filter by location city or state name.
    const matchesLocation = !locationFilter || locationText.toLowerCase().includes(locationFilter.toLowerCase());

    // Filter by maximum price budget.
    const matchesPrice = !maxPriceFilter || prod.price <= parseFloat(maxPriceFilter);

    // Filter by crop in-stock availability status.
    const matchesAvailability = !inStockOnly || (prod.inStock && prod.stock > 0);

    return matchesSearch && matchesCategory && matchesLocation && matchesPrice && matchesAvailability;
  });

  const renderStars = (ratingVal) => {
    const stars = [];
    const rounded = Math.round(ratingVal || 0);
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= rounded;
      stars.push(
        <img 
          key={i} 
          src="/src/assets/icons/star.png" 
          alt="star"
          style={{
            width: '14px',
            height: '14px',
            filter: isFilled ? 'none' : 'grayscale(100%) brightness(1.5)',
            opacity: isFilled ? 1 : 0.3
          }}
        />
      );
    }
    return <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>{stars}</div>;
  };

  return (
    <div className="section-card animate-fade-in">
      <div className="card-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Browse Fresh Produce</h2>
          <p style={{ color: '#55625b', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
            Explore seasonal crops directly from validated local farm inventories.
          </p>
        </div>
        <button 
          onClick={onGoToCart}
          className="btn btn-secondary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative', padding: '0.65rem 1.25rem' }}
        >
          <ShoppingCart size={18} />
          <span>Go to Cart</span>
          {cart.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}>
              {cart.reduce((total, item) => total + item.quantity, 0)}
            </span>
          )}
        </button>
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

      {/* Advanced search and filter controls row */}
      <div className="extra-filters-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', margin: '0.5rem 0 1.5rem 0', alignItems: 'center', padding: '1rem', backgroundColor: 'rgba(82, 183, 136, 0.05)', borderRadius: '12px', border: '1px solid rgba(82, 183, 136, 0.1)' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#1b4332', fontWeight: 600 }}>Location:</span>
          <input 
            type="text" 
            placeholder="Filter by city/state..." 
            style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(82, 183, 136, 0.2)', fontSize: '0.85rem', outline: 'none', backgroundColor: '#ffffff' }}
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#1b4332', fontWeight: 600 }}>Max Price (₹):</span>
          <input 
            type="number" 
            placeholder="Budget limit" 
            style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(82, 183, 136, 0.2)', fontSize: '0.85rem', outline: 'none', width: '110px', backgroundColor: '#ffffff' }}
            value={maxPriceFilter}
            onChange={(e) => setMaxPriceFilter(e.target.value)}
          />
        </div>
        <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', color: '#1b4332', fontWeight: 600, cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#40916c' }}
          />
          <span>In Stock Only</span>
        </label>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filteredProducts.map(crop => {
            const isFavorited = wishlist.includes(crop._id || crop.id);
            const isOutOfStock = crop.stock <= 0 || !crop.inStock;
            const isLowStock = crop.stock > 0 && crop.stock < 20;
            const cropName = crop.name || crop.title || 'Unnamed Crop';
            const cropCategory = crop.category || 'Grains';
            const cropPriceUnit = crop.priceUnit || crop.unit || 'Kg';
            const cropStockUnit = crop.stockUnit || crop.unit || 'Kg';
            const cropFarmerName = crop.farmerName || crop.farmer || 'Local Farmer';

            return (
              <div 
                key={crop._id || crop.id} 
                className="product-card" 
                onClick={() => setSelectedProduct(crop)}
                style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', cursor: 'pointer' }}
              >

                <div className="product-card-image-wrapper" style={{ height: '180px', position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
                  <img 
                    src={crop.image || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=400&fm=png'} 
                    alt={cropName} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span className="product-card-category" style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', backgroundColor: 'rgba(27, 67, 50, 0.85)', color: '#ffffff', padding: '0.25rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    {cropCategory}
                  </span>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleWishlist(crop._id || crop.id);
                    }} 
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1b4332' }} className="welcome-banner-title">{cropName}</h3>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#40916c' }}>
                      ₹{crop.price}/{cropPriceUnit}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    {renderStars(crop.averageRating || 0)}
                    {crop.totalReviews > 0 && (
                      <span style={{ fontSize: '0.75rem', color: '#7c8d84', fontWeight: 600 }}>({crop.totalReviews})</span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#55625b', margin: '0 0 1rem 0', flexGrow: 1 }} className="welcome-banner-subtitle">
                    {crop.description}
                  </p>

                  <div style={{ borderTop: '1px solid rgba(82, 183, 136, 0.1)', paddingTop: '0.75rem', marginTop: 'auto' }}>
                    <div 
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}
                    >
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (crop.farmerEmail) {
                            setSelectedFarmerEmail(crop.farmerEmail);
                          }
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#7c8d84', cursor: 'pointer' }}
                      >
                        <User size={14} />
                        <span>Farmer: <strong style={{ textDecoration: 'underline', color: '#40916c' }}>{cropFarmerName}</strong></span>
                      </div>
                      {crop.seller && onStartChat && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // start chat handler
                            onStartChat({
                              _id: crop.seller,
                              fullName: cropFarmerName,
                              email: crop.farmerEmail
                            });
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#40916c',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          chat
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.85rem', color: '#7c8d84' }}>
                      <MapPin size={14} />
                      <span>Location: {crop.location || 'Unknown Location'}</span>
                    </div>

                    <div style={{ marginBottom: '0.75rem' }}>
                      {isOutOfStock ? (
                        <span className="stock-alert-badge out-of-stock" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', background: 'rgba(220, 38, 38, 0.08)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          OUT OF STOCK
                        </span>
                      ) : isLowStock ? (
                        <span className="stock-alert-badge low-stock" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', background: 'rgba(217, 119, 6, 0.08)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          LOW STOCK ({crop.stock} {cropStockUnit} left)
                        </span>
                      ) : (
                        <span className="stock-alert-badge in-stock" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', background: 'rgba(22, 163, 74, 0.08)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          IN STOCK ({crop.stock} {cropStockUnit})
                        </span>
                      )}
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(crop);
                      }}
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

      {/* Overlays/Modals */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailsModal
            product={selectedProduct}
            currentUser={currentUser}
            onClose={() => setSelectedProduct(null)}
            onOpenFarmer={(email) => {
              setSelectedFarmerEmail(email);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedFarmerEmail && (
          <FarmerProfileModal
            farmerEmail={selectedFarmerEmail}
            onClose={() => setSelectedFarmerEmail(null)}
            handleAddToCart={handleAddToCart}
            onProductClick={(crop) => {
              setSelectedProduct(crop);
              setSelectedFarmerEmail(null);
            }}
            onStartChat={onStartChat}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Browse;
