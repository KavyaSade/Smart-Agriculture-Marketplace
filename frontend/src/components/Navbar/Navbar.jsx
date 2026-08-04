import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import './Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
          <ThemeToggle />
          {user ? (
            <div className="navbar-profile-container" ref={dropdownRef}>
              <button 
                className="navbar-profile-trigger" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
              >
                <div className="navbar-avatar-placeholder">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="navbar-user-name">{user.fullName ? user.fullName.split(' ')[0] : 'User'}</span>
                <span className={`navbar-role-tag ${user.role}`}>{user.role}</span>
              </button>
              
              {isDropdownOpen && (
                <div className="navbar-dropdown">
                  <div className="dropdown-header">
                    <span className="dropdown-name">{user.fullName}</span>
                    <span className="dropdown-email">{user.email}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  
                  {user.role === 'farmer' && (
                    <Link to="/farmer-dashboard" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      Farmer Dashboard
                    </Link>
                  )}
                  {user.role === 'buyer' && (
                    <Link to="/buyer-dashboard" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      Buyer Dashboard
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin-dashboard" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      Admin Dashboard
                    </Link>
                  )}
                  
                  <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                    My Profile
                  </Link>
                  
                  <div className="dropdown-divider"></div>
                  <button 
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }} 
                    className="dropdown-item logout-btn"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="navbar-login-btn">Login</Link>
              <Link to="/signup" className="btn btn-primary navbar-signup-btn">Sign Up</Link>
            </>
          )}
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
            <ThemeToggle mobile={true} />
            {user ? (
              <div className="navbar-mobile-profile">
                <div className="mobile-profile-header">
                  <div className="navbar-avatar-placeholder">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="mobile-profile-details">
                    <span className="mobile-profile-name">{user.fullName}</span>
                    <span className="mobile-profile-email">{user.email}</span>
                  </div>
                </div>
                
                <div className="navbar-mobile-actions-wrapper">
                  {user.role === 'farmer' && (
                    <Link to="/farmer-dashboard" className="btn btn-secondary w-full text-center" onClick={() => setIsOpen(false)}>
                      Farmer Dashboard
                    </Link>
                  )}
                  {user.role === 'buyer' && (
                    <Link to="/buyer-dashboard" className="btn btn-secondary w-full text-center" onClick={() => setIsOpen(false)}>
                      Buyer Dashboard
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin-dashboard" className="btn btn-secondary w-full text-center" onClick={() => setIsOpen(false)}>
                      Admin Dashboard
                    </Link>
                  )}
                  
                  <Link to="/profile" className="btn btn-secondary w-full text-center" onClick={() => setIsOpen(false)}>
                    My Profile
                  </Link>
                  
                  <button 
                    onClick={() => { logout(); setIsOpen(false); }} 
                    className="btn logout-btn-mobile w-full text-center mt-2"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="btn btn-secondary w-full text-center">Login</Link>
                <Link to="/signup" onClick={() => setIsOpen(false)} className="btn btn-primary w-full text-center">Sign Up</Link>
              </>
            )}
          </div>
        </ul>
      </div>
    </nav>
  );
}