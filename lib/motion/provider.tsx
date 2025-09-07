"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Simple motion context
const MotionContext = createContext<{ 
  reducedMotion: boolean;
  shouldAnimate: boolean;
  performanceMode: string;
  getDuration: (preset: string | number) => number;
  getEasing: (preset: string) => any;
} | null>(null);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check for reduced motion preference
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mediaQuery.matches);
      
      const handleChange = (e: MediaQueryListEvent) => {
        setReducedMotion(e.matches);
      };
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <MotionContext.Provider value={{ 
      reducedMotion, 
      shouldAnimate: !reducedMotion,
      performanceMode: "balanced",
      getDuration: (preset: string | number) => typeof preset === 'number' ? preset : 300,
      getEasing: () => "easeInOut"
    }}>
      {children}
    </MotionContext.Provider>
  );
}

export function useMotionContext() {
  const context = useContext(MotionContext);
  return context || { 
    reducedMotion: false, 
    shouldAnimate: true, 
    performanceMode: "balanced",
    getDuration: (preset: string | number) => typeof preset === 'number' ? preset : 300,
    getEasing: () => "easeInOut"
  };
}

// Alias for backward compatibility
export const useMotionSettings = useMotionContext;
