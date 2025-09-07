import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "@/lib/motion";
import { useMotion } from "@/lib/motion/hooks";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      "onDragStart" | "onDrag" | "onDragEnd"
    >,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  success?: boolean;
  successText?: string;
  error?: boolean;
  errorText?: string;
  feedbackDuration?: number;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      success = false,
      successText,
      error = false,
      errorText,
      feedbackDuration = 2000,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [showFeedback, setShowFeedback] = React.useState(false);

    // Motion.dev press animation
    const { eventHandlers } = useMotion({
      trigger: "click",
      duration: 150,
      easing: [0.4, 0, 1, 1],
    });

    // Handle feedback state changes
    React.useEffect(() => {
      if (success || error) {
        setShowFeedback(true);
        const timer = setTimeout(() => {
          setShowFeedback(false);
        }, feedbackDuration);
        return () => clearTimeout(timer);
      }
    }, [success, error, feedbackDuration]);

    const isDisabled = disabled || loading;
    const currentVariant =
      success && showFeedback
        ? "default"
        : error && showFeedback
          ? "destructive"
          : variant;

    if (asChild) {
      return (
        <Slot
          className={cn(
            buttonVariants({ variant: currentVariant, size, className }),
          )}
          ref={ref}
          {...props}
        />
      );
    }

    // Separate conflicting props from HTML props
    const {
      onAnimationStart,
      onAnimationEnd,
      onAnimationIteration,
      ...restProps
    } = props;

    const getButtonContent = () => {
      if (loading) {
        return (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
              className="mr-2"
            >
              <Loader2 size={16} />
            </motion.div>
            {loadingText || "Loading..."}
          </motion.div>
        );
      }

      if (success && showFeedback) {
        return (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
              className="mr-2"
            >
              ✓
            </motion.div>
            {successText || "Success!"}
          </motion.div>
        );
      }

      if (error && showFeedback) {
        return (
          <motion.div
            key="error"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 5 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
              className="mr-2"
            >
              ✗
            </motion.div>
            {errorText || "Error"}
          </motion.div>
        );
      }

      return (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {children}
        </motion.div>
      );
    };

    return (
      <motion.button
        className={cn(
          buttonVariants({ variant: currentVariant, size, className }),
        )}
        ref={ref}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.02 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        animate={
          success && showFeedback
            ? {
                backgroundColor: "rgb(34, 197, 94)",
                transition: { duration: 0.3 },
              }
            : error && showFeedback
              ? {
                  backgroundColor: "rgb(239, 68, 68)",
                  transition: { duration: 0.3 },
                }
              : undefined
        }
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17,
        }}
        {...eventHandlers}
        {...(restProps as any)}
      >
        <AnimatePresence mode="wait">{getButtonContent()}</AnimatePresence>
      </motion.button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
