import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "@/lib/motion"
import { useMotion } from "@/lib/motion/hooks"
import { useFormValidation, ValidationResult } from "@/lib/motion/form-validation"
import { shakeVariants, colorTransitionVariants } from "@/lib/motion/form-animations"
import { AlertCircle, CheckCircle } from "lucide-react"

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onDragStart' | 'onDrag' | 'onDragEnd'> {
  error?: boolean
  errorMessage?: string
  label?: string
  floatingLabel?: boolean
  validator?: (value: string) => ValidationResult
  onValidationChange?: (result: ValidationResult) => void
  showValidationIcon?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    error, 
    errorMessage, 
    label, 
    floatingLabel = false, 
    value, 
    placeholder, 
    validator,
    onValidationChange,
    showValidationIcon = false,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(Boolean(value))
    
    // Motion.dev focus animation
    const { eventHandlers } = useMotion({
      trigger: 'focus',
      duration: 200,
      easing: [0.4, 0, 0.2, 1]
    })

    // Form validation with animations
    const validation = useFormValidation({
      onValidationChange,
      animateOnError: true,
      animateOnSuccess: false
    })

    React.useEffect(() => {
      setHasValue(Boolean(value))
      
      // Run validation if validator is provided
      if (validator && value !== undefined) {
        const result = validator(String(value))
        validation.validate(result)
      }
    }, [value, validator, validation])

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      eventHandlers.onFocus?.(e)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      eventHandlers.onBlur?.(e)
      props.onBlur?.(e)
      
      // Validate on blur if validator is provided
      if (validator && e.target.value !== undefined) {
        const result = validator(e.target.value)
        validation.validate(result)
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(Boolean(e.target.value))
      props.onChange?.(e)
      
      // Clear validation state on change to allow real-time feedback
      if (validation.hasError) {
        validation.clearValidation()
      }
    }

    const shouldFloatLabel = floatingLabel && (isFocused || hasValue)
    const currentError = error || validation.hasError
    const currentErrorMessage = errorMessage || validation.validationMessage
    const validationState = error ? 'error' : validation.validationState

    // Separate motion props from HTML props to avoid conflicts
    const { onDragStart, onDrag, onDragEnd, ...restProps } = props

    if (floatingLabel && label) {
      return (
        <motion.div 
          className="relative"
          variants={shakeVariants}
          animate={validation.controls}
          initial="initial"
        >
          <motion.input
            type={type}
            className={cn(
              "flex h-12 w-full rounded-md border bg-background px-3 pt-4 pb-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-transparent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              showValidationIcon && "pr-10",
              className
            )}
            ref={ref}
            value={value}
            placeholder={isFocused ? placeholder : ""}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            whileFocus={{
              scale: 1.01,
              transition: { duration: 0.2, ease: "easeOut" }
            }}
            animate={colorTransitionVariants[validationState]}
            transition={{ duration: 0.2, ease: "easeOut" }}
            {...restProps}
          />
          
          <motion.label
            className={cn(
              "absolute left-3 text-sm pointer-events-none transition-colors duration-200",
              currentError ? "text-red-500" : "text-muted-foreground",
              isFocused && !currentError && "text-ring"
            )}
            animate={{
              y: shouldFloatLabel ? -8 : 8,
              scale: shouldFloatLabel ? 0.85 : 1,
              color: isFocused && !currentError ? "hsl(var(--ring))" : currentError ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))"
            }}
            transition={{
              duration: 0.2,
              ease: "easeOut"
            }}
          >
            {label}
          </motion.label>

          {showValidationIcon && (
            <AnimatePresence>
              {validationState === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <CheckCircle size={16} className="text-green-500" />
                </motion.div>
              )}
              {validationState === 'error' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <AlertCircle size={16} className="text-red-500" />
                </motion.div>
              )}
            </AnimatePresence>
          )}

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
                    damping: 20
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  y: -10, 
                  scale: 0.95,
                  transition: { duration: 0.15 }
                }}
                className="flex items-center mt-2 text-sm text-red-600"
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
      )
    }

    return (
      <motion.div 
        className="space-y-2"
        variants={shakeVariants}
        animate={validation.controls}
        initial="initial"
      >
        {label && !floatingLabel && (
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
          <motion.input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              showValidationIcon && "pr-10",
              className
            )}
            ref={ref}
            value={value}
            placeholder={placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            whileFocus={{
              scale: 1.01,
              transition: { duration: 0.2, ease: "easeOut" }
            }}
            animate={colorTransitionVariants[validationState]}
            transition={{ duration: 0.2, ease: "easeOut" }}
            {...restProps}
          />

          {showValidationIcon && (
            <AnimatePresence>
              {validationState === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <CheckCircle size={16} className="text-green-500" />
                </motion.div>
              )}
              {validationState === 'error' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
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
                  damping: 20
                }
              }}
              exit={{ 
                opacity: 0, 
                y: -10, 
                scale: 0.95,
                transition: { duration: 0.15 }
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
    )
  }
)
Input.displayName = "Input"

export { Input }