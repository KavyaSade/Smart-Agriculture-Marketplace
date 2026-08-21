import React from 'react';
import { motion } from 'motion/react';
import './CTA.css';

export default function CTA() {
  return (
    <section className="cta-section">
      <div className="cta-container">
        
        {/* Farmers Card */}
        <motion.div 
          className="cta-card-farmers"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <div className="cta-icon-wrapper-farmers">
              <img src="/src/assets/icons/wheat.png" alt="Wheat" className="w-[30px] h-[30px] object-contain" />
            </div>
            <h3 className="cta-card-title-farmers">For Farmers</h3>
            <p className="cta-card-desc-farmers">
              Sell your products to more buyers and earn better prices.
            </p>
          </div>
          <a href="#how-it-works" className="btn btn-primary cta-card-btn-farmers">
            Learn More &rarr;
          </a>
        </motion.div>

        {/* Buyers Card */}
        <motion.div 
          className="cta-card-buyers"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <div className="cta-icon-wrapper-buyers">
              <img src="/src/assets/icons/shopping-bag.png" alt="ShoppingBag" className="w-[30px] h-[30px] object-contain" />
            </div>
            <h3 className="cta-card-title-buyers">For Buyers</h3>
            <p className="cta-card-desc-buyers">
              Buy fresh farm products directly from trusted farmers.
            </p>
          </div>
          <a href="#categories" className="btn btn-accent cta-card-btn-buyers">
            Browse Products &rarr;
          </a>
        </motion.div>

      </div>
    </section>
  );
}
