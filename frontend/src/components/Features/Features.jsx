import React from 'react';
import './Features.css';

export default function Features() {
  const featuresList = [
    {
      icon: <img src="/src/assets/icons/shopping-bag.png" alt="Sourcing" className="w-[28px] h-[28px] object-contain" />,
      title: "Buy Directly from Farmers",
      desc: "Purchase fresh products directly from verified farmers."
    },
    {
      icon: <img src="/src/assets/icons/shield.png" alt="Security" className="w-[28px] h-[28px] object-contain" />,
      title: "Safe Payments",
      desc: "Your payment is protected until the order is delivered."
    },
    {
      icon: <img src="/src/assets/icons/rupee.png" alt="Pricing" className="w-[28px] h-[28px] object-contain" />,
      title: "Fair Prices",
      desc: "Farmers earn better prices, and buyers get quality products."
    },
    {
      icon: <img src="/src/assets/icons/delivery.png" alt="Truck" className="w-[28px] h-[28px] object-contain" />,
      title: "Fast Delivery",
      desc: "Fresh products are delivered safely to your location."
    }
  ];

  return (
    <section id="features" className="features-section">
      <div className="features-container">
        
        {/* Header */}
        <div className="features-header">
          <span className="features-badge">
            Features
          </span>
          <h2 className="features-title">
            Why Choose AgriMarket?
          </h2>
          <p className="features-desc">
            We make buying and selling farm products simple, safe, and reliable.
          </p>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          {featuresList.map((feature, idx) => (
            <div className="feature-card group" key={idx}>
              <div className="feature-icon-wrapper">
                {feature.icon}
              </div>
              <h3 className="feature-card-title">{feature.title}</h3>
              <p className="feature-card-desc">{feature.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
