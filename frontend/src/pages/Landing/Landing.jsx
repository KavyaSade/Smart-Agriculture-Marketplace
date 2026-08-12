import React from 'react';
import { motion } from 'motion/react';
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
  const sectionAnimation = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.6, ease: 'easeOut' }
  };

  return (
    <>
      <Navbar />
      <Hero />
      <motion.div {...sectionAnimation}>
        <Features />
      </motion.div>
      <motion.div {...sectionAnimation}>
        <Categories />
      </motion.div>
      <motion.div {...sectionAnimation}>
        <HowItWorks />
      </motion.div>
      <motion.div {...sectionAnimation}>
        <Testimonials />
      </motion.div>
      <motion.div {...sectionAnimation}>
        <CTA />
      </motion.div>
      <motion.div {...sectionAnimation}>
        <Contact />
      </motion.div>
      <Footer />
    </>
  );
}
