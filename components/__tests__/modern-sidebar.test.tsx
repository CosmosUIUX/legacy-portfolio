import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ModernSidebar } from "../modern-sidebar";
import { MotionProvider } from "@/lib/motion/provider";

// Mock the TransitionLink component
jest.mock("../transition-layout", () => ({
  TransitionLink: ({ children, href, onClick, className }: any) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}));

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className }: any) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  ),
}));

// Mock Motion.dev hooks to avoid scroll ref issues in tests
jest.mock("@/lib/motion/hooks", () => ({
  useStaggerAnimation: () => ({
    ref: { current: null },
    startAnimation: jest.fn(),
    resetAnimation: jest.fn(),
    getItemProps: (index: number) => ({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { delay: index * 0.1 },
    }),
  }),
  useMotion: () => ({
    ref: { current: null },
    isActive: true,
    animationProps: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    },
    eventHandlers: {},
  }),
}));

const renderWithMotionProvider = (component: React.ReactElement) => {
  return render(
    <MotionProvider reducedMotion={true}>{component}</MotionProvider>,
  );
};

describe("ModernSidebar", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it("renders when isOpen is true", () => {
    renderWithMotionProvider(
      <ModernSidebar isOpen={true} onClose={mockOnClose} />,
    );

    expect(screen.getByText("LEGACY")).toBeInTheDocument();
    expect(screen.getByText("INTERIORS & DEVELOPERS")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    renderWithMotionProvider(
      <ModernSidebar isOpen={false} onClose={mockOnClose} />,
    );

    expect(screen.queryByText("LEGACY")).not.toBeInTheDocument();
  });

  it("renders all menu items", () => {
    renderWithMotionProvider(
      <ModernSidebar isOpen={true} onClose={mockOnClose} />,
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About Us")).toBeInTheDocument();
    expect(screen.getByText("Interior Design")).toBeInTheDocument();
    expect(screen.getByText("Development")).toBeInTheDocument();
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("renders contact information", () => {
    renderWithMotionProvider(
      <ModernSidebar isOpen={true} onClose={mockOnClose} />,
    );

    expect(screen.getByText("Get In Touch")).toBeInTheDocument();
    expect(screen.getByText("hello@legacy.com")).toBeInTheDocument();
    expect(screen.getByText("+1 (555) 123-4567")).toBeInTheDocument();
    expect(screen.getByText("New York, NY")).toBeInTheDocument();
    expect(screen.getByText("Mon-Fri 9AM-6PM")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    renderWithMotionProvider(
      <ModernSidebar isOpen={true} onClose={mockOnClose} />,
    );

    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked", () => {
    renderWithMotionProvider(
      <ModernSidebar isOpen={true} onClose={mockOnClose} />,
    );

    // The backdrop is the first div with fixed positioning
    const backdrop = document.querySelector(".fixed.inset-0");
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it("has proper accessibility attributes", () => {
    renderWithMotionProvider(
      <ModernSidebar isOpen={true} onClose={mockOnClose} />,
    );

    const logo = screen.getByAltText("Legacy Logo");
    expect(logo).toBeInTheDocument();
  });
});
