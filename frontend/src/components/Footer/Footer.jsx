import React from 'react';
import {
  generatePrivacyPolicyPDF,
  generateTermsOfServicePDF
} from '../../utils/pdfGenerator';
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

  const handlePrivacyDownload = async (e) => {
    e.preventDefault();
    await generatePrivacyPolicyPDF();
  };

  const handleTermsDownload = async (e) => {
    e.preventDefault();
    await generateTermsOfServicePDF();
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
            <div className="footer-socials">
              <a href="https://www.linkedin.com/in/rishimacha/" target="_blank" rel="noopener noreferrer" className="footer-social-link">
                <img src="/src/assets/icons/linkedin.png" alt="LinkedIn" className="footer-social-icon" />
              </a>
              <a href="https://github.com/KavyaSade" target="_blank" rel="noopener noreferrer" className="footer-social-link github-link">
                <img src="/src/assets/icons/github.png" alt="GitHub" className="footer-social-icon" />
              </a>
              <a href="https://www.instagram.com/agri_market_sam?igsh=ZHkweHU3YmQ3YmZz" target="_blank" rel="noopener noreferrer" className="footer-social-link">
                <img src="/src/assets/icons/instagram.png" alt="Instagram" className="footer-social-icon" />
              </a>
            </div>
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
            <a href="#" onClick={handlePrivacyDownload} className="footer-legal-link">Privacy Policy</a>
            <a href="#" onClick={handleTermsDownload} className="footer-legal-link">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
