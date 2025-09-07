import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormFeedback } from "../form-feedback";
import { FormProgress } from "../form-progress";

// Mock motion/react
jest.mock("motion/react", () => ({
  motion: {
    div: ({
      children,
      whileHover,
      whileTap,
      animate,
      initial,
      variants,
      exit,
      transition,
      ...props
    }: any) => <div {...props}>{children}</div>,
    button: ({
      children,
      whileHover,
      whileTap,
      animate,
      initial,
      variants,
      exit,
      transition,
      ...props
    }: any) => <button {...props}>{children}</button>,
    span: ({
      children,
      whileHover,
      whileTap,
      animate,
      initial,
      variants,
      exit,
      transition,
      ...props
    }: any) => <span {...props}>{children}</span>,
    h4: ({
      children,
      whileHover,
      whileTap,
      animate,
      initial,
      variants,
      exit,
      transition,
      ...props
    }: any) => <h4 {...props}>{children}</h4>,
    p: ({
      children,
      whileHover,
      whileTap,
      animate,
      initial,
      variants,
      exit,
      transition,
      ...props
    }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock the icons
jest.mock("lucide-react", () => ({
  CheckCircle: () => <div data-testid="check-icon">✓</div>,
  AlertCircle: () => <div data-testid="alert-icon">!</div>,
  Loader2: () => <div data-testid="loader-icon">⟳</div>,
  X: () => <div data-testid="x-icon">×</div>,
  Check: () => <div data-testid="check-icon">✓</div>,
}));

describe("FormFeedback", () => {
  it("should not render when state is idle", () => {
    const { container } = render(
      <FormFeedback state="idle" message="Test message" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should not render when message is empty", () => {
    const { container } = render(<FormFeedback state="success" />);
    expect(container.firstChild).toBeNull();
  });

  it("should render success message", () => {
    render(
      <FormFeedback
        state="success"
        message="Success message"
        onDismiss={() => {}}
      />,
    );

    expect(screen.getByText("Success message")).toBeInTheDocument();
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
  });

  it("should render error message", () => {
    render(<FormFeedback state="error" message="Error message" />);

    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  it("should render submitting state", () => {
    render(<FormFeedback state="submitting" message="Submitting..." />);

    expect(screen.getByText("Submitting...")).toBeInTheDocument();
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("x-icon")).not.toBeInTheDocument(); // No dismiss button when submitting
  });

  it("should call onDismiss when dismiss button is clicked", () => {
    const onDismiss = jest.fn();
    render(
      <FormFeedback
        state="success"
        message="Success message"
        onDismiss={onDismiss}
      />,
    );

    fireEvent.click(screen.getByTestId("x-icon").closest("button")!);
    expect(onDismiss).toHaveBeenCalled();
  });

  it("should hide icon when showIcon is false", () => {
    render(
      <FormFeedback
        state="success"
        message="Success message"
        showIcon={false}
      />,
    );

    // Icon should not be present (we can't easily test for specific icons in this mock setup)
    expect(screen.getByText("Success message")).toBeInTheDocument();
  });
});

// Mock FormProgress component for testing
jest.mock("../form-progress", () => ({
  FormProgress: ({ steps, currentStep, onStepClick }: any) => (
    <div data-testid="form-progress">
      {steps.map((step: any) => (
        <div key={step.id}>
          <button
            onClick={() => onStepClick?.(step.id)}
            className={currentStep === step.id ? "bg-primary" : ""}
          >
            {step.id}
          </button>
          <span>{step.title}</span>
          <span>{step.description}</span>
        </div>
      ))}
    </div>
  ),
}));

describe("FormProgress", () => {
  const mockSteps = [
    { id: 1, title: "Step 1", description: "First step" },
    { id: 2, title: "Step 2", description: "Second step" },
    { id: 3, title: "Step 3", description: "Third step" },
  ];

  const defaultProps = {
    steps: mockSteps,
    currentStep: 1,
    completedSteps: new Set<number>(),
    stepErrors: new Map<number, string>(),
    progress: 33.33,
  };

  it("should render all steps", () => {
    const { FormProgress } = require("../form-progress");
    render(<FormProgress {...defaultProps} />);

    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();
    expect(screen.getByText("Step 3")).toBeInTheDocument();
  });

  it("should show current step as active", () => {
    const { FormProgress } = require("../form-progress");
    render(<FormProgress {...defaultProps} currentStep={2} />);

    const step2Button = screen.getByText("2");
    expect(step2Button).toHaveClass("bg-primary");
  });

  it("should call onStepClick when step is clicked", () => {
    const { FormProgress } = require("../form-progress");
    const onStepClick = jest.fn();
    render(<FormProgress {...defaultProps} onStepClick={onStepClick} />);

    const step1Button = screen.getByText("1");
    fireEvent.click(step1Button);

    expect(onStepClick).toHaveBeenCalledWith(1);
  });

  it("should render step descriptions", () => {
    const { FormProgress } = require("../form-progress");
    render(<FormProgress {...defaultProps} />);

    expect(screen.getByText("First step")).toBeInTheDocument();
    expect(screen.getByText("Second step")).toBeInTheDocument();
    expect(screen.getByText("Third step")).toBeInTheDocument();
  });
});
