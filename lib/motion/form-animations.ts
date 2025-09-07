import { Variants } from "@/lib/motion"

/**
 * Form validation animation variants for Motion.dev
 */

// Shake animation for validation errors
export const shakeVariants: Variants = {
  initial: { x: 0 },
  shake: {
    x: [-10, 10, -10, 10, -5, 5, 0],
    transition: {
      duration: 0.6,
      ease: "easeInOut"
    }
  }
}

// Success animation for form submissions
export const successVariants: Variants = {
  initial: { scale: 1, opacity: 1 },
  success: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
}

// Error pulse animation
export const errorPulseVariants: Variants = {
  initial: { scale: 1 },
  error: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 0.3,
      ease: "easeInOut",
      repeat: 2
    }
  }
}

// Loading state animation
export const loadingVariants: Variants = {
  initial: { opacity: 1 },
  loading: {
    opacity: [1, 0.6, 1],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity
    }
  }
}

// Field focus animation
export const focusVariants: Variants = {
  initial: { 
    scale: 1,
    boxShadow: "0 0 0 0px rgba(59, 130, 246, 0)"
  },
  focused: {
    scale: 1.01,
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
}

// Color transition variants for validation states
export const colorTransitionVariants = {
  neutral: {
    borderColor: "hsl(var(--border))",
    backgroundColor: "hsl(var(--background))"
  },
  success: {
    borderColor: "rgb(34, 197, 94)",
    backgroundColor: "rgba(34, 197, 94, 0.05)"
  },
  error: {
    borderColor: "rgb(239, 68, 68)",
    backgroundColor: "rgba(239, 68, 68, 0.05)"
  },
  warning: {
    borderColor: "rgb(245, 158, 11)",
    backgroundColor: "rgba(245, 158, 11, 0.05)"
  }
}

// Form submission animation presets
export const formSubmissionPresets = {
  // Button press animation
  buttonPress: {
    scale: 0.95,
    transition: { duration: 0.1, ease: "easeInOut" }
  },
  
  // Button release animation
  buttonRelease: {
    scale: 1,
    transition: { duration: 0.1, ease: "easeInOut" }
  },
  
  // Success feedback
  submitSuccess: {
    backgroundColor: "rgb(34, 197, 94)",
    color: "white",
    transition: { duration: 0.3, ease: "easeOut" }
  },
  
  // Error feedback
  submitError: {
    backgroundColor: "rgb(239, 68, 68)",
    color: "white",
    transition: { duration: 0.3, ease: "easeOut" }
  }
}

// Form submission feedback animations
export const submissionFeedbackVariants: Variants = {
  initial: { 
    scale: 1, 
    opacity: 1,
    y: 0
  },
  submitting: {
    scale: 0.98,
    opacity: 0.8,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  success: {
    scale: [1, 1.05, 1],
    backgroundColor: ["hsl(var(--primary))", "rgb(34, 197, 94)", "rgb(34, 197, 94)"],
    transition: { 
      duration: 0.6, 
      ease: "easeOut",
      backgroundColor: { duration: 0.3 }
    }
  },
  error: {
    x: [-5, 5, -5, 5, 0],
    backgroundColor: ["hsl(var(--primary))", "rgb(239, 68, 68)", "hsl(var(--primary))"],
    transition: { 
      duration: 0.6, 
      ease: "easeInOut",
      backgroundColor: { duration: 0.8 }
    }
  }
}

// Progress bar animations for multi-step forms
export const progressVariants: Variants = {
  initial: { width: "0%" },
  progress: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  })
}

// Step indicator animations
export const stepIndicatorVariants: Variants = {
  inactive: {
    scale: 1,
    backgroundColor: "hsl(var(--muted))",
    borderColor: "hsl(var(--border))"
  },
  active: {
    scale: 1.1,
    backgroundColor: "hsl(var(--primary))",
    borderColor: "hsl(var(--primary))",
    transition: { duration: 0.3, ease: "easeOut" }
  },
  completed: {
    scale: 1,
    backgroundColor: "rgb(34, 197, 94)",
    borderColor: "rgb(34, 197, 94)",
    transition: { duration: 0.3, ease: "easeOut" }
  }
}

// Form field group animations
export const fieldGroupVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    height: 0
  },
  visible: {
    opacity: 1,
    y: 0,
    height: "auto",
    transition: {
      duration: 0.4,
      ease: "easeOut",
      height: { duration: 0.3 }
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    height: 0,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
}

// Success message animations
export const successMessageVariants: Variants = {
  initial: { 
    opacity: 0, 
    scale: 0.8, 
    y: 20 
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      delay: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -10,
    transition: { duration: 0.2 }
  }
}

// Error message animations
export const errorMessageVariants: Variants = {
  initial: { 
    opacity: 0, 
    x: -10,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    x: 10,
    scale: 0.95,
    transition: { duration: 0.15 }
  }
}

/**
 * Animation timing constants
 */
export const ANIMATION_TIMINGS = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.6,
  
  // Specific form interactions
  fieldFocus: 0.2,
  validation: 0.4,
  submission: 0.6,
  feedback: 0.8
} as const

/**
 * Easing presets for form animations
 */
export const FORM_EASINGS = {
  smooth: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  sharp: [0.4, 0, 1, 1],
  gentle: [0.25, 0.46, 0.45, 0.94]
} as const