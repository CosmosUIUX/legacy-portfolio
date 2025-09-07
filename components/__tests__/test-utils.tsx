import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { MotionProvider } from "@/lib/motion/provider";

// Mock Motion.dev provider for tests
const MockMotionProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <MotionProvider
      reducedMotion={false}
      performanceMode="balanced"
      enablePerformanceMonitoring={false}
    >
      {children}
    </MotionProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: MockMotionProvider, ...options });

export * from "@testing-library/react";
export { customRender as render };
