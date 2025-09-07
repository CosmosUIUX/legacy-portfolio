import { renderHook, act } from '@testing-library/react'
import { useFormFeedback, useFormProgress } from '../form-feedback'

describe('useFormFeedback', () => {
  it('should initialize with idle state', () => {
    const { result } = renderHook(() => useFormFeedback())
    
    expect(result.current.submissionState).toBe('idle')
    expect(result.current.submissionMessage).toBe('')
    expect(result.current.isIdle).toBe(true)
    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.isSuccess).toBe(false)
    expect(result.current.isError).toBe(false)
  })

  it('should handle successful submission', async () => {
    const onSubmissionSuccess = jest.fn()
    const { result } = renderHook(() => 
      useFormFeedback({ onSubmissionSuccess })
    )

    await act(async () => {
      await result.current.handleSuccess({ data: 'test' }, 'Success message')
    })

    expect(result.current.submissionState).toBe('success')
    expect(result.current.submissionMessage).toBe('Success message')
    expect(result.current.isSuccess).toBe(true)
    expect(onSubmissionSuccess).toHaveBeenCalledWith({ data: 'test' })
  })

  it('should handle error submission', async () => {
    const onSubmissionError = jest.fn()
    const { result } = renderHook(() => 
      useFormFeedback({ onSubmissionError })
    )

    const error = new Error('Test error')
    await act(async () => {
      await result.current.handleError(error, 'Error message')
    })

    expect(result.current.submissionState).toBe('error')
    expect(result.current.submissionMessage).toBe('Error message')
    expect(result.current.isError).toBe(true)
    expect(onSubmissionError).toHaveBeenCalledWith(error)
  })

  it('should handle form submission with success', async () => {
    const { result } = renderHook(() => useFormFeedback())

    const mockSubmitFunction = jest.fn().mockResolvedValue({
      success: true,
      data: { test: 'data' }
    })

    await act(async () => {
      await result.current.submitForm(mockSubmitFunction)
    })

    expect(mockSubmitFunction).toHaveBeenCalled()
    expect(result.current.submissionState).toBe('success')
  })

  it('should handle form submission with error', async () => {
    const { result } = renderHook(() => useFormFeedback())

    const mockSubmitFunction = jest.fn().mockResolvedValue({
      success: false,
      error: new Error('Submission failed')
    })

    await act(async () => {
      await result.current.submitForm(mockSubmitFunction)
    })

    expect(mockSubmitFunction).toHaveBeenCalled()
    expect(result.current.submissionState).toBe('error')
  })

  it('should reset state', async () => {
    const { result } = renderHook(() => useFormFeedback())

    // Set to success state first
    await act(async () => {
      await result.current.handleSuccess()
    })

    expect(result.current.submissionState).toBe('success')

    // Reset
    act(() => {
      result.current.reset()
    })

    expect(result.current.submissionState).toBe('idle')
    expect(result.current.submissionMessage).toBe('')
  })
})

describe('useFormProgress', () => {
  const mockOptions = {
    totalSteps: 3,
    onStepChange: jest.fn(),
    validateStep: jest.fn().mockResolvedValue(true)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with first step', () => {
    const { result } = renderHook(() => useFormProgress(mockOptions))
    
    expect(result.current.currentStep).toBe(1)
    expect(result.current.totalSteps).toBe(3)
    expect(result.current.progress).toBeCloseTo(33.33, 2) // 1/3 * 100
    expect(result.current.isFirstStep).toBe(true)
    expect(result.current.isLastStep).toBe(false)
  })

  it('should navigate to next step', async () => {
    const { result } = renderHook(() => useFormProgress(mockOptions))

    await act(async () => {
      const success = await result.current.nextStep()
      expect(success).toBe(true)
    })

    expect(result.current.currentStep).toBe(2)
    expect(result.current.completedSteps.has(1)).toBe(true)
    expect(mockOptions.onStepChange).toHaveBeenCalledWith(2, expect.closeTo(66.67, 2))
  })

  it('should navigate to previous step', async () => {
    const { result } = renderHook(() => useFormProgress(mockOptions))

    // Go to step 2 first
    await act(async () => {
      await result.current.nextStep()
    })

    // Then go back
    await act(async () => {
      const success = await result.current.prevStep()
      expect(success).toBe(true)
    })

    expect(result.current.currentStep).toBe(1)
  })

  it('should not go to next step if validation fails', async () => {
    const failingValidation = jest.fn().mockResolvedValue(false)
    const { result } = renderHook(() => 
      useFormProgress({ ...mockOptions, validateStep: failingValidation })
    )

    await act(async () => {
      const success = await result.current.nextStep()
      expect(success).toBe(false)
    })

    expect(result.current.currentStep).toBe(1)
    expect(failingValidation).toHaveBeenCalledWith(1)
  })

  it('should mark step as completed', () => {
    const { result } = renderHook(() => useFormProgress(mockOptions))

    act(() => {
      result.current.markStepComplete(1)
    })

    expect(result.current.isStepCompleted(1)).toBe(true)
  })

  it('should mark step error and clear it', () => {
    const { result } = renderHook(() => useFormProgress(mockOptions))

    act(() => {
      result.current.markStepError(1, 'Test error')
    })

    expect(result.current.getStepError(1)).toBe('Test error')

    act(() => {
      result.current.clearStepError(1)
    })

    expect(result.current.getStepError(1)).toBeUndefined()
  })

  it('should reset progress', () => {
    const { result } = renderHook(() => useFormProgress(mockOptions))

    // Navigate to step 2 and mark step 1 complete
    act(() => {
      result.current.markStepComplete(1)
    })

    // Reset
    act(() => {
      result.current.reset()
    })

    expect(result.current.currentStep).toBe(1)
    expect(result.current.completedSteps.size).toBe(0)
    expect(result.current.stepErrors.size).toBe(0)
  })

  it('should handle boundary conditions', async () => {
    const { result } = renderHook(() => useFormProgress(mockOptions))

    // Can't go to previous step from first step
    await act(async () => {
      const success = await result.current.prevStep()
      expect(success).toBe(false)
    })

    // Navigate to last step
    await act(async () => {
      await result.current.goToStep(3)
    })

    expect(result.current.isLastStep).toBe(true)
    expect(result.current.canGoNext).toBe(false)

    // Can't go to next step from last step
    await act(async () => {
      const success = await result.current.nextStep()
      expect(success).toBe(false)
    })
  })
})