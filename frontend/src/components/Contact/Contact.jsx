import React, { useState } from 'react';
import { motion } from 'motion/react';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send query details to the backend api
      const response = await fetch('http://localhost:5000/api/queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to submit query. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting query:', err);
      alert('Network error. Please try again later.');
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        
        {/* Header */}
        <motion.div 
          className="contact-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <span className="contact-badge">
            Contact Us
          </span>
          <h2 className="contact-title">
            Get in Touch
          </h2>
          <p className="contact-desc">
            Have questions about trading, verification, or escrow payments? Our support team is here to help you.
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="contact-grid">
          
          {/* Left Side: Contact Info Details */}
          <div className="contact-info-column">
            <div className="contact-cards-list">
              
              {/* Card 1: Phone */}
              <motion.div 
                className="contact-info-card" 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="contact-card-icon-wrapper">
                  <img src="/src/assets/icons/phone.png" alt="Phone" className="contact-card-icon" />
                </div>
                <div className="contact-card-text">
                  <h3 className="contact-card-label">Call Us</h3>
                  <p className="contact-card-val">987654321</p>
                  <p className="contact-card-sub">Mon-Fri 9am - 6pm</p>
                </div>
              </motion.div>

              {/* Card 2: Email */}
              <motion.div 
                className="contact-info-card" 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="contact-card-icon-wrapper">
                  <img src="/src/assets/icons/gmail.png" alt="Email" className="contact-card-icon" />
                </div>
                <div className="contact-card-text">
                  <h3 className="contact-card-label">Email Support</h3>
                  <p className="contact-card-val">rishi@shnoor.com</p>
                  <p className="contact-card-val">kavya@shnoor.com</p>
                  <p className="contact-card-sub">For general and sales inquiries</p>
                </div>
              </motion.div>

              {/* Card 3: Address */}
              <motion.div 
                className="contact-info-card" 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <div className="contact-card-icon-wrapper">
                  <img src="/src/assets/icons/marker.png" alt="Location" className="contact-card-icon" />
                </div>
                <div className="contact-card-text">
                  <h3 className="contact-card-label">Headquarters</h3>
                  <p className="contact-card-val">AgriMarket</p>
                  <p className="contact-card-sub">Eluru District, Andhra Pradesh, India</p>
                </div>
              </motion.div>

            </div>

            {/* Support Hours Card */}
            <motion.div 
              className="contact-hours-box"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="hours-title">Support Hours</h4>
              <div className="hours-row">
                <span>Monday - Friday:</span>
                <strong>9:00 AM - 6:00 PM IST</strong>
              </div>
              <div className="hours-row">
                <span>Saturday:</span>
                <strong>10:00 AM - 2:00 PM IST</strong>
              </div>
              <div className="hours-row">
                <span>Sunday:</span>
                <span className="text-muted font-bold">Closed</span>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Message Submission Form Card */}
          <motion.div 
            className="contact-form-column"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5 }}
          >
            <div className="contact-form-card">
              
              {!submitted ? (
                <form onSubmit={handleSubmit} className="contact-form-element">
                  <h3 className="form-header-title">Send a Message</h3>
                  <p className="form-header-desc">Fill out the form below and we'll get back to you soon.</p>
                  
                  <div className="form-row-grid">
                    <div className="form-input-wrapper">
                      <label className="form-label" htmlFor="contact-name">Your Name</label>
                      <input
                        type="text"
                        id="contact-name"
                        name="name"
                        placeholder="Enter your name"
                        className="form-input"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-input-wrapper">
                      <label className="form-label" htmlFor="contact-email">Email</label>
                      <input
                        type="email"
                        id="contact-email"
                        name="email"
                        placeholder="Enter your email"
                        className="form-input"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-input-wrapper">
                    <label className="form-label" htmlFor="contact-subject">Subject</label>
                    <input
                      type="text"
                      id="contact-subject"
                      name="subject"
                      placeholder="Enter the subject"
                      className="form-input"
                      value={form.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-input-wrapper">
                    <label className="form-label" htmlFor="contact-message">Message</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      placeholder="Write your message"
                      rows="5"
                      className="form-input form-textarea"
                      value={form.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  <motion.button 
                    type="submit" 
                    className="btn btn-primary contact-submit-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Send Message
                    <img src="/src/assets/icons/paper-plane.png" alt="Send" className="contact-btn-icon" />
                  </motion.button>
                </form>
              ) : (
                <div className="contact-success-state">
                  <div className="success-icon-ring">
                    <span className="success-checkmark">✓</span>
                  </div>
                  <h3 className="success-title">Message Sent!</h3>
                  <p className="success-desc">
                    Thank you, <strong>{form.name}</strong>. Your message has been received. Our team will get back to you at <strong>{form.email}</strong> shortly.
                  </p>
                  <button 
                    onClick={() => { setForm({ name: '', email: '', subject: '', message: '' }); setSubmitted(false); }} 
                    className="btn btn-secondary success-back-btn"
                  >
                    Send another message
                  </button>
                </div>
              )}

            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}

