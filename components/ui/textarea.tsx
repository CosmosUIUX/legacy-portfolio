import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "@/lib/motion";
import { useMotion } from "@/lib/motion/hooks";
import {
  useFormValidation,
  ValidationResult,
} from "@/lib/motion/form-validation";
import {
  shakeVariants,
  colorTransitionVariants,
} from "@/lib/motion/form-animations";
import { AlertCircle, CheckCircle } from "lucide-react";

export interface TextareaProps
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "onDragStart" | "onDrag" | "onDragEnd"
  > {
  error?: boolean;
  errorMessage?: string;
  label?: string;
  autoResize?: boolean;
  validator?: (value: string) => ValidationResult;
  onValidationChange?: (result: ValidationResult) => void;
  showValidationIcon?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      error,
      errorMessage,
      label,
      autoResize = false,
      validator,
      onValidationChange,
      showValidationIcon = false,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Motion.dev focus animation
    const { eventHandlers } = useMotion({
      trigger: "focus",
      duration: 200,
      easing: [0.4, 0, 0.2, 1],
    });

    // Form validation with animations
    const validation = useFormValidation({
      onValidationChange,
      animateOnError: true,
      animateOnSuccess: false,
    });

    // Auto-resize functionality
    const adjustHeight = React.useCallback(() => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [autoResize]);

    React.useEffect(() => {
      adjustHeight();

      // Run validation if validator is provided
      if (validator && props.value !== undefined) {
        const result = validator(String(props.value));
        validation.validate(result);
      }
    }, [props.value, adjustHeight, validator, validation]);

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      eventHandlers.onFocus?.(e);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      eventHandlers.onBlur?.(e);
      props.onBlur?.(e);

      // Validate on blur if validator is provided
      if (validator && e.target.value !== undefined) {
        const result = validator(e.target.value);
        validation.validate(result);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      props.onChange?.(e);

      // Clear validation state on change to allow real-time feedback
      if (validation.hasError) {
        validation.clearValidation();
      }
    };

    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLTextAreaElement) => {
        (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        }
      },
      [ref],
    );

    const currentError = error || validation.hasError;
    const currentErrorMessage = errorMessage || validation.validationMessage;
    const validationState = error ? "error" : validation.validationState;

    return (
      <motion.div
        className="space-y-2"
        variants={shakeVariants}
        animate={validation.controls}
        initial="initial"
      >
        {label && (
          <motion.label
            className="block text-sm font-medium text-foreground"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}

        <div className="relative">
          <motion.textarea
            className={cn(
              "flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors",
              showValidationIcon && "pr-10",
              autoResize && "overflow-hidden",
              className,
            )}
            ref={combinedRef}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            whileFocus={{
              scale: 1.01,
              transition: { duration: 0.2, ease: "easeOut" },
            }}
            animate={colorTransitionVariants[validationState]}
            transition={{
              duration: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          />

          {showValidationIcon && (
            <AnimatePresence>
              {validationState === "success" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute right-3 top-3"
                >
                  <CheckCircle size={16} className="text-green-500" />
                </motion.div>
              )}
              {validationState === "error" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute right-3 top-3"
                >
                  <AlertCircle size={16} className="text-red-500" />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        <AnimatePresence>
          {currentError && currentErrorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                },
              }}
              exit={{
                opacity: 0,
                y: -10,
                scale: 0.95,
                transition: { duration: 0.15 },
              }}
              className="flex items-center text-sm text-red-600"
            >
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ delay: 0.1 }}
              >
                <AlertCircle size={14} className="mr-1" />
              </motion.div>
              <motion.span
                initial={{ x: -5 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.1 }}
              >
                {currentErrorMessage}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
