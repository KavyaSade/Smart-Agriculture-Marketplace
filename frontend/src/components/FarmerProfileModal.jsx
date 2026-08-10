import React, { useState, useEffect } from 'react';
import { X, Star, MapPin, Phone, Mail, Award, Leaf, ShoppingCart } from 'lucide-react';

export default function FarmerProfileModal({ farmerEmail, onClose, handleAddToCart, onProductClick }) {
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFarmerProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/users/farmer/${farmerEmail}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data.farmer);
          setListings(data.listings);
        } else {
          setError('Farmer profile not found.');
        }
      } catch (err) {
        console.error('Error fetching farmer profile:', err);
        setError('Failed to load farmer profile.');
      } finally {
        setLoading(false);
      }
    };

    if (farmerEmail) {
      fetchFarmerProfile();
    }
  }, [farmerEmail]);

  // Helper to render stars
  const renderStars = (ratingVal) => {
    const stars = [];
    const roundedRating = Math.round(ratingVal || 0);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          fill={i <= roundedRating ? '#f59e0b' : 'none'}
          color={i <= roundedRating ? '#f59e0b' : '#cbd5e1'}
        />
      );
    }
    return <div className="flex gap-1 items-center">{stars}</div>;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '1.5rem',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '750px',
        maxHeight: '85vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        padding: '2rem',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          className="hover:bg-slate-100 transition-colors"
        >
          <X size={22} />
        </button>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', margin: '3rem 0' }}>Loading farmer profile...</p>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#ef4444' }}>
            <p style={{ fontWeight: 600 }}>{error}</p>
          </div>
        ) : (
          <div>
            {/* Header info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#d1fae5',
                color: '#065f46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 700,
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                overflow: 'hidden'
              }}>
                {profile.profilePhoto ? (
                  <img src={profile.profilePhoto} alt="Farmer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'F'
                )}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: '#1e293b' }}>
                  {profile.farmName || `${profile.fullName}'s Farm`}
                </h2>
                <p style={{ margin: '0.25rem 0 0.5rem 0', color: '#475569', fontSize: '0.95rem', fontWeight: 600 }}>
                  Farmer: {profile.fullName}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {renderStars(profile.averageRating)}
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                    {profile.averageRating ? profile.averageRating.toFixed(1) : 'No reviews'} ({profile.totalReviews || 0} customer reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Farm Bio & Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2rem', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Leaf size={18} color="#059669" />
                  <span>About the Farm</span>
                </h3>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.875rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {profile.bio || `Welcome to ${profile.farmName || profile.fullName}'s page. We specialize in growing high-quality, sustainable crops.`}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={18} color="#059669" />
                  <span>Farming Details</span>
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
                  <span>Experience: <strong>{profile.experience || 'Not Specified'}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
                  <MapPin size={16} />
                  <span>Location: <strong>{profile.addressCity || 'Coimbatore'}, {profile.addressState || 'Tamil Nadu'}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
                  <Phone size={16} />
                  <span>Contact: <strong>{profile.phone}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
                  <Mail size={16} />
                  <span>Email: <strong>{profile.email}</strong></span>
                </div>
              </div>
            </div>

            {/* Active Crop Listings */}
            <div>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>
                Active Crop Listings ({listings.length})
              </h3>
              {listings.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>No active crop listings currently available.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  {listings.map(crop => (
                    <div 
                      key={crop._id} 
                      style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}
                      className="hover:shadow-md transition-shadow"
                      onClick={() => onProductClick && onProductClick(crop)}
                    >
                      <div style={{ height: '110px', overflow: 'hidden' }}>
                        <img 
                          src={crop.image || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=300'} 
                          alt={crop.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>{crop.name}</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981' }}>
                            ₹{crop.price}/{crop.priceUnit || 'Kg'}
                          </span>
                        </div>
                        {crop.averageRating > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.4rem' }}>
                            {renderStars(crop.averageRating)}
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                              ({crop.totalReviews})
                            </span>
                          </div>
                        )}
                        {handleAddToCart && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); // prevent opening details
                              handleAddToCart(crop);
                            }}
                            disabled={crop.stock <= 0 || !crop.inStock}
                            style={{
                              marginTop: '0.75rem',
                              backgroundColor: '#10b981',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.4rem',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem',
                              width: '100%'
                            }}
                            className="hover:bg-emerald-600 transition-colors disabled:opacity-50"
                          >
                            <ShoppingCart size={12} />
                            <span>Add to Cart</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
