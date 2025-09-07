import { render, screen } from "@testing-library/react";
import { EnhancedInfoStrip, ResponsiveInfoStrip } from "../enhanced-info-strip";
import { MotionProvider } from "@/lib/motion/provider";
import { PackageCheck, Rocket, ShieldCheck } from "lucide-react";

// Mock motion/react
jest.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
}));

// Mock motion hooks
jest.mock("@/lib/motion/hooks", () => ({
  useStaggerAnimation: () => ({
    ref: { current: null },
    getItemProps: (index: number) => ({
      animate: "visible",
      initial: "hidden",
      variants: {
        hidden: { opacity: 0, y: 30, scale: 0.9, filter: "blur(4px)" },
        visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
      },
      transition: {
        duration: 0.3,
        ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        delay: index * 0.15,
      },
    }),
    isComplete: true,
  }),
}));

const mockItems = [
  {
    icon: PackageCheck,
    text: "Free consultation",
    color: "text-green-400",
    hoverColor: "text-green-300",
    iconAnimation: "rotate" as const,
  },
  {
    icon: Rocket,
    text: "Fast project delivery",
    color: "text-amber-400",
    hoverColor: "text-amber-300",
    iconAnimation: "flip" as const,
  },
  {
    icon: ShieldCheck,
    text: "Quality guarantee",
    color: "text-blue-400",
    hoverColor: "text-blue-300",
    iconAnimation: "bounce" as const,
  },
];

const renderWithProvider = (component: React.ReactElement) => {
  return render(<MotionProvider>{component}</MotionProvider>);
};

describe("EnhancedInfoStrip", () => {
  it("renders all items correctly", () => {
    renderWithProvider(<EnhancedInfoStrip items={mockItems} />);

    expect(screen.getByText("Free consultation")).toBeInTheDocument();
    expect(screen.getByText("Fast project delivery")).toBeInTheDocument();
    expect(screen.getByText("Quality guarantee")).toBeInTheDocument();
  });

  it("applies custom stagger delay", () => {
    renderWithProvider(
      <EnhancedInfoStrip items={mockItems} staggerDelay={200} />,
    );

    expect(screen.getByText("Free consultation")).toBeInTheDocument();
  });

  it("handles different animation types", () => {
    const animationTypes = ["slide", "fade", "scale", "bounce"] as const;

    animationTypes.forEach((type) => {
      const { unmount } = renderWithProvider(
        <EnhancedInfoStrip items={mockItems} animationType={type} />,
      );

      expect(screen.getByText("Free consultation")).toBeInTheDocument();
      unmount();
    });
  });

  it("handles empty items array", () => {
    const { container } = renderWithProvider(<EnhancedInfoStrip items={[]} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithProvider(
      <EnhancedInfoStrip items={mockItems} className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("disables hover effects when specified", () => {
    renderWithProvider(
      <EnhancedInfoStrip items={mockItems} enableHoverEffects={false} />,
    );

    expect(screen.getByText("Free consultation")).toBeInTheDocument();
  });

  it("handles icon animations correctly", () => {
    renderWithProvider(
      <EnhancedInfoStrip items={mockItems} enableIconAnimations={true} />,
    );

    expect(screen.getByText("Free consultation")).toBeInTheDocument();
    expect(screen.getByText("Fast project delivery")).toBeInTheDocument();
    expect(screen.getByText("Quality guarantee")).toBeInTheDocument();
  });

  it("disables icon animations when specified", () => {
    renderWithProvider(
      <EnhancedInfoStrip items={mockItems} enableIconAnimations={false} />,
    );

    expect(screen.getByText("Free consultation")).toBeInTheDocument();
  });

  it("handles responsive stagger correctly", () => {
    renderWithProvider(
      <EnhancedInfoStrip items={mockItems} responsiveStagger={true} />,
    );

    expect(screen.getByText("Free consultation")).toBeInTheDocument();
  });
});

describe("ResponsiveInfoStrip", () => {
  it("renders correctly with responsive settings", () => {
    renderWithProvider(
      <ResponsiveInfoStrip
        items={mockItems}
        mobileAnimationType="fade"
        desktopAnimationType="slide"
      />,
    );

    expect(screen.getByText("Free consultation")).toBeInTheDocument();
    expect(screen.getByText("Fast project delivery")).toBeInTheDocument();
    expect(screen.getByText("Quality guarantee")).toBeInTheDocument();
  });

  it("handles different mobile and desktop animation types", () => {
    renderWithProvider(
      <ResponsiveInfoStrip
        items={mockItems}
        mobileAnimationType="scale"
        desktopAnimationType="bounce"
      />,
    );

    expect(screen.getByText("Free consultation")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithProvider(
      <ResponsiveInfoStrip items={mockItems} className="responsive-class" />,
    );

    expect(container.firstChild).toHaveClass("responsive-class");
  });

  it("handles icon animations in responsive mode", () => {
    renderWithProvider(
      <ResponsiveInfoStrip items={mockItems} enableIconAnimations={true} />,
    );

    expect(screen.getByText("Free consultation")).toBeInTheDocument();
  });

  it("disables icon animations when specified", () => {
    renderWithProvider(
      <ResponsiveInfoStrip items={mockItems} enableIconAnimations={false} />,
    );

    expect(screen.getByText("Free consultation")).toBeInTheDocument();
  });
});
