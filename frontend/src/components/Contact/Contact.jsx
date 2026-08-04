import React, { useState } from 'react';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate message submission
    setSubmitted(true);
  };

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        
        {/* Header */}
        <div className="contact-header">
          <span className="contact-badge">
            Contact Us
          </span>
          <h2 className="contact-title">
            Get in Touch
          </h2>
          <p className="contact-desc">
            Have questions about trading, verification, or escrow payments? Our support team is here to help you.
          </p>
        </div>

        {/* Content Grid */}
        <div className="contact-grid">
          
          {/* Left Side: Contact Info Details */}
          <div className="contact-info-column">
            <div className="contact-cards-list">
              
              {/* Card 1: Phone */}
              <div className="contact-info-card">
                <div className="contact-card-icon-wrapper">
                  <img src="/src/assets/icons/phone.png" alt="Phone" className="contact-card-icon" />
                </div>
                <div className="contact-card-text">
                  <h3 className="contact-card-label">Call Us</h3>
                  <p className="contact-card-val">987654321</p>
                  <p className="contact-card-sub">Mon-Fri 9am - 6pm</p>
                </div>
              </div>

              {/* Card 2: Email */}
              <div className="contact-info-card">
                <div className="contact-card-icon-wrapper">
                  <img src="/src/assets/icons/gmail.png" alt="Email" className="contact-card-icon" />
                </div>
                <div className="contact-card-text">
                  <h3 className="contact-card-label">Email Support</h3>
                  <p className="contact-card-val">rishi@shnoor.com</p>
                  <p className="contact-card-val">kavya@shnoor.com</p>
                  <p className="contact-card-sub">For general and sales inquiries</p>
                </div>
              </div>

              {/* Card 3: Address */}
              <div className="contact-info-card">
                <div className="contact-card-icon-wrapper">
                  <img src="/src/assets/icons/marker.png" alt="Location" className="contact-card-icon" />
                </div>
                <div className="contact-card-text">
                  <h3 className="contact-card-label">Headquarters</h3>
                  <p className="contact-card-val">AgriMarket</p>
                  <p className="contact-card-sub">Eluru District, Andhra Pradesh, India</p>
                </div>
              </div>

            </div>

            {/* Support Hours Card */}
            <div className="contact-hours-box">
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
            </div>
          </div>

          {/* Right Side: Message Submission Form Card */}
          <div className="contact-form-column">
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

                  <button type="submit" className="btn btn-primary contact-submit-btn">
                    Send Message
                    <img src="/src/assets/icons/paper-plane.png" alt="Send" className="contact-btn-icon" />
                  </button>
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
          </div>

        </div>

      </div>
    </section>
  );
}
