import React, { useState, useEffect } from 'react';
import { MessageSquare, Filter, Calendar, Award } from 'lucide-react';

export default function FarmerReviews({ email }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRating, setFilterRating] = useState('all');
  const [searchCrop, setSearchCrop] = useState('');

  useEffect(() => {
    const fetchFarmerReviews = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/users/farmer/${email}/reviews`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        } else {
          setError('Failed to fetch reviews.');
        }
      } catch (err) {
        console.error('Error fetching farmer reviews:', err);
        setError('Error connecting to the server.');
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchFarmerReviews();
    }
  }, [email]);

  const filteredReviews = reviews.filter((rev) => {
    // Rating filter
    const matchesRating = filterRating === 'all' || rev.rating === parseInt(filterRating);
    
    // Crop search filter
    const productName = rev.product?.name || rev.product?.title || '';
    const matchesCrop = productName.toLowerCase().includes(searchCrop.toLowerCase());

    return matchesRating && matchesCrop;
  });

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const renderStars = (ratingVal, size = 16) => {
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
            width: `${size}px`,
            height: `${size}px`,
            filter: isFilled ? 'none' : 'grayscale(100%) brightness(1.5)',
            opacity: isFilled ? 1 : 0.3
          }}
        />
      );
    }
    return <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>{stars}</div>;
  };

  return (
    <div className="section-card animate-fade-in" style={{ padding: '2rem' }}>
      <div className="card-section-header" style={{ marginBottom: '2rem' }}>
        <h2>Customer Reviews & Ratings</h2>
        <p style={{ color: '#55625b', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
          Monitor your customer satisfaction and quality feedback across your listed crops.
        </p>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b', margin: '3rem 0' }}>Loading reviews...</p>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444', fontWeight: 600 }}>{error}</div>
      ) : (
        <div>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div style={{
              backgroundColor: 'rgba(82, 183, 136, 0.05)',
              border: '1px solid rgba(82, 183, 136, 0.15)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(82, 183, 136, 0.15)',
                color: '#40916c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#7c8d84', display: 'block', fontWeight: 600 }}>Average Farm Rating</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <strong style={{ fontSize: '1.5rem', color: '#1b4332' }}>
                    {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
                  </strong>
                  {renderStars(averageRating, 18)}
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'rgba(82, 183, 136, 0.05)',
              border: '1px solid rgba(82, 183, 136, 0.15)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(82, 183, 136, 0.15)',
                color: '#40916c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MessageSquare size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#7c8d84', display: 'block', fontWeight: 600 }}>Total Reviews</span>
                <strong style={{ fontSize: '1.5rem', color: '#1b4332', display: 'block', marginTop: '0.25rem' }}>
                  {reviews.length} Customer Feedback
                </strong>
              </div>
            </div>
          </div>

          {/* Filtering Controls */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem',
            padding: '1.25rem',
            backgroundColor: '#f8fafc',
            borderRadius: '16px',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexGrow: 1, maxWidth: '350px' }}>
              <Filter size={18} color="#64748b" />
              <input
                type="text"
                placeholder="Search by crop name..."
                value={searchCrop}
                onChange={(e) => setSearchCrop(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 600 }}>Rating Filter:</span>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  fontWeight: 600,
                  color: '#475569'
                }}
              >
                <option value="all">All Stars</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          {filteredReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <MessageSquare size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.3 }} />
              <h3>No reviews found</h3>
              <p>No customer reviews match your current filter settings.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filteredReviews.map((rev) => (
                <div 
                  key={rev._id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}
                  className="hover:shadow-md transition-shadow"
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    marginBottom: '1rem',
                    borderBottom: '1px solid #f1f5f9',
                    paddingBottom: '1rem'
                  }}>
                    {/* Left: Product info */}
                    {rev.product ? (
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <img 
                          src={rev.product.image || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=150'} 
                          alt={rev.product.name} 
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>
                            {rev.product.name || rev.product.title}
                          </h4>
                          <span style={{ fontSize: '0.8rem', color: '#7c8d84', fontWeight: 600 }}>
                            Listed Price: ₹{rev.product.price}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic' }}>Deleted Product Listing</span>
                    )}

                    {/* Right: Date */}
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} />
                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 700 }}>
                      Buyer: {rev.userName}
                    </span>
                    {renderStars(rev.rating)}
                  </div>

                  <p style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    color: '#475569',
                    lineHeight: '1.6',
                    backgroundColor: '#f8fafc',
                    padding: '1rem',
                    borderRadius: '12px',
                    borderLeft: '4px solid #10b981'
                  }}>
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
