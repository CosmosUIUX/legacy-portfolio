import { useCallback, useState } from "react";
import { useAnimation } from "framer-motion";

export type ValidationState = "neutral" | "success" | "error" | "warning";

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  state: ValidationState;
}

export interface UseFormValidationOptions {
  onValidationChange?: (result: ValidationResult) => void;
  animateOnError?: boolean;
  animateOnSuccess?: boolean;
}

/**
 * Hook for managing form validation with Motion.dev animations
 */
export function useFormValidation(options: UseFormValidationOptions = {}) {
  const [validationState, setValidationState] =
    useState<ValidationState>("neutral");
  const [validationMessage, setValidationMessage] = useState<string>("");
  const controls = useAnimation();

  const {
    onValidationChange,
    animateOnError = true,
    animateOnSuccess = true,
  } = options;

  const validate = useCallback(
    async (result: ValidationResult) => {
      setValidationState(result.state);
      setValidationMessage(result.message || "");

      // Trigger animations based on validation result
      if (result.state === "error" && animateOnError) {
        await controls.start("shake");
      } else if (result.state === "success" && animateOnSuccess) {
        await controls.start("success");
      }

      onValidationChange?.(result);
    },
    [controls, onValidationChange, animateOnError, animateOnSuccess],
  );

  const clearValidation = useCallback(() => {
    setValidationState("neutral");
    setValidationMessage("");
    controls.start("initial");
  }, [controls]);

  const triggerShake = useCallback(async () => {
    await controls.start("shake");
  }, [controls]);

  const triggerSuccess = useCallback(async () => {
    await controls.start("success");
  }, [controls]);

  const triggerError = useCallback(async () => {
    await controls.start("error");
  }, [controls]);

  return {
    validationState,
    validationMessage,
    controls,
    validate,
    clearValidation,
    triggerShake,
    triggerSuccess,
    triggerError,
    isValid: validationState === "success" || validationState === "neutral",
    hasError: validationState === "error",
    hasWarning: validationState === "warning",
  };
}

/**
 * Common validation functions
 */
export const validators = {
  required: (value: string): ValidationResult => ({
    isValid: value.trim().length > 0,
    message: value.trim().length === 0 ? "This field is required" : undefined,
    state: value.trim().length === 0 ? "error" : "success",
  }),

  email: (value: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);
    return {
      isValid,
      message: !isValid ? "Please enter a valid email address" : undefined,
      state: !isValid ? "error" : "success",
    };
  },

  minLength:
    (minLength: number) =>
    (value: string): ValidationResult => {
      const isValid = value.length >= minLength;
      return {
        isValid,
        message: !isValid
          ? `Must be at least ${minLength} characters`
          : undefined,
        state: !isValid ? "error" : "success",
      };
    },

  maxLength:
    (maxLength: number) =>
    (value: string): ValidationResult => {
      const isValid = value.length <= maxLength;
      return {
        isValid,
        message: !isValid
          ? `Must be no more than ${maxLength} characters`
          : undefined,
        state: !isValid ? "error" : "success",
      };
    },

  pattern:
    (pattern: RegExp, message: string) =>
    (value: string): ValidationResult => {
      const isValid = pattern.test(value);
      return {
        isValid,
        message: !isValid ? message : undefined,
        state: !isValid ? "error" : "success",
      };
    },
};

/**
 * Compose multiple validators
 */
export function composeValidators(
  ...validators: Array<(value: string) => ValidationResult>
) {
  return (value: string): ValidationResult => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid) {
        return result;
      }
    }
    return { isValid: true, state: "success" };
  };
}
