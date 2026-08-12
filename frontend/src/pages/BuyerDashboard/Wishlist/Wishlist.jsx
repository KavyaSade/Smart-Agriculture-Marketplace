import React from 'react';
import { Trash2, ShoppingCart, User, MapPin } from 'lucide-react';
import './Wishlist.css';

const Wishlist = ({
  products,
  wishlist,
  handleToggleWishlist,
  handleAddToCart
}) => {
  const favoritedCrops = products.filter(p => wishlist.includes(p._id || p.id));

  return (
    <div className="section-card animate-fade-in">
      <div className="card-section-header">
        <h2>Your Saved crops</h2>
      </div>

      {favoritedCrops.length === 0 ? (
        <div className="empty-state" style={{ padding: '3rem 1rem' }}>
          <span className="empty-state-text">Your wishlist is currently empty.</span>
          <p style={{ color: '#7c8d84', margin: '0.5rem 0 0 0' }}>Explore organic farm offerings and save items to buy them later.</p>
        </div>
      ) : (
        <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          {favoritedCrops.map(crop => {
            const isOutOfStock = crop.stock <= 0 || !crop.inStock;
            return (
              <div key={crop._id || crop.id} className="product-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>

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
                    onClick={() => handleToggleWishlist(crop._id || crop.id)} 
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
                      transition: 'all 0.2s',
                      color: '#dc2626'
                    }}
                    title="Remove from Saved"
                  >
                    <Trash2 size={16} />
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
      )}
    </div>
  );
};

export default Wishlist;
