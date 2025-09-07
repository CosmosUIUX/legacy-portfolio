"use client";

import React from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import { CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import { FormSubmissionState } from "@/lib/motion/form-feedback";
import {
  successMessageVariants,
  errorMessageVariants,
} from "@/lib/motion/form-animations";

export interface FormFeedbackProps {
  state: FormSubmissionState;
  message?: string;
  onDismiss?: () => void;
  showIcon?: boolean;
  className?: string;
}

export function FormFeedback({
  state,
  message,
  onDismiss,
  showIcon = true,
  className = "",
}: FormFeedbackProps) {
  if (state === "idle" || !message) return null;

  const getIcon = () => {
    switch (state) {
      case "submitting":
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, ease: "linear" }}
          >
            <Loader2 size={16} />
          </motion.div>
        );
      case "success":
        return <CheckCircle size={16} />;
      case "error":
        return <AlertCircle size={16} />;
      default:
        return null;
    }
  };

  const getStyles = () => {
    switch (state) {
      case "submitting":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "success":
        return "bg-green-50 text-green-700 border-green-200";
      case "error":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const variants =
    state === "success" ? successMessageVariants : errorMessageVariants;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={`
          flex items-center justify-between p-3 rounded-lg border text-sm
          ${getStyles()}
          ${className}
        `}
      >
        <div className="flex items-center space-x-2">
          {showIcon && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
            >
              {getIcon()}
            </motion.div>
          )}
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            {message}
          </motion.span>
        </div>

        {onDismiss && state !== "submitting" && (
          <motion.button
            onClick={onDismiss}
            className="ml-2 p-1 hover:bg-black/10 rounded transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <X size={14} />
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
