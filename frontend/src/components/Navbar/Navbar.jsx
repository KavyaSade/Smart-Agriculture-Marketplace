import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (e, href) => {
    setIsOpen(false);
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
  };

  const links = [
    ['Home', '#'],
    ['Features', '#features'],
    ['Categories', '#categories'],
    ['Contact', '#contact'],
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setIsOpen(false)}>
          <img src="/src/assets/icons/leaf.png" alt="Leaf Logo" className="navbar-logo-img" /><span>Agri<span className="navbar-logo-accent">Market</span></span>
        </Link>
        <ul className="navbar-menu">
          {links.map(([label, href]) => (
            <li key={href}>
              {href.startsWith('#') ? (
                <a href={href} onClick={(e) => handleNavClick(e, href)} className="navbar-link">
                  {label}
                </a>
              ) : (
                <Link to={href} onClick={() => setIsOpen(false)} className="navbar-link">
                  {label}
                </Link>
              )}
            </li>
          ))}
        </ul>
        <div className="navbar-actions">
          <button type="button" className="navbar-login-btn">Login</button>
          <button type="button" className="btn btn-primary navbar-signup-btn">Sign Up</button>
        </div>
        <button className="navbar-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle navigation">
          {isOpen ? (
            <img src="/src/assets/icons/multiply.png" alt="Close" className="navbar-toggle-img" />
          ) : (
            <img src="/src/assets/icons/menu.png" alt="Menu" className="navbar-toggle-img" />
          )}
        </button>
      </div>
      <div className={`navbar-mobile-menu ${isOpen ? 'navbar-mobile-menu-open' : 'navbar-mobile-menu-closed'}`}>
        <ul className="navbar-mobile-list">
          {links.map(([label, href]) => (
            <li key={href}>
              {href.startsWith('#') ? (
                <a href={href} onClick={(e) => handleNavClick(e, href)} className="navbar-mobile-link">
                  {label}
                </a>
              ) : (
                <Link to={href} onClick={() => setIsOpen(false)} className="navbar-mobile-link">
                  {label}
                </Link>
              )}
            </li>
          ))}
          <div className="navbar-mobile-actions">
            <button type="button" className="btn btn-secondary w-full">Login</button>
            <button type="button" className="btn btn-primary w-full">Sign Up</button>
          </div>
        </ul>
      </div>
    </nav>
  );
}