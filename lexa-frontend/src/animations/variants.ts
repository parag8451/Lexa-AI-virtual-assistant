import { Variants } from "framer-motion";

/**
 * Framer Motion animation variants for Lexa UI
 * All animations respect prefers-reduced-motion system preference
 */

export const messageEntrance: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(4px)",
    transition: {
      duration: 0.15,
    },
  },
};

export const messageListContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.08,
    },
  },
};

export const typingIndicator: Variants = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  dot: {
    height: "8px",
    width: "8px",
    borderRadius: "50%",
    backgroundColor: "currentColor",
    opacity: 0.6,
    animation: "pulse 1.4s infinite",
  },
  bounce: {
    y: [0, -4, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: "loop" as const,
      ease: "easeInOut",
    },
  },
};

export const sidebarAnimation: Variants = {
  hidden: {
    x: -260,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.22,
      ease: [0.32, 0.72, 0, 1],
    },
  },
  exit: {
    x: -260,
    opacity: 0,
    transition: {
      duration: 0.18,
      ease: [0.32, 0.72, 0, 1],
    },
  },
};

export const conversationItemAnimation: Variants = {
  hidden: {
    opacity: 0,
    x: -16,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.18,
      ease: "easeOut",
    },
  },
  hover: {
    x: 4,
    transition: {
      duration: 0.15,
    },
  },
};

export const panelAnimation: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.97,
    y: 8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: -8,
    transition: {
      duration: 0.15,
    },
  },
};

export const buttonTapAnimation: Variants = {
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.05,
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.1,
    },
  },
};

export const spinningLoader: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

export const fadeInUpAnimation: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export const slideInAnimation: Variants = {
  hidden: {
    opacity: 0,
    x: -16,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },
};

export const scaleAnimation: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

export const tooltipAnimation: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 4,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
};

export const pulseAnimation: Variants = {
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const shakeAnimation: Variants = {
  animate: {
    x: [-2, 2, -2, 2, 0],
    transition: {
      duration: 0.4,
    },
  },
};

/**
 * Utility to check if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Utility function to disable animations based on user preference
 */
export const getAnimationVariant = (
  variant: Variants,
  disableAnimation: boolean = prefersReducedMotion()
) => {
  if (disableAnimation) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return variant;
};