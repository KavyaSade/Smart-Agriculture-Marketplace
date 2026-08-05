import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, CreditCard, MapPin, Truck } from 'lucide-react';
import './Cart.css';

const Cart = ({
  cart,
  handleUpdateCartQty,
  handleRemoveFromCart,
  handleCheckout,
  profileData
}) => {
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

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

  const shipping = subtotal > 0 ? 120 : 0;

  const platformFee = subtotal > 0 ? 30 : 0;
  const total = subtotal + gst + shipping + platformFee;

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
    handleCheckout(address, phone, total);
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
                    <tr key={item.id}>
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
                            onClick={() => handleUpdateCartQty(item.id, item.quantity - 1)}
                            style={{ width: '26px', height: '26px', borderRadius: '4px', border: '1px solid rgba(82, 183, 136, 0.2)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                          <button 
                            type="button" 
                            onClick={() => handleUpdateCartQty(item.id, item.quantity + 1)}
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
                          onClick={() => handleRemoveFromCart(item.id)}
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
                  <span>Simulate Purchase</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
