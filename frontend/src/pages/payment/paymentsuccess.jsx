import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './payment.css';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, address, phone, checkoutId, couponCode } = location.state || {};
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // redirect if there is no cart data to process
    if (!cart || !address || !phone) {
      navigate('/buyer-dashboard');
      return;
    }

    // Prevent duplicate execution (e.g. React 18 StrictMode double-mounting)
    const orderPlacedKey = checkoutId ? `order_placed_${checkoutId}` : null;
    if (orderPlacedKey && sessionStorage.getItem(orderPlacedKey)) {
      setLoading(false);
      return;
    }
    if (orderPlacedKey) {
      sessionStorage.setItem(orderPlacedKey, 'true');
    }

    const placeOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'authorization': `bearer ${token}`,
          'content-type': 'application/json'
        };

        // place order for each item in the cart
        for (const item of cart) {
          const payload = {
            productId: item._id || item.id,
            quantity: item.quantity,
            buyerPhone: phone,
            buyerAddress: address,
            couponCode,
            checkoutId,
            cart: cart.map(c => ({ id: c._id || c.id, quantity: c.quantity }))
          };

          await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
          });
        }

        // decode token to clear correct cart key from storage
        if (token) {
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const userinfo = JSON.parse(window.atob(base64));
            if (userinfo.email) {
              localStorage.removeItem(`cart_${userinfo.email}`);
            }
          } catch (e) {
            localStorage.removeItem('cart_buyer');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    placeOrders();
  }, [cart, address, phone, navigate]);

  return (
    <div className="payment-layout-container">
      <div className="payment-card-box">
        {loading ? (
          <div className="status-view">
            <div className="spinner-loader"></div>
            <p className="text-lowercase">finalizing order details...</p>
          </div>
        ) : (
          <div className="status-view">
            <div className="status-icon-box success">
              <img src="/src/assets/icons/shield.png" alt="success" className="payment-status-png" />
            </div>
            <h1 className="payment-title text-lowercase">payment successful</h1>
            <p className="status-desc text-lowercase">
              thank you for your purchase. your orders have been placed successfully and are pending shipment.
            </p>
            <button 
              className="submit-payment-btn text-lowercase" 
              onClick={() => navigate('/buyer-dashboard')}
            >
              go back to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
