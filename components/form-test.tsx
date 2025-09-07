"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormFeedback } from "@/components/form-feedback";
import { useFormFeedback } from "@/lib/motion/form-feedback";
import { validators } from "@/lib/motion/form-validation";

export function FormTest() {
  const [inputValue, setInputValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");

  const formFeedback = useFormFeedback({
    successDuration: 2000,
    errorDuration: 3000,
  });

  const simulateSubmission = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (Math.random() > 0.5) {
      return {
        success: true,
        data: { input: inputValue, textarea: textareaValue },
      };
    } else {
      throw new Error("Random submission error for testing");
    }
  };

  const handleTestSubmit = () => {
    formFeedback.submitForm(simulateSubmission);
  };

  const handleSuccessTest = () => {
    formFeedback.handleSuccess(undefined, "Success feedback test!");
  };

  const handleErrorTest = () => {
    formFeedback.handleError(new Error("Error feedback test!"));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Form Components Test</h2>

      <div className="space-y-4">
        <Input
          label="Standard Input"
          placeholder="Enter text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />

        <Input
          label="Floating Label Input"
          placeholder="Enter text"
          floatingLabel
          showValidationIcon
          validator={validators.required}
        />

        <Input
          label="Email Validation"
          type="email"
          placeholder="Enter email"
          floatingLabel
          showValidationIcon
          validator={validators.email}
        />

        <Textarea
          label="Test Textarea"
          placeholder="Enter message"
          value={textareaValue}
          onChange={(e) => setTextareaValue(e.target.value)}
          validator={validators.minLength(10)}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Button States</h3>

        <div className="flex flex-wrap gap-3">
          <Button>Normal Button</Button>
          <Button loading>Loading Button</Button>
          <Button success>Success Button</Button>
          <Button error>Error Button</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Form Feedback Test</h3>

        <FormFeedback
          state={formFeedback.submissionState}
          message={formFeedback.submissionMessage}
          onDismiss={formFeedback.reset}
        />

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleTestSubmit}
            loading={formFeedback.isSubmitting}
            success={formFeedback.isSuccess}
            error={formFeedback.isError}
            loadingText="Submitting..."
            successText="Submitted!"
            errorText="Failed"
          >
            Test Form Submission
          </Button>

          <Button variant="outline" onClick={handleSuccessTest}>
            Test Success
          </Button>

          <Button variant="outline" onClick={handleErrorTest}>
            Test Error
          </Button>

          <Button variant="outline" onClick={formFeedback.reset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
