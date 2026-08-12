import React from 'react';
import './Footer.css';

export default function Footer() {
  const handleNavClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      if (href === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const element = document.querySelector(href);
        if (element) {
          if (href === '#features' || href === '#how-it-works') {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          
          {/* Brand Info Column */}
          <div className="footer-col">
            <a href="#" onClick={(e) => handleNavClick(e, '#')} className="footer-logo">
              <img src="/src/assets/logo-banner.png" alt="AgriMarket Logo" className="footer-logo-img" />
            </a>
            <p className="footer-desc">
              Helping farmers and buyers connect through a simple and secure online marketplace.
            </p>
          </div>

          {/* Contact Column */}
          <div className="footer-col">
            <h4 className="footer-title">Contact</h4>
            <ul className="footer-contact-list">
              <li className="flex items-center gap-2">
                <img src="/src/assets/icons/phone.png" alt="Phone" className="footer-icon" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <img src="/src/assets/icons/gmail.png" alt="Email" className="footer-icon" />
                <span>rishi@shnoor.com</span>
              </li>
              <li className="flex items-center gap-2">
                <img src="/src/assets/icons/gmail.png" alt="Email" className="footer-icon" />
                <span>kavya@shnoor.com</span>
              </li>
              <li className="flex items-center gap-2">
                <img src="/src/assets/icons/marker.png" alt="Location" className="footer-icon" />
                <span>Eluru District, Andhra Pradesh, India</span>
              </li>
            </ul>
          </div>

          {/* Quick Links Column */}
          <div className="footer-col">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links-list">
              <li><a href="#" onClick={(e) => handleNavClick(e, '#')} className="footer-link">Home</a></li>
              <li><a href="#features" onClick={(e) => handleNavClick(e, '#features')} className="footer-link">Features</a></li>
              <li><a href="#categories" onClick={(e) => handleNavClick(e, '#categories')} className="footer-link">Categories</a></li>
              <li><a href="#how-it-works" onClick={(e) => handleNavClick(e, '#how-it-works')} className="footer-link">How It Works</a></li>
              <li><a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="footer-link">Contact</a></li>
            </ul>
          </div>

        </div>
        
        <hr className="footer-divider" />
        
        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} AgriMarket. All Rights Reserved.
          </p>
          <div className="footer-legal">
            <a href="#" className="footer-legal-link">Privacy Policy</a>
            <a href="#" className="footer-legal-link">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
