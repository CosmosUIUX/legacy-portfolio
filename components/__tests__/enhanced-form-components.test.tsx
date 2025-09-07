import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { validators } from '@/lib/motion/form-validation'
import { MotionProvider } from '@/lib/motion/provider'

// Mock motion/react to avoid animation issues in tests
jest.mock('motion/react', () => ({
  motion: {
    button: React.forwardRef<HTMLButtonElement, any>(({ children, ...props }, ref) => (
      <button ref={ref} {...props}>{children}</button>
    )),
    input: React.forwardRef<HTMLInputElement, any>((props, ref) => (
      <input ref={ref} {...props} />
    )),
    textarea: React.forwardRef<HTMLTextAreaElement, any>((props, ref) => (
      <textarea ref={ref} {...props} />
    )),
    div: React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>{children}</div>
    )),
    label: React.forwardRef<HTMLLabelElement, any>(({ children, ...props }, ref) => (
      <label ref={ref} {...props}>{children}</label>
    )),
    span: React.forwardRef<HTMLSpanElement, any>(({ children, ...props }, ref) => (
      <span ref={ref} {...props}>{children}</span>
    ))
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn()
  })
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MotionProvider>{children}</MotionProvider>
)

describe('Enhanced Button Component', () => {
  it('renders with default props', () => {
    render(
      <TestWrapper>
        <Button>Click me</Button>
      </TestWrapper>
    )
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('shows loading state correctly', () => {
    render(
      <TestWrapper>
        <Button loading loadingText="Processing...">Submit</Button>
      </TestWrapper>
    )
    
    expect(screen.getByText(/processing/i)).toBeInTheDocument()
    expect(screen.queryByText(/submit/i)).not.toBeInTheDocument()
  })

  it('is disabled when loading', () => {
    render(
      <TestWrapper>
        <Button loading>Submit</Button>
      </TestWrapper>
    )
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('handles click events', async () => {
    const handleClick = jest.fn()
    render(
      <TestWrapper>
        <Button onClick={handleClick}>Click me</Button>
      </TestWrapper>
    )
    
    const button = screen.getByRole('button')
    await userEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})

describe('Enhanced Input Component', () => {
  it('renders with label', () => {
    render(
      <TestWrapper>
        <Input label="Email" placeholder="Enter email" />
      </TestWrapper>
    )
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument()
  })

  it('shows floating label correctly', () => {
    render(
      <TestWrapper>
        <Input label="Email" floatingLabel placeholder="Enter email" />
      </TestWrapper>
    )
    
    const input = screen.getByRole('textbox')
    const label = screen.getByText(/email/i)
    
    expect(input).toBeInTheDocument()
    expect(label).toBeInTheDocument()
  })

  it('validates input on blur', async () => {
    const onValidationChange = jest.fn()
    render(
      <TestWrapper>
        <Input
          label="Email"
          validator={validators.email}
          onValidationChange={onValidationChange}
        />
      </TestWrapper>
    )
    
    const input = screen.getByRole('textbox')
    
    // Enter invalid email
    await userEvent.type(input, 'invalid-email')
    fireEvent.blur(input)
    
    await waitFor(() => {
      expect(onValidationChange).toHaveBeenCalledWith(
        expect.objectContaining({
          isValid: false,
          state: 'error'
        })
      )
    })
  })

  it('shows validation icon when enabled', () => {
    render(
      <TestWrapper>
        <Input
          label="Email"
          value="test@example.com"
          validator={validators.email}
          showValidationIcon
        />
      </TestWrapper>
    )
    
    // Should show success icon for valid email
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('displays error message', () => {
    render(
      <TestWrapper>
        <Input
          label="Email"
          error
          errorMessage="Invalid email format"
        />
      </TestWrapper>
    )
    
    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
  })
})

describe('Enhanced Textarea Component', () => {
  it('renders with label', () => {
    render(
      <TestWrapper>
        <Textarea label="Message" placeholder="Enter message" />
      </TestWrapper>
    )
    
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter message/i)).toBeInTheDocument()
  })

  it('validates textarea on blur', async () => {
    const onValidationChange = jest.fn()
    render(
      <TestWrapper>
        <Textarea
          label="Message"
          validator={validators.required}
          onValidationChange={onValidationChange}
        />
      </TestWrapper>
    )
    
    const textarea = screen.getByRole('textbox')
    
    // Focus and blur without entering text
    fireEvent.focus(textarea)
    fireEvent.blur(textarea)
    
    await waitFor(() => {
      expect(onValidationChange).toHaveBeenCalledWith(
        expect.objectContaining({
          isValid: false,
          state: 'error'
        })
      )
    })
  })

  it('shows validation icon when enabled', () => {
    render(
      <TestWrapper>
        <Textarea
          label="Message"
          value="Valid message content"
          validator={validators.required}
          showValidationIcon
        />
      </TestWrapper>
    )
    
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('displays error message', () => {
    render(
      <TestWrapper>
        <Textarea
          label="Message"
          error
          errorMessage="Message is required"
        />
      </TestWrapper>
    )
    
    expect(screen.getByText(/message is required/i)).toBeInTheDocument()
  })

  it('handles auto-resize functionality', () => {
    render(
      <TestWrapper>
        <Textarea
          label="Message"
          autoResize
          placeholder="Type a long message..."
        />
      </TestWrapper>
    )
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('overflow-hidden')
  })
})

describe('Form Validation System', () => {
  it('validates required fields', () => {
    const result = validators.required('')
    expect(result.isValid).toBe(false)
    expect(result.state).toBe('error')
    expect(result.message).toBe('This field is required')
  })

  it('validates email format', () => {
    const validEmail = validators.email('test@example.com')
    expect(validEmail.isValid).toBe(true)
    expect(validEmail.state).toBe('success')

    const invalidEmail = validators.email('invalid-email')
    expect(invalidEmail.isValid).toBe(false)
    expect(invalidEmail.state).toBe('error')
  })

  it('validates minimum length', () => {
    const minLength5 = validators.minLength(5)
    
    const tooShort = minLength5('abc')
    expect(tooShort.isValid).toBe(false)
    expect(tooShort.state).toBe('error')

    const validLength = minLength5('abcdef')
    expect(validLength.isValid).toBe(true)
    expect(validLength.state).toBe('success')
  })

  it('validates maximum length', () => {
    const maxLength10 = validators.maxLength(10)
    
    const tooLong = maxLength10('this is too long')
    expect(tooLong.isValid).toBe(false)
    expect(tooLong.state).toBe('error')

    const validLength = maxLength10('short')
    expect(validLength.isValid).toBe(true)
    expect(validLength.state).toBe('success')
  })

  it('validates pattern matching', () => {
    const phonePattern = validators.pattern(/^\d{3}-\d{3}-\d{4}$/, 'Invalid phone format')
    
    const validPhone = phonePattern('123-456-7890')
    expect(validPhone.isValid).toBe(true)
    expect(validPhone.state).toBe('success')

    const invalidPhone = phonePattern('123456789')
    expect(invalidPhone.isValid).toBe(false)
    expect(invalidPhone.state).toBe('error')
    expect(invalidPhone.message).toBe('Invalid phone format')
  })
})