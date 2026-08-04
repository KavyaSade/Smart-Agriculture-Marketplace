import React from 'react';
import './Features.css';

export default function Features() {
  const featuresList = [
    {
      icon: <img src="/src/assets/icons/shopping-bag.png" alt="Sourcing" className="w-[28px] h-[28px] object-contain" />,
      title: "Buy Directly from Farmers",
      desc: "Purchase fresh products directly from verified farmers.",
      bg: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=600"
    },
    {
      icon: <img src="/src/assets/icons/shield.png" alt="Security" className="w-[28px] h-[28px] object-contain" />,
      title: "Safe Payments",
      desc: "Your payment is protected until the order is delivered.",
      bg: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=600"
    },
    {
      icon: <img src="/src/assets/icons/rupee.png" alt="Pricing" className="w-[28px] h-[28px] object-contain" />,
      title: "Fair Prices",
      desc: "Farmers earn better prices, and buyers get quality products.",
      bg: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600"
    },
    {
      icon: <img src="/src/assets/icons/delivery.png" alt="Truck" className="w-[28px] h-[28px] object-contain" />,
      title: "Fast Delivery",
      desc: "Fresh products are delivered safely to your location.",
      bg: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600"
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
            <div className="feature-card" key={idx}>
              {/* Floating Icon Badge */}
              <div className="feature-icon-badge">
                {feature.icon}
              </div>
              
              {/* Inner Card (Image and copy overlay) */}
              <div className="feature-card-inner">
                <div 
                  className="feature-card-bg"
                  style={{ backgroundImage: `url(${feature.bg})` }}
                />
                <div className="feature-card-overlay" />
                
                <div className="feature-card-content">
                  <h3 className="feature-card-title">{feature.title}</h3>
                  <p className="feature-card-desc">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
