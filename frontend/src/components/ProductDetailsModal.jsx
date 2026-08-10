import React, { useState, useEffect } from 'react';
import { X, MapPin, User, MessageSquare, Send, Calendar } from 'lucide-react';

export default function ProductDetailsModal({ product, onClose, onOpenFarmer, currentUser }) {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [checkingOrders, setCheckingOrders] = useState(true);

  const productId = product._id || product.id;

  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();

    const checkCanReview = async () => {
      if (!currentUser || (currentUser.role !== 'buyer' && currentUser.role !== 'user')) {
        setCanReview(false);
        setCheckingOrders(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/orders/buyer', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const orders = await res.json();
          const hasDelivered = orders.some(o => 
            (o.productId === productId || (o.productId && o.productId._id === productId)) && 
            o.status === 'delivered'
          );
          setCanReview(hasDelivered);
        }
      } catch (err) {
        console.error('Error checking if user can review:', err);
      } finally {
        setCheckingOrders(false);
      }
    };

    checkCanReview();
  }, [productId, currentUser]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    setSubmitError(null);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating, comment })
      });

      const data = await res.json();

      if (res.ok) {
        setComment('');
        setRating(5);
        // Add new review to list
        setReviews(prev => [data.review, ...prev]);
        // Update product object details locally
        product.averageRating = data.averageRating;
        product.totalReviews = data.totalReviews;
      } else {
        setSubmitError(data.message || 'Failed to submit review.');
      }
    } catch (err) {
      console.error(err);
      setSubmitError('Failed to connect to the server.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (ratingVal, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= ratingVal;
      stars.push(
        <img
          key={i}
          src="/src/assets/icons/star.png"
          alt="star"
          style={{
            width: interactive ? '24px' : '16px',
            height: interactive ? '24px' : '16px',
            cursor: interactive ? 'pointer' : 'default',
            filter: isFilled ? 'none' : 'grayscale(100%) brightness(1.5)',
            opacity: isFilled ? 1 : 0.3,
            transition: 'transform 0.1s, opacity 0.1s'
          }}
          className={interactive ? 'hover:scale-110' : ''}
          onClick={interactive ? () => setRating(i) : undefined}
        />
      );
    }
    return <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>{stars}</div>;
  };

  const isOutOfStock = product.stock <= 0 || !product.inStock;
  const isLowStock = product.stock > 0 && product.stock < 20;

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
      zIndex: 1000,
      padding: '1.5rem',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Left Column: Image and Specs */}
        <div style={{ padding: '2rem', borderRight: '1px solid #f1f5f9' }}>
          <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', height: '260px', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <img 
              src={product.image || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=600'} 
              alt={product.name || product.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <span style={{ position: 'absolute', top: '1rem', left: '1rem', backgroundColor: '#1b4332', color: '#ffffff', padding: '0.35rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {product.category || 'Grains'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: 0 }}>{product.name || product.title}</h2>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>
              ₹{product.price}/{product.priceUnit || 'Kg'}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            {renderStars(Math.round(product.averageRating || 0))}
            <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>
              {product.averageRating ? product.averageRating.toFixed(1) : 'No reviews'} ({product.totalReviews || 0} reviews)
            </span>
          </div>

          <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 1.5rem 0' }}>
            {product.description || 'No additional description provided for this fresh crop listing.'}
          </p>

          <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#334155' }}>
              <User size={18} color="#475569" />
              <span>
                Farmer: <strong 
                  onClick={() => onOpenFarmer(product.farmerEmail)}
                  style={{ color: '#059669', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {product.farmerName || 'Local Farmer'}
                </strong>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#334155' }}>
              <MapPin size={18} color="#475569" />
              <span>Location: <strong>{product.location || 'Unknown'}</strong></span>
            </div>
            <div style={{ marginTop: '0.25rem' }}>
              {isOutOfStock ? (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', background: '#fee2e2', padding: '0.25rem 0.75rem', borderRadius: '6px' }}>
                  OUT OF STOCK
                </span>
              ) : isLowStock ? (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', background: '#fef3c7', padding: '0.25rem 0.75rem', borderRadius: '6px' }}>
                  LOW STOCK ({product.stock} {product.stockUnit || 'Kg'} left)
                </span>
              ) : (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', background: '#d1fae5', padding: '0.25rem 0.75rem', borderRadius: '6px' }}>
                  IN STOCK ({product.stock} {product.stockUnit || 'Kg'})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Reviews & Ratings */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={20} />
              <span>Ratings & Reviews</span>
            </h3>
            <button 
              onClick={onClose} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              className="hover:bg-slate-100 transition-colors"
            >
              <X size={22} />
            </button>
          </div>

          
          <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
            {loadingReviews ? (
              <p style={{ textAlign: 'center', color: '#64748b', margin: '2rem 0' }}>Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
                <MessageSquare size={32} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
                <p style={{ fontWeight: 600, margin: 0 }}>No reviews yet</p>
                <p style={{ fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>Be the first to share your experience with this crop!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.map((rev) => (
                  <div key={rev._id} style={{ borderBottom: '1px solid #f8fafc', paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>{rev.userName}</span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={12} />
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ marginBottom: '0.4rem' }}>
                      {renderStars(rev.rating)}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569', lineHeight: '1.5' }}>
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {checkingOrders ? (
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', textAlign: 'center' }}>
              Checking purchase status...
            </p>
          ) : currentUser && (currentUser.role === 'buyer' || currentUser.role === 'user') ? (
            canReview ? (
              <form onSubmit={handleSubmitReview} style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginTop: 'auto' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>Write a Review</h4>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Your Rating:</span>
                  {renderStars(rating, true)}
                </div>

                {submitError && (
                  <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                    {submitError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    placeholder="Share details of your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{
                      flexGrow: 1,
                      padding: '0.65rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                    className="focus:border-emerald-500 transition-colors"
                    required
                  />
                  <button 
                    type="submit"
                    disabled={submitting}
                    style={{
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '0.65rem 1.25rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 700
                    }}
                    className="hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    {submitting ? '...' : <Send size={16} />}
                  </button>
                </div>
              </form>
            ) : (
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', textAlign: 'center', lineHeight: '1.4' }}>
                You can only rate and review this product once it has been purchased and successfully delivered to you.
              </p>
            )
          ) : (
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', textAlign: 'center', fontStyle: 'italic' }}>
              Only logged-in buyers can write reviews.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
