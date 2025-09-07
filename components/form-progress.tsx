"use client"

import React from "react"
import { motion } from "@/lib/motion"
import { Check, AlertCircle } from "lucide-react"
import { stepIndicatorVariants } from "@/lib/motion/form-animations"

export interface FormStep {
  id: number
  title: string
  description?: string
}

export interface FormProgressProps {
  steps: FormStep[]
  currentStep: number
  completedSteps: Set<number>
  stepErrors: Map<number, string>
  progress: number
  onStepClick?: (step: number) => void
  allowStepNavigation?: boolean
  className?: string
}

export function FormProgress({
  steps,
  currentStep,
  completedSteps,
  stepErrors,
  progress,
  onStepClick,
  allowStepNavigation = false,
  className = ""
}: FormProgressProps) {
  const getStepState = (stepId: number) => {
    if (stepErrors.has(stepId)) return 'error'
    if (completedSteps.has(stepId)) return 'completed'
    if (stepId === currentStep) return 'active'
    return 'inactive'
  }

  const getStepStyles = (state: string) => {
    switch (state) {
      case 'active':
        return "bg-primary text-primary-foreground border-primary"
      case 'completed':
        return "bg-green-500 text-white border-green-500"
      case 'error':
        return "bg-red-500 text-white border-red-500"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const handleStepClick = (stepId: number) => {
    if (allowStepNavigation && onStepClick) {
      onStepClick(stepId)
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar */}
      <div className="relative mb-8">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-start">
        {steps.map((step, index) => {
          const state = getStepState(step.id)
          const isClickable = allowStepNavigation && (
            completedSteps.has(step.id) || 
            step.id === currentStep ||
            step.id < currentStep
          )

          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <motion.button
                className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center
                  text-sm font-medium transition-colors relative z-10
                  ${getStepStyles(state)}
                  ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                `}
                variants={stepIndicatorVariants}
                animate={state}
                onClick={() => handleStepClick(step.id)}
                disabled={!isClickable}
                whileHover={isClickable ? { scale: 1.05 } : undefined}
                whileTap={isClickable ? { scale: 0.95 } : undefined}
              >
                {state === 'completed' ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Check size={16} />
                  </motion.div>
                ) : state === 'error' ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <AlertCircle size={16} />
                  </motion.div>
                ) : (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {step.id}
                  </motion.span>
                )}
              </motion.button>

              {/* Step Content */}
              <div className="mt-3 text-center max-w-24">
                <motion.h4
                  className={`
                    text-xs font-medium
                    ${state === 'active' ? 'text-primary' : 
                      state === 'completed' ? 'text-green-600' :
                      state === 'error' ? 'text-red-600' :
                      'text-muted-foreground'}
                  `}
                  animate={{
                    color: state === 'active' ? 'hsl(var(--primary))' :
                           state === 'completed' ? 'rgb(34, 197, 94)' :
                           state === 'error' ? 'rgb(239, 68, 68)' :
                           'hsl(var(--muted-foreground))'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {step.title}
                </motion.h4>
                
                {step.description && (
                  <motion.p
                    className="text-xs text-muted-foreground mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: state === 'active' ? 1 : 0.7 }}
                    transition={{ duration: 0.3 }}
                  >
                    {step.description}
                  </motion.p>
                )}

                {/* Error Message */}
                {stepErrors.has(step.id) && (
                  <motion.p
                    className="text-xs text-red-600 mt-1"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    {stepErrors.get(step.id)}
                  </motion.p>
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-0.5 bg-muted -z-10">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{
                      width: completedSteps.has(step.id) ? "100%" : "0%"
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}