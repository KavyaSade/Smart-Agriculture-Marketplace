import React from 'react';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
            <span className="hero-badge-dot"></span>Direct From Farms to Your Table
          </div>
          <h1 className="hero-title animate-fade-in-up opacity-0" style={{ animationDelay: '250ms' }}>
            Smart Marketplace <br />For <span className="hero-title-accent">Modern Agriculture</span>
          </h1>
          <p className="hero-desc animate-fade-in-up opacity-0" style={{ animationDelay: '400ms' }}>
            Connecting farmers directly with wholesale buyers, retailers, and consumers. Get fair prices, reduce waste, and trade securely with smart digital solutions.
          </p>
          <div className="hero-btn-group animate-fade-in-up opacity-0" style={{ animationDelay: '550ms' }}>
            <a href="#categories" className="btn btn-primary hover:scale-[1.04] active:scale-[0.96] w-full sm:w-auto">
              Explore Products <img src="/src/assets/icons/arrow.png" alt="arrow" className="hero-btn-primary-icon" />
            </a>
            <a href="#how-it-works" className="btn btn-secondary hover:scale-[1.04] active:scale-[0.96] w-full sm:w-auto">
              How It Works
            </a>
          </div>
          <div className="hero-stats animate-fade-in-up opacity-0" style={{ animationDelay: '700ms' }}>
            <div className="hero-stat-item">
              <img src="/src/assets/icons/group.png" alt="Users" className="hero-stat-icon" />
              <div className="hero-stat-info">
                <h4 className="hero-stat-number">15,000+</h4>
                <p className="hero-stat-label">Verified Farmers</p>
              </div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat-item">
              <img src="/src/assets/icons/shield.png" alt="Secure" className="hero-stat-icon" />
              <div className="hero-stat-info">
                <h4 className="hero-stat-number">100% Secure</h4>
                <p className="hero-stat-label">Escrow Payments</p>
              </div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat-item">
              <img src="/src/assets/icons/graph.png" alt="Direct Pricing" className="hero-stat-icon" />
              <div className="hero-stat-info">
                <h4 className="hero-stat-number">No Middlemen</h4>
                <p className="hero-stat-label">Direct Pricing</p>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <div className="hero-bg-blur"></div>
          <figure className="hero-figure">
            <img 
              src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=85&w=1200" 
              alt="Beautiful lush agricultural landscape" 
              className="hero-img" 
            />
            <div className="hero-overlay">
              <p className="hero-overlay-tag">Better trade starts at the source</p>
              <p className="hero-overlay-title">Fresh produce. Fair opportunity.</p>
            </div>
          </figure>
          <div className="hero-badge-left">
            <p className="hero-badge-left-val">10,000+</p>
            <p className="hero-badge-left-lbl">Orders Completed</p>
          </div>
          <div className="hero-badge-bottom">
            <p className="hero-badge-bottom-val">24 hrs</p>
            <p className="hero-badge-bottom-lbl">average response time</p>
          </div>
        </div>
      </div>
    </section>
  );
}