import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Hero from '../../components/Hero/Hero';
import Features from '../../components/Features/Features';
import Categories from '../../components/Categories/Categories';
import HowItWorks from '../../components/HowItWorks/HowItWorks';
import Testimonials from '../../components/Testimonials/Testimonials';
import CTA from '../../components/CTA/CTA';
import Contact from '../../components/Contact/Contact';
import Footer from '../../components/Footer/Footer';

export default function Landing() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Categories />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Contact />
      <Footer />
    </>
  );
}
