import { useCallback, useState } from "react"
import { useAnimation } from "@/lib/motion"

export type FormSubmissionState = 'idle' | 'submitting' | 'success' | 'error'

export interface FormFeedbackOptions {
  onSubmissionStart?: () => void
  onSubmissionSuccess?: (data?: any) => void
  onSubmissionError?: (error: Error) => void
  successDuration?: number
  errorDuration?: number
  resetAfterSuccess?: boolean
  resetAfterError?: boolean
}

export interface FormSubmissionResult {
  success: boolean
  data?: any
  error?: Error
}

/**
 * Hook for managing form submission feedback with Motion.dev animations
 */
export function useFormFeedback(options: FormFeedbackOptions = {}) {
  const [submissionState, setSubmissionState] = useState<FormSubmissionState>('idle')
  const [submissionMessage, setSubmissionMessage] = useState<string>('')
  const controls = useAnimation()

  const {
    onSubmissionStart,
    onSubmissionSuccess,
    onSubmissionError,
    successDuration = 3000,
    errorDuration = 5000,
    resetAfterSuccess = true,
    resetAfterError = true
  } = options

  const startSubmission = useCallback(async () => {
    setSubmissionState('submitting')
    setSubmissionMessage('')
    await controls.start('submitting')
    onSubmissionStart?.()
  }, [controls, onSubmissionStart])

  const handleSuccess = useCallback(async (data?: any, message?: string) => {
    setSubmissionState('success')
    setSubmissionMessage(message || 'Form submitted successfully!')
    await controls.start('success')
    onSubmissionSuccess?.(data)

    if (resetAfterSuccess) {
      setTimeout(() => {
        setSubmissionState('idle')
        setSubmissionMessage('')
        controls.start('initial')
      }, successDuration)
    }
  }, [controls, onSubmissionSuccess, resetAfterSuccess, successDuration])

  const handleError = useCallback(async (error: Error, message?: string) => {
    setSubmissionState('error')
    setSubmissionMessage(message || error.message || 'An error occurred')
    await controls.start('error')
    onSubmissionError?.(error)

    if (resetAfterError) {
      setTimeout(() => {
        setSubmissionState('idle')
        setSubmissionMessage('')
        controls.start('initial')
      }, errorDuration)
    }
  }, [controls, onSubmissionError, resetAfterError, errorDuration])

  const reset = useCallback(() => {
    setSubmissionState('idle')
    setSubmissionMessage('')
    controls.start('initial')
  }, [controls])

  const submitForm = useCallback(async (
    submitFunction: () => Promise<FormSubmissionResult>
  ) => {
    try {
      await startSubmission()
      const result = await submitFunction()
      
      if (result.success) {
        await handleSuccess(result.data)
      } else {
        await handleError(result.error || new Error('Submission failed'))
      }
    } catch (error) {
      await handleError(error as Error)
    }
  }, [startSubmission, handleSuccess, handleError])

  return {
    submissionState,
    submissionMessage,
    controls,
    startSubmission,
    handleSuccess,
    handleError,
    reset,
    submitForm,
    isSubmitting: submissionState === 'submitting',
    isSuccess: submissionState === 'success',
    isError: submissionState === 'error',
    isIdle: submissionState === 'idle'
  }
}

/**
 * Hook for managing multi-step form progress
 */
export interface UseFormProgressOptions {
  totalSteps: number
  onStepChange?: (step: number, progress: number) => void
  validateStep?: (step: number) => Promise<boolean> | boolean
}

export function useFormProgress(options: UseFormProgressOptions) {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [stepErrors, setStepErrors] = useState<Map<number, string>>(new Map())
  const progressControls = useAnimation()

  const { totalSteps, onStepChange, validateStep } = options

  const progress = (currentStep / totalSteps) * 100

  const goToStep = useCallback(async (step: number) => {
    if (step < 1 || step > totalSteps) return false

    // Validate current step before moving
    if (validateStep && currentStep !== step) {
      const isValid = await validateStep(currentStep)
      if (!isValid) return false
    }

    setCurrentStep(step)
    const newProgress = (step / totalSteps) * 100
    
    await progressControls.start({
      width: `${newProgress}%`,
      transition: { duration: 0.5, ease: "easeOut" }
    })

    onStepChange?.(step, newProgress)
    return true
  }, [currentStep, totalSteps, validateStep, progressControls, onStepChange])

  const nextStep = useCallback(async () => {
    if (currentStep < totalSteps) {
      const success = await goToStep(currentStep + 1)
      if (success) {
        setCompletedSteps(prev => new Set([...prev, currentStep]))
      }
      return success
    }
    return false
  }, [currentStep, totalSteps, goToStep])

  const prevStep = useCallback(async () => {
    if (currentStep > 1) {
      return await goToStep(currentStep - 1)
    }
    return false
  }, [currentStep, goToStep])

  const markStepComplete = useCallback((step: number) => {
    setCompletedSteps(prev => new Set([...prev, step]))
    setStepErrors(prev => {
      const newErrors = new Map(prev)
      newErrors.delete(step)
      return newErrors
    })
  }, [])

  const markStepError = useCallback((step: number, error: string) => {
    setStepErrors(prev => new Map(prev.set(step, error)))
  }, [])

  const clearStepError = useCallback((step: number) => {
    setStepErrors(prev => {
      const newErrors = new Map(prev)
      newErrors.delete(step)
      return newErrors
    })
  }, [])

  const isStepCompleted = useCallback((step: number) => {
    return completedSteps.has(step)
  }, [completedSteps])

  const getStepError = useCallback((step: number) => {
    return stepErrors.get(step)
  }, [stepErrors])

  const reset = useCallback(() => {
    setCurrentStep(1)
    setCompletedSteps(new Set())
    setStepErrors(new Map())
    progressControls.start({ width: `${(1 / totalSteps) * 100}%` })
  }, [totalSteps, progressControls])

  return {
    currentStep,
    totalSteps,
    progress,
    completedSteps,
    stepErrors,
    progressControls,
    goToStep,
    nextStep,
    prevStep,
    markStepComplete,
    markStepError,
    clearStepError,
    isStepCompleted,
    getStepError,
    reset,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
    canGoNext: currentStep < totalSteps,
    canGoPrev: currentStep > 1
  }
}