import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './payment.css';

export default function PaymentCheckout() {
  const location = useLocation();
  const navigate = useNavigate();

  // read cart and buyer data from router state
  const { cart, address, phone, total } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Coupon states
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [validationSuccess, setValidationSuccess] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [fetchingCoupons, setFetchingCoupons] = useState(false);

  // redirect if checkout state is missing
  useEffect(() => {
    if (!cart || !address || !phone || !total) {
      navigate('/buyer-dashboard');
    }
  }, [cart, address, phone, total, navigate]);

  // dynamically load the razorpay checkout script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  // Fetch active/eligible coupons
  const fetchAvailableCoupons = async () => {
    if (!cart) return;
    setFetchingCoupons(true);
    try {
      const res = await fetch('http://localhost:5000/api/coupons/check-eligibility', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ cart })
      });
      if (res.ok) {
        const data = await res.json();
        setAvailableCoupons(data);
      }
    } catch (err) {
      console.error('Error checking coupon eligibility:', err);
    } finally {
      setFetchingCoupons(false);
    }
  };

  useEffect(() => {
    if (cart) {
      fetchAvailableCoupons();
    }
  }, [cart]);

  const handleApplyCoupon = async (codeToApply) => {
    const targetCode = codeToApply || couponInput;
    if (!targetCode.trim()) return;

    setValidationError('');
    setValidationSuccess('');

    try {
      const res = await fetch('http://localhost:5000/api/coupons/validate', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          code: targetCode.trim(),
          cart
        })
      });
      const data = await res.json();

      if (res.ok) {
        setAppliedCoupon({
          code: data.coupon.code,
          discountAmount: data.discountAmount,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue
        });
        setValidationSuccess('✓ Coupon applied successfully');
        setCouponInput(data.coupon.code);
      } else {
        setValidationError(`✕ ${data.message || 'Invalid coupon code'}`);
      }
    } catch (err) {
      setValidationError('✕ Error validating coupon');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setValidationError('');
    setValidationSuccess('');
  };

  // Re-calculate pricing details
  const subtotal = cart ? cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
  const originalGst = Math.round(subtotal * 0.05);
  const platformFee = subtotal > 0 ? 30 : 0;
  
  // reduce shipping from total passed in state
  const shipping = subtotal > 0 ? (total - subtotal - originalGst - platformFee) : 0;
  
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const newGst = Math.round(discountedSubtotal * 0.05);
  const finalPayableTotal = discountedSubtotal + newGst + shipping + (discountedSubtotal > 0 ? 30 : 0);

  // start the razorpay payment widget flow
  const handleRazorpayPay = async () => {
    setLoading(true);
    try {
      // call backend api to create order
      const res = await fetch('http://localhost:5000/api/payment/create-razorpay-order', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: finalPayableTotal })
      });
      const order = await res.json();

      if (!res.ok) {
        throw new Error(order.message || 'failed to initiate razorpay order');
      }

      // alert if backend environment keys are not configured
      if (order.isDummy) {
        setLoading(false);
        alert('razorpay credentials are not configured. please set them in backend .env file.');
        return;
      }

      // build options for razorpay checkout widget
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummykey',
        amount: order.amount,
        currency: order.currency,
        name: 'agri market',
        description: 'checkout payment',
        order_id: order.id,
        handler: async (response) => {
          setLoading(true);
          try {
            // call backend api to verify signature
            const verifyRes = await fetch('http://localhost:5000/api/payment/verify-razorpay-payment', {
              method: 'POST',
              headers: {
                'content-type': 'application/json',
                'authorization': `bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              const checkoutId = 'CHK-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
              navigate('/payment/success', { 
                state: { 
                  cart, 
                  address, 
                  phone, 
                  total: finalPayableTotal, 
                  checkoutId,
                  couponCode: appliedCoupon ? appliedCoupon.code : null
                } 
              });
            } else {
              navigate('/payment/failure', { state: { message: 'signature verification failed' } });
            }
          } catch (err) {
            navigate('/payment/failure', { state: { message: 'error verifying transaction' } });
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          contact: phone
        },
        theme: {
          color: '#40916c'
        }
      };

      setLoading(false);
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setLoading(false);
      alert(err.message || 'failed to start payment');
    }
  };

  return (
    <div className="payment-layout-container">
      <div className="payment-card-box">
        <h1 className="payment-title text-lowercase">checkout payment</h1>

        <div className="payment-summary">
          <div className="summary-row">
            <span className="text-lowercase">delivery address:</span>
            <span className="text-lowercase">{address}</span>
          </div>
          <div className="summary-row">
            <span className="text-lowercase">phone number:</span>
            <span>{phone}</span>
          </div>
          <div className="summary-row">
            <span className="text-lowercase">total items:</span>
            <span>{cart ? cart.length : 0}</span>
          </div>
          
          <div className="summary-row" style={{ borderTop: '1px solid rgba(82, 183, 136, 0.08)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
            <span className="text-lowercase">subtotal:</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          {discountAmount > 0 && (
            <div className="summary-row" style={{ color: '#dc2626' }}>
              <span className="text-lowercase">coupon discount:</span>
              <span>-₹{discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="summary-row">
            <span className="text-lowercase">gst (5%):</span>
            <span>₹{newGst.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span className="text-lowercase">delivery charges:</span>
            <span>₹{shipping}</span>
          </div>
          <div className="summary-row">
            <span className="text-lowercase">platform fee:</span>
            <span>₹{discountedSubtotal > 0 ? 30 : 0}</span>
          </div>

          <div className="summary-total">
            <span className="text-lowercase">amount to pay:</span>
            <span>₹{finalPayableTotal ? finalPayableTotal.toLocaleString() : 0}</span>
          </div>
        </div>

        {/* COUPON SECTION */}
        <div className="coupon-checkout-section" style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(82, 183, 136, 0.15)', paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1b4332', marginBottom: '0.75rem', textTransform: 'lowercase' }}>apply coupon code</h3>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              style={{
                padding: '0.65rem',
                borderRadius: '8px',
                border: '1px solid rgba(82, 183, 136, 0.2)',
                width: '100%',
                fontSize: '0.85rem',
                textTransform: 'uppercase'
              }}
              placeholder="Enter Coupon Code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              disabled={appliedCoupon !== null}
            />
            {appliedCoupon ? (
              <button
                onClick={handleRemoveCoupon}
                className="submit-payment-btn"
                style={{ width: 'auto', padding: '0.65rem 1rem', background: '#dc2626', borderRadius: '8px' }}
              >
                <span className="text-lowercase">remove</span>
              </button>
            ) : (
              <button
                onClick={() => handleApplyCoupon()}
                className="submit-payment-btn"
                style={{ width: 'auto', padding: '0.65rem 1.25rem', borderRadius: '8px' }}
              >
                <span className="text-lowercase">apply</span>
              </button>
            )}
          </div>

          {validationError && (
            <div style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              {validationError}
            </div>
          )}
          {validationSuccess && (
            <div style={{ color: '#40916c', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              {validationSuccess}
            </div>
          )}

          {/* AVAILABLE COUPONS */}
          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'lowercase' }}>available offers:</h4>
            {fetchingCoupons ? (
              <div style={{ fontSize: '0.8rem', color: '#7c8d84', textTransform: 'lowercase' }}>loading available offers...</div>
            ) : availableCoupons.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {availableCoupons.map(({ coupon, eligible, discountAmount: estDiscount, message }) => (
                  <div
                    key={coupon._id}
                    onClick={() => eligible && !appliedCoupon && handleApplyCoupon(coupon.code)}
                    style={{
                      border: eligible ? '1px dashed #40916c' : '1px solid rgba(82, 183, 136, 0.08)',
                      borderRadius: '8px',
                      padding: '0.65rem',
                      background: eligible ? 'rgba(82, 183, 136, 0.04)' : '#f8fafc',
                      cursor: eligible && !appliedCoupon ? 'pointer' : 'default',
                      opacity: eligible ? 1 : 0.6,
                      transition: 'all 0.2s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: eligible ? '#1b4332' : '#64748b',
                          background: eligible ? 'rgba(82, 183, 136, 0.1)' : 'rgba(0,0,0,0.05)',
                          padding: '0.15rem 0.35rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem'
                        }}>
                          {coupon.code}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
                        {coupon.description || `discount code ${coupon.code}`}
                      </div>
                      {!eligible && (
                        <div style={{ color: '#dc2626', fontSize: '0.7rem', fontWeight: 600, marginTop: '0.2rem' }}>
                          ✕ {message}
                        </div>
                      )}
                    </div>
                    {eligible && !appliedCoupon && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#40916c', textTransform: 'lowercase' }}>click to apply</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: '#7c8d84', textTransform: 'lowercase' }}>no coupon offers available.</div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={handleRazorpayPay} 
            className="submit-payment-btn" 
            disabled={loading || !razorpayLoaded}
          >
            {loading ? (
              <span className="text-lowercase">starting razorpay...</span>
            ) : (
              <span className="text-lowercase">pay with razorpay</span>
            )}
          </button>

          <button 
            onClick={() => navigate('/buyer-dashboard')} 
            className="submit-payment-btn" 
            style={{ backgroundColor: 'transparent', color: '#dc2626', border: '1px solid #dc2626' }}
          >
            <span className="text-lowercase">cancel and return to dashboard</span>
          </button>

          {!razorpayLoaded && (
            <div className="text-lowercase" style={{ marginTop: '1rem', color: '#7c8d84', fontSize: '0.85rem' }}>
              loading payment script...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
