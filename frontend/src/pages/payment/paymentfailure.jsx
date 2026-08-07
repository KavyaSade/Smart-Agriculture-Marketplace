import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './payment.css';

export default function PaymentFailure() {
  const location = useLocation();
  const navigate = useNavigate();
  const { message } = location.state || {};

  return (
    <div className="payment-layout-container">
      <div className="payment-card-box">
        <div className="status-view">
          <div className="status-icon-box failure">
            <img src="/src/assets/icons/multiply.png" alt="failure" className="payment-status-png" />
          </div>
          <h1 className="payment-title text-lowercase">payment failed</h1>
          <p className="status-desc text-lowercase">
            {message ? message : 'something went wrong during the checkout process.'}
            <br />
            please check your card details or try paypal checkout again.
          </p>
          <button 
            className="submit-payment-btn text-lowercase" 
            onClick={() => navigate('/buyer-dashboard')}
            style={{ backgroundColor: '#dc2626' }}
          >
            return to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
