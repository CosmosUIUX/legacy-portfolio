"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import {
  Check,
  Mail,
  Phone,
  User,
  MessageSquare,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Reveal } from "./reveal";

interface FormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  budget: string;
  timeline: string;
  message: string;
}

interface FormErrors {
  [key: string]: string;
}

export function EnhancedContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    service: "",
    budget: "",
    timeline: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.service) {
      newErrors.service = "Please select a service";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const services = [
    { value: "", label: "Select a service" },
    { value: "interior-design", label: "Interior Design" },
    { value: "development", label: "Development & Construction" },
    { value: "renovation", label: "Renovation" },
    { value: "consultation", label: "Design Consultation" },
    { value: "project-management", label: "Project Management" },
    { value: "other", label: "Other" },
  ];

  const budgetRanges = [
    { value: "", label: "Select budget range" },
    { value: "under-50k", label: "Under $50,000" },
    { value: "50k-100k", label: "$50,000 - $100,000" },
    { value: "100k-250k", label: "$100,000 - $250,000" },
    { value: "250k-500k", label: "$250,000 - $500,000" },
    { value: "500k-plus", label: "$500,000+" },
    { value: "discuss", label: "Let's discuss" },
  ];

  const timelines = [
    { value: "", label: "Select timeline" },
    { value: "asap", label: "ASAP" },
    { value: "1-3-months", label: "1-3 months" },
    { value: "3-6-months", label: "3-6 months" },
    { value: "6-12-months", label: "6-12 months" },
    { value: "12-plus-months", label: "12+ months" },
    { value: "flexible", label: "Flexible" },
  ];

  if (isSubmitted) {
    return (
      <motion.div
        className="bg-white p-8 lg:p-12 rounded-2xl shadow-sm border border-neutral-100"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center py-8">
          <motion.div
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Check size={32} className="text-green-600" />
          </motion.div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-4">
            Thank You!
          </h3>
          <p className="text-neutral-600 mb-6 leading-relaxed">
            We&apos;ve received your message and will get back to you within 24
            hours. Our team is excited to discuss your project with you.
          </p>
          <div className="bg-neutral-50 p-4 rounded-lg">
            <p className="text-sm text-neutral-600">
              <strong>What&apos;s next?</strong>
              <br />
              We&apos;ll review your project details and schedule a consultation
              call to discuss your vision, timeline, and budget.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <Reveal>
      <div className="bg-white p-8 lg:p-12 rounded-2xl shadow-sm border border-neutral-100">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Start Your Project
          </h2>
          <p className="text-neutral-600 leading-relaxed">
            Tell us about your vision and we&apos;ll help bring it to life. The
            more details you provide, the better we can understand your needs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                <User size={16} className="inline mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 ${
                  errors.name
                    ? "border-red-300 focus:ring-red-500"
                    : "border-neutral-200"
                }`}
                placeholder="Enter your full name"
              />
              <AnimatePresence>
                {errors.name && (
                  <motion.p
                    className="text-sm text-red-600 mt-1 flex items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <AlertCircle size={14} className="mr-1" />
                    {errors.name}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                <Mail size={16} className="inline mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 ${
                  errors.email
                    ? "border-red-300 focus:ring-red-500"
                    : "border-neutral-200"
                }`}
                placeholder="Enter your email address"
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    className="text-sm text-red-600 mt-1 flex items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <AlertCircle size={14} className="mr-1" />
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                <Phone size={16} className="inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label
                htmlFor="service"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Service Interest *
              </label>
              <select
                id="service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 ${
                  errors.service
                    ? "border-red-300 focus:ring-red-500"
                    : "border-neutral-200"
                }`}
              >
                {services.map((service) => (
                  <option key={service.value} value={service.value}>
                    {service.label}
                  </option>
                ))}
              </select>
              <AnimatePresence>
                {errors.service && (
                  <motion.p
                    className="text-sm text-red-600 mt-1 flex items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <AlertCircle size={14} className="mr-1" />
                    {errors.service}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="budget"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Budget Range
              </label>
              <select
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200"
              >
                {budgetRanges.map((budget) => (
                  <option key={budget.value} value={budget.value}>
                    {budget.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="timeline"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                <Calendar size={16} className="inline mr-2" />
                Timeline
              </label>
              <select
                id="timeline"
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200"
              >
                {timelines.map((timeline) => (
                  <option key={timeline.value} value={timeline.value}>
                    {timeline.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              <MessageSquare size={16} className="inline mr-2" />
              Project Details *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={6}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none transition-all duration-200 ${
                errors.message
                  ? "border-red-300 focus:ring-red-500"
                  : "border-neutral-200"
              }`}
              placeholder="Tell us about your project vision, specific requirements, style preferences, and any other details that would help us understand your needs..."
            />
            <AnimatePresence>
              {errors.message && (
                <motion.p
                  className="text-sm text-red-600 mt-1 flex items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AlertCircle size={14} className="mr-1" />
                  {errors.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-neutral-900 text-white py-4 rounded-lg font-medium hover:bg-neutral-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Sending Message...
              </>
            ) : (
              "Send Message"
            )}
          </motion.button>

          <p className="text-xs text-neutral-500 text-center">
            By submitting this form, you agree to our{" "}
            <a
              href="#"
              className="underline hover:text-neutral-700 transition-colors"
            >
              Privacy Policy
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="underline hover:text-neutral-700 transition-colors"
            >
              Terms of Service
            </a>
            .
          </p>
        </form>
      </div>
    </Reveal>
  );
}
