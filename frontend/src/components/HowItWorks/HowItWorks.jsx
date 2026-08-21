import React from 'react';
import { motion } from 'motion/react';
import './HowItWorks.css';

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: <img src="/src/assets/icons/add-user.png" alt="Join" className="w-[36px] h-[36px] object-contain" />,
      title: "Create an Account",
      desc: "Sign up as a Farmer or Buyer."
    },
    {
      number: "02",
      icon: <img src="/src/assets/icons/image.png" alt="Post" className="w-[36px] h-[36px] object-contain" />,
      title: "Add or Find Products",
      desc: "Farmers list their products. Buyers search and choose what they need."
    },
    {
      number: "03",
      icon: <img src="/src/assets/icons/handshake.png" alt="Deal" className="w-[36px] h-[36px] object-contain" />,
      title: "Place Your Order",
      desc: "Make a secure payment and confirm your order."
    },
    {
      number: "04",
      icon: <img src="/src/assets/icons/cargo-ship.png" alt="Delivery" className="w-[36px] h-[36px] object-contain" />,
      title: "Get Your Delivery",
      desc: "Receive fresh products at your location."
    }
  ];

  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="how-it-works-container">
        
        {/* Header */}
        <motion.div 
          className="how-it-works-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <span className="how-it-works-badge">
            How It Works
          </span>
          <h2 className="how-it-works-title">
            Buy and Sell in 4 Easy Steps
          </h2>
        </motion.div>

        {/* Steps Grid */}
        <div className="how-it-works-grid-wrapper">
          {/* Connector line for desktop */}
          <div className="how-it-works-connector"></div>

          <div className="how-it-works-grid">
            {steps.map((step, idx) => (
              <motion.div 
                className="how-it-works-step group" 
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <div className="how-it-works-number">
                  {step.number}
                </div>
                <div className="how-it-works-icon-wrapper">
                  {step.icon}
                </div>
                <h3 className="how-it-works-step-title">{step.title}</h3>
                <p className="how-it-works-step-desc">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}


