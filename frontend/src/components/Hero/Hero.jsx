import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import './Hero.css';

const MotionLink = motion(Link);

export default function Hero() {
  const { user } = useAuth();

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <motion.div 
            className="hero-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="hero-badge-dot"></span>Direct From Farms to Your Table
          </motion.div>

          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            Smart Marketplace <br />For <span className="hero-title-accent">Modern Agriculture</span>
          </motion.h1>

          <motion.p 
            className="hero-desc"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Connecting farmers directly with wholesale buyers, retailers, and consumers. Get fair prices, reduce waste, and trade securely with smart digital solutions.
          </motion.p>

          <motion.div 
            className="hero-btn-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
          >
            {user?.role === 'farmer' ? (
              <MotionLink 
                to="/retailer-dashboard" 
                className="btn btn-primary w-full sm:w-auto"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                Go to Retailer Dashboard <img src="/src/assets/icons/arrow.png" alt="arrow" className="hero-btn-primary-icon" />
              </MotionLink>
            ) : user?.role === 'admin' ? (
              <MotionLink 
                to="/admin-dashboard" 
                className="btn btn-primary w-full sm:w-auto"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                Go to Admin Dashboard <img src="/src/assets/icons/arrow.png" alt="arrow" className="hero-btn-primary-icon" />
              </MotionLink>
            ) : (
              <motion.a 
                href="#categories" 
                className="btn btn-primary w-full sm:w-auto"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                Explore Products <img src="/src/assets/icons/arrow.png" alt="arrow" className="hero-btn-primary-icon" />
              </motion.a>
            )}
            <motion.a 
              href="#how-it-works" 
              className="btn btn-secondary w-full sm:w-auto"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              How It Works
            </motion.a>
          </motion.div>

          <motion.div 
            className="hero-stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
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
          </motion.div>
        </div>

        <motion.div 
          className="hero-image-wrapper"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        >
          <div className="hero-bg-blur"></div>
          <figure className="hero-figure">
            <img 
              src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=85&w=1200" 
              alt="Beautiful lush agricultural landscape" 
              className="hero-img" 
              style={{ objectPosition: 'center' }}
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
        </motion.div>
      </div>
    </section>
  );
}