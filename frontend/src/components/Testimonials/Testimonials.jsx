import React, { useState, useEffect } from 'react';
import './Testimonials.css';

export default function Testimonials() {
  const reviews = [
    {
      name: "Rishi Macha",
      role: "Farmer (Rice & Wheat)",
      location: "Andhra Pradesh",
      quote: "AgriMarket helped me sell my crops directly to buyers. I now get better prices and more customers.",
      stars: 5
    },
    {
      name: "Sade Kavya",
      role: "Manager",
      location: "Bangalore",
      quote: "We can quickly find fresh fruits from trusted farmers. It saves us time and makes buying much easier.",
      stars: 5
    },
    {
      name: "Dileep Bale",
      role: "Owner",
      location: "Hyderabad",
      quote: "Buying fresh vegetables is now easy and safe. The payment process is simple, and the products always arrive on time.",
      stars: 5
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % reviews.length);
        setFade(true);
      }, 300); // match fade transition
    }, 6000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  const handleDotClick = (index) => {
    setFade(false);
    setTimeout(() => {
      setActiveIndex(index);
      setFade(true);
    }, 300);
  };

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="testimonials-container">
        
        {/* Header */}
        <div className="testimonials-header">
          <span className="testimonials-badge">
            Testimonials
          </span>
          <h2 className="testimonials-title">
            What Our Customers Say
          </h2>
        </div>

        {/* Testimonials Slider */}
        <div className="testimonials-slider-wrapper">
          <div className="testimonials-card">
            
            {/* Quote decoration */}
            <div className="testimonials-quote-icon">
              <img src="/src/assets/icons/quote.png" alt="Quote" className="testimonials-quote-img" />
            </div>
            
            <div className={`transition-all duration-300 relative z-10 ${fade ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
              <div className="testimonials-stars">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={i < reviews[activeIndex].stars ? "#ffb703" : "#d1d5db"}
                    className="testimonials-star-svg"
                    style={{ width: '20px', height: '20px', display: 'inline-block', marginRight: '4px' }}
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>

              <p className="testimonials-quote">
                "{reviews[activeIndex].quote}"
              </p>

              <div className="testimonials-author">
                <div>
                  <h4 className="testimonials-author-name">{reviews[activeIndex].name}</h4>
                  <p className="testimonials-author-role">
                    {reviews[activeIndex].role} • <strong className="font-semibold">{reviews[activeIndex].location}</strong>
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Dots Indicator */}
          <div className="testimonials-dots">
            {reviews.map((_, index) => (
              <button
                key={index}
                className={`testimonials-dot ${activeIndex === index ? 'testimonials-dot-active' : ''}`}
                onClick={() => handleDotClick(index)}
                aria-label={`Slide to testimonial ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
