import React, { useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Hero from '../../components/Hero/Hero';
import Features from '../../components/Features/Features';
import Categories from '../../components/Categories/Categories';
import HowItWorks from '../../components/HowItWorks/HowItWorks';
import Testimonials from '../../components/Testimonials/Testimonials';
import CTA from '../../components/CTA/CTA';
import Contact from '../../components/Contact/Contact';
import Footer from '../../components/Footer/Footer';

function SectionSeparator() {
  return (
    <div className="shiny-separator-container">
      <div className="shiny-separator">
        <div className="shiny-separator-glow" />
      </div>
    </div>
  );
}

export default function Landing() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <>
      <Navbar />
      <Hero />
      <SectionSeparator />
      <div className="reveal">
        <Features />
      </div>
      <SectionSeparator />
      <div className="reveal">
        <Categories />
      </div>
      <SectionSeparator />
      <div className="reveal">
        <HowItWorks />
      </div>
      <SectionSeparator />
      <div className="reveal">
        <Testimonials />
      </div>
      <SectionSeparator />
      <div className="reveal">
        <CTA />
      </div>
      <SectionSeparator />
      <div className="reveal">
        <Contact />
      </div>
      <Footer />
    </>
  );
}
