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
        body: JSON.stringify({ amount: total })
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
              navigate('/payment/success', { state: { cart, address, phone, total } });
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
          <div className="summary-total">
            <span className="text-lowercase">amount to pay:</span>
            <span>₹{total ? total.toLocaleString() : 0}</span>
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
