import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, CreditCard, MapPin, Truck, CheckCircle2, ShieldCheck, X, Loader } from 'lucide-react';
import './Cart.css';

const Cart = ({
  cart,
  handleUpdateCartQty,
  handleRemoveFromCart,
  handleCheckout,
  profileData,
  onGoToOrders
}) => {
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (profileData) {
      const fullAddress = [
        profileData.addressStreet,
        profileData.addressCity,
        profileData.addressState,
        profileData.addressPin
      ].filter(Boolean).join(', ');

      setAddress(fullAddress || '');
      setPhone(profileData.phone || '');
    }
  }, [profileData]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const gst = Math.round(subtotal * 0.05);

  const shipping = subtotal > 0 ? (shippingMethod === 'express' ? 250 : 120) : 0;

  const platformFee = subtotal > 0 ? 30 : 0;
  const total = subtotal + gst + shipping + platformFee;

  const hasPerishables = cart.some(item => item.category !== 'grains');

  const onCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!address.trim()) {
      alert('Please enter a delivery address.');
      return;
    }
    if (!phone.trim()) {
      alert('Please enter a contact phone number.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    // Simulate order wait time
    setTimeout(async () => {
      const success = await handleCheckout(address, phone, total);
      setIsProcessing(false);
      if (success) {
        setIsSuccess(true);
      } else {
        alert('Order placement failed. Please try again.');
        setShowConfirmModal(false);
      }
    }, 1500);
  };

  return (
    <div className="section-card animate-fade-in">
      <div className="card-section-header">
        <h2>Your Shopping Cart</h2>
      </div>

      {cart.length === 0 ? (
        <div className="empty-state" style={{ padding: '3rem 1rem' }}>
          <span className="empty-state-text" style={{ fontSize: '1.1rem' }}>Your shopping cart is currently empty.</span>
          <p style={{ color: '#7c8d84', margin: '0.5rem 0 1.5rem 0' }}>Explore organic farm offerings and add items to get started.</p>
        </div>
      ) : (
        <div className="cart-layout-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>

          <div className="cart-items-wrapper">
            <div className="orders-table-wrapper" style={{ margin: 0 }}>
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item._id || item.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} 
                          />
                          <div>
                            <strong style={{ display: 'block', color: '#1b4332', fontSize: '0.95rem', fontWeight: 700 }}>{item.name}</strong>
                            <span style={{ fontSize: '0.75rem', color: '#7c8d84' }}>Farmer: {item.farmer}</span>
                          </div>
                        </div>
                      </td>
                      <td>₹{item.price}/{item.priceUnit}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button 
                            type="button" 
                            onClick={() => handleUpdateCartQty(item._id || item.id, item.quantity - 1)}
                            style={{ width: '26px', height: '26px', borderRadius: '4px', border: '1px solid rgba(82, 183, 136, 0.2)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                          <button 
                            type="button" 
                            onClick={() => handleUpdateCartQty(item._id || item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            style={{ width: '26px', height: '26px', borderRadius: '4px', border: '1px solid rgba(82, 183, 136, 0.2)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </td>
                      <td><strong>₹{(item.price * item.quantity).toLocaleString()}</strong></td>
                      <td>
                        <button 
                          onClick={() => handleRemoveFromCart(item._id || item.id)}
                          style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.25rem' }}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="cart-summary-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="summary-group-card" style={{ background: '#ffffff', border: '1px solid rgba(82, 183, 136, 0.08)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(27, 67, 50, 0.02)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1b4332', margin: '0 0 1rem 0' }}>Order Summary</h3>

              <div className="summary-details-rows" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: '#55625b', borderBottom: '1px solid rgba(82, 183, 136, 0.08)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>GST (5%)</span>
                  <span>₹{gst.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Delivery Charges</span>
                  <span>₹{shipping}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Platform Fee</span>
                  <span>₹{platformFee}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.15rem', fontWeight: 800, color: '#1b4332', marginBottom: '1.5rem' }}>
                <span>Grand Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="summary-group-card" style={{ background: '#ffffff', border: '1px solid rgba(82, 183, 136, 0.08)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(27, 67, 50, 0.02)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1b4332', margin: '0 0 1rem 0' }}>Delivery details</h3>

              <form onSubmit={onCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>Shipping Address</label>
                  <textarea 
                    rows="3"
                    className="form-input" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    placeholder="Enter full physical address..."
                    style={{ resize: 'none', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(82, 183, 136, 0.2)', width: '100%', fontSize: '0.85rem' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>Contact Phone</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="Mobile number..."
                    style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(82, 183, 136, 0.2)', width: '100%', fontSize: '0.85rem' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                >
                  <CreditCard size={18} />
                  <span>Purchase</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="checkout-modal-overlay">
          <div className="checkout-modal-card animate-fade-in">
            
            
            <div className="checkout-modal-header">
              <h3>Confirm Your Order</h3>
              <button 
                type="button" 
                className="checkout-close-btn"
                onClick={() => {
                  if (!isProcessing) {
                    setShowConfirmModal(false);
                    setIsSuccess(false);
                  }
                }}
                disabled={isProcessing}
              >
                <X size={20} />
              </button>
            </div>

            {!isProcessing && !isSuccess && (
              <div className="checkout-modal-content">
                <p className="checkout-intro">Review your order details below before placement.</p>
                
                
                <div className="checkout-details-summary">
                  <div className="detail-row">
                    <strong>Delivery Address:</strong>
                    <span>{address}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Phone Number:</strong>
                    <span>{phone}</span>
                  </div>
                </div>

                
                <h4 className="section-subtitle">Select Delivery Method</h4>
                <div 
                  className={`shipping-option-card ${shippingMethod === 'standard' ? 'active' : ''}`}
                  onClick={() => setShippingMethod('standard')}
                >
                  <div className="option-info">
                    <Truck size={20} className="option-icon" />
                    <div>
                      <strong className="option-title">Standard Delivery</strong>
                      <span className="option-desc">
                        {hasPerishables 
                          ? 'Estimated delivery: 24-48 hours (Fresh Delivery)' 
                          : 'Estimated delivery: 2-3 business days'}
                      </span>
                    </div>
                  </div>
                  <strong className="option-price">₹120</strong>
                </div>

                <div 
                  className={`shipping-option-card ${shippingMethod === 'express' ? 'active' : ''}`}
                  onClick={() => setShippingMethod('express')}
                >
                  <div className="option-info">
                    <Truck size={20} className="option-icon express" />
                    <div>
                      <strong className="option-title">Express Delivery</strong>
                      <span className="option-desc">
                        {hasPerishables 
                          ? 'Estimated delivery: Within 12 hours (Direct from Farm)' 
                          : 'Estimated delivery: Next-day (within 24 hours)'}
                      </span>
                    </div>
                  </div>
                  <strong className="option-price">₹250</strong>
                </div>

               
                <div className="checkout-price-card">
                  <div className="checkout-price-row">
                    <span>Crops Subtotal:</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="checkout-price-row">
                    <span>GST (5%):</span>
                    <span>₹{gst.toLocaleString()}</span>
                  </div>
                  <div className="checkout-price-row">
                    <span>Delivery Charges:</span>
                    <span>₹{shipping}</span>
                  </div>
                  <div className="checkout-price-row">
                    <span>Platform Fee:</span>
                    <span>₹{platformFee}</span>
                  </div>
                  <div className="checkout-price-row grand-total">
                    <strong>Grand Total:</strong>
                    <strong>₹{total.toLocaleString()}</strong>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn btn-primary checkout-action-btn"
                  onClick={handleConfirmOrder}
                  style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem', height: '48px', fontSize: '1rem' }}
                >
                  <ShieldCheck size={20} />
                  <span>Confirm & Place Order</span>
                </button>
              </div>
            )}

            
            {isProcessing && (
              <div className="checkout-modal-loader">
                <Loader className="spinner" size={48} />
                <h3>Placing Order...</h3>
                <p>Verifying stock availability and creating agricultural transaction invoices securely.</p>
              </div>
            )}

            
            {isSuccess && (
              <div className="checkout-modal-success animate-scale-up">
                <CheckCircle2 size={64} className="success-icon" />
                <h3>Order Placed Successfully!</h3>
                <p>Your order invoice has been generated. The local farmer will be notified to initiate shipment.</p>
                <div className="success-actions">
                  <button 
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setShowConfirmModal(false);
                      setIsSuccess(false);
                      onGoToOrders();
                    }}
                    style={{ minWidth: '180px', justifyContent: 'center' }}
                  >
                    Go to Placed Orders
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
