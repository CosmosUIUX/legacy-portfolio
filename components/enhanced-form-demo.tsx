"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "@/lib/motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormFeedback } from "@/components/form-feedback"
import { FormProgress } from "@/components/form-progress"
import { useFormFeedback, useFormProgress } from "@/lib/motion/form-feedback"
import { validators, composeValidators } from "@/lib/motion/form-validation"
import { fieldGroupVariants } from "@/lib/motion/form-animations"

interface FormData {
  // Step 1: Personal Info
  firstName: string
  lastName: string
  email: string
  phone: string
  
  // Step 2: Project Details
  projectType: string
  budget: string
  timeline: string
  
  // Step 3: Requirements
  description: string
  preferences: string
  additionalNotes: string
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  projectType: "",
  budget: "",
  timeline: "",
  description: "",
  preferences: "",
  additionalNotes: ""
}

const formSteps = [
  { id: 1, title: "Personal Info", description: "Basic information" },
  { id: 2, title: "Project Details", description: "Project specifics" },
  { id: 3, title: "Requirements", description: "Detailed requirements" }
]

export function EnhancedFormDemo() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [showMultiStep, setShowMultiStep] = useState(false)

  // Form feedback management
  const formFeedback = useFormFeedback({
    onSubmissionSuccess: () => {
      console.log("Form submitted successfully!")
    },
    onSubmissionError: (error) => {
      console.error("Form submission error:", error)
    },
    successDuration: 3000,
    resetAfterSuccess: true
  })

  // Multi-step form progress
  const formProgress = useFormProgress({
    totalSteps: 3,
    validateStep: async (step) => {
      // Validate current step before allowing navigation
      switch (step) {
        case 1:
          return !!(formData.firstName && formData.lastName && formData.email)
        case 2:
          return !!(formData.projectType && formData.budget)
        case 3:
          return !!formData.description
        default:
          return true
      }
    },
    onStepChange: (step, progress) => {
      console.log(`Step changed to ${step}, progress: ${progress}%`)
    }
  })

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const simulateSubmission = async () => {
    // Simulate API call with random success/failure
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    if (Math.random() > 0.3) {
      return { success: true, data: formData }
    } else {
      throw new Error("Network error occurred")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await formFeedback.submitForm(simulateSubmission)
  }

  const handleStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formProgress.isLastStep) {
      await formFeedback.submitForm(simulateSubmission)
    } else {
      const success = await formProgress.nextStep()
      if (!success) {
        formProgress.markStepError(formProgress.currentStep, "Please fill in all required fields")
      }
    }
  }

  // Validation functions
  const emailValidator = composeValidators(
    validators.required,
    validators.email
  )

  const nameValidator = composeValidators(
    validators.required,
    validators.minLength(2)
  )

  const descriptionValidator = composeValidators(
    validators.required,
    validators.minLength(10)
  )

  const renderStep = () => {
    switch (formProgress.currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            variants={fieldGroupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                validator={nameValidator}
                showValidationIcon
                floatingLabel
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                validator={nameValidator}
                showValidationIcon
                floatingLabel
              />
            </div>
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              validator={emailValidator}
              showValidationIcon
              floatingLabel
            />
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              floatingLabel
            />
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            key="step2"
            variants={fieldGroupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold mb-4">Project Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Type</label>
                <select
                  value={formData.projectType}
                  onChange={handleInputChange('projectType')}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select project type</option>
                  <option value="interior-design">Interior Design</option>
                  <option value="renovation">Renovation</option>
                  <option value="new-construction">New Construction</option>
                  <option value="consultation">Consultation</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Budget Range</label>
                <select
                  value={formData.budget}
                  onChange={handleInputChange('budget')}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select budget range</option>
                  <option value="under-50k">Under $50,000</option>
                  <option value="50k-100k">$50,000 - $100,000</option>
                  <option value="100k-250k">$100,000 - $250,000</option>
                  <option value="250k-plus">$250,000+</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Timeline</label>
                <select
                  value={formData.timeline}
                  onChange={handleInputChange('timeline')}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select timeline</option>
                  <option value="asap">ASAP</option>
                  <option value="1-3-months">1-3 months</option>
                  <option value="3-6-months">3-6 months</option>
                  <option value="6-12-months">6-12 months</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            key="step3"
            variants={fieldGroupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold mb-4">Requirements</h3>
            <Textarea
              label="Project Description"
              value={formData.description}
              onChange={handleInputChange('description')}
              validator={descriptionValidator}
              rows={4}
              placeholder="Describe your project in detail..."
            />
            <Textarea
              label="Style Preferences"
              value={formData.preferences}
              onChange={handleInputChange('preferences')}
              rows={3}
              placeholder="What styles do you prefer? Any specific requirements?"
            />
            <Textarea
              label="Additional Notes"
              value={formData.additionalNotes}
              onChange={handleInputChange('additionalNotes')}
              rows={3}
              placeholder="Any additional information you'd like to share..."
            />
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Enhanced Form Demo</h1>
        <p className="text-muted-foreground mb-6">
          Showcasing Motion.dev form interactions with feedback animations
        </p>
        
        <div className="flex justify-center space-x-4 mb-8">
          <Button
            variant={!showMultiStep ? "default" : "outline"}
            onClick={() => setShowMultiStep(false)}
          >
            Single Step Form
          </Button>
          <Button
            variant={showMultiStep ? "default" : "outline"}
            onClick={() => setShowMultiStep(true)}
          >
            Multi-Step Form
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!showMultiStep ? (
          <motion.div
            key="single-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-8 rounded-lg border shadow-sm"
          >
            <h2 className="text-xl font-semibold mb-6">Contact Form</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  validator={nameValidator}
                  showValidationIcon
                  floatingLabel
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  validator={nameValidator}
                  showValidationIcon
                  floatingLabel
                />
              </div>
              
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                validator={emailValidator}
                showValidationIcon
                floatingLabel
              />
              
              <Textarea
                label="Message"
                value={formData.description}
                onChange={handleInputChange('description')}
                validator={descriptionValidator}
                rows={4}
                placeholder="Tell us about your project..."
              />

              <FormFeedback
                state={formFeedback.submissionState}
                message={formFeedback.submissionMessage}
                onDismiss={formFeedback.reset}
              />

              <Button
                type="submit"
                className="w-full"
                loading={formFeedback.isSubmitting}
                success={formFeedback.isSuccess}
                error={formFeedback.isError}
                loadingText="Submitting..."
                successText="Message Sent!"
                errorText="Failed to Send"
              >
                Send Message
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="multi-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-8 rounded-lg border shadow-sm"
          >
            <FormProgress
              steps={formSteps}
              currentStep={formProgress.currentStep}
              completedSteps={formProgress.completedSteps}
              stepErrors={formProgress.stepErrors}
              progress={formProgress.progress}
              onStepClick={formProgress.goToStep}
              allowStepNavigation={true}
              className="mb-8"
            />

            <form onSubmit={handleStepSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>

              <FormFeedback
                state={formFeedback.submissionState}
                message={formFeedback.submissionMessage}
                onDismiss={formFeedback.reset}
              />

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={formProgress.prevStep}
                  disabled={formProgress.isFirstStep}
                >
                  Previous
                </Button>
                
                <Button
                  type="submit"
                  loading={formFeedback.isSubmitting}
                  success={formFeedback.isSuccess}
                  error={formFeedback.isError}
                  loadingText="Processing..."
                  successText={formProgress.isLastStep ? "Submitted!" : "Next Step"}
                  errorText="Error"
                >
                  {formProgress.isLastStep ? "Submit" : "Next Step"}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}