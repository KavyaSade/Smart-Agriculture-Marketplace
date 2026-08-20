// Reusable Framer Motion variants
export const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.28, ease: [0.25, 1, 0.5, 1] }
  },
  exit: { 
    opacity: 0, 
    y: -15,
    transition: { duration: 0.18, ease: [0.25, 1, 0.5, 1] }
  }
};

export const modalBackdropVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeIn' }
  }
};

export const modalContainerVariants = {
  initial: { opacity: 0, y: 30, scale: 0.98 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  },
  exit: { 
    opacity: 0, 
    y: 30, 
    scale: 0.98,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
  }
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' }
  }
};

export const buttonPress = {
  hover: { scale: 1.02, transition: { duration: 0.15 } },
  tap: { scale: 0.98, transition: { duration: 0.15 } }
};

export const chatBubbleVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' }
  }
};

export const botWindowVariants = {
  initial: { opacity: 0, scale: 0.92, y: 20 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    scale: 0.92, 
    y: 20,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};
