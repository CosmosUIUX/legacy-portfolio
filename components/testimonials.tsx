"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react"
import { Reveal } from "./reveal"

interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  content: string
  rating: number
  image: string
  project: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Homeowner",
    company: "Private Client",
    content: "Legacy transformed our 1920s home into a modern masterpiece while preserving its historical charm. Their attention to detail and understanding of our vision was exceptional. We couldn't be happier with the result.",
    rating: 5,
    image: "/testimonial-1.jpg",
    project: "Historic Home Renovation"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "CEO",
    company: "TechFlow Solutions",
    content: "The office redesign has completely transformed our company culture. Employee satisfaction is up 45% and our clients are constantly impressed by the space. Legacy delivered beyond our expectations.",
    rating: 5,
    image: "/testimonial-2.jpg",
    project: "Corporate Office Redesign"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Restaurant Owner",
    company: "Harvest & Hearth",
    content: "Legacy created an atmosphere that perfectly complements our cuisine. The design is both functional and beautiful, and our customers love the ambiance. It's been instrumental in our success.",
    rating: 5,
    image: "/testimonial-3.jpg",
    project: "Restaurant Interior Design"
  },
  {
    id: 4,
    name: "David Thompson",
    role: "Property Developer",
    company: "Artisan Hospitality Group",
    content: "Working with Legacy on our boutique hotel was a game-changer. Their expertise in hospitality design and project management ensured we opened on time and within budget. The results speak for themselves.",
    rating: 5,
    image: "/testimonial-4.jpg",
    project: "Boutique Hotel Development"
  }
]

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <section className="py-20 lg:py-32 bg-neutral-50">
      <div className="container-custom">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
              What Our <span className="italic font-light">Clients Say</span>
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Don&apos;t just take our word for it. Here&apos;s what our clients have to say about working with Legacy.
            </p>
          </div>
        </Reveal>

        <div className="relative max-w-4xl mx-auto">
          {/* Main Testimonial */}
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-8 lg:p-12 rounded-2xl shadow-sm border border-neutral-100"
              >
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                  {/* Client Photo */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                      <span className="text-neutral-500 text-sm">Photo</span>
                    </div>
                  </div>

                  {/* Testimonial Content */}
                  <div className="flex-1 text-center lg:text-left">
                    {/* Quote Icon */}
                    <Quote className="text-neutral-300 mb-4 mx-auto lg:mx-0" size={32} />
                    
                    {/* Rating */}
                    <div className="flex justify-center lg:justify-start mb-4">
                      {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                        <Star key={i} className="text-yellow-400 fill-current" size={20} />
                      ))}
                    </div>

                    {/* Content */}
                    <blockquote className="text-lg lg:text-xl text-neutral-700 leading-relaxed mb-6 italic">
                      &ldquo;{testimonials[currentIndex].content}&rdquo;
                    </blockquote>

                    {/* Client Info */}
                    <div className="space-y-1">
                      <div className="font-bold text-neutral-900 text-lg">
                        {testimonials[currentIndex].name}
                      </div>
                      <div className="text-neutral-600">
                        {testimonials[currentIndex].role} at {testimonials[currentIndex].company}
                      </div>
                      <div className="text-sm text-neutral-500">
                        Project: {testimonials[currentIndex].project}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={prevTestimonial}
              className="p-3 bg-white rounded-full shadow-sm border border-neutral-200 hover:bg-neutral-50 transition-colors duration-200"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Dots Indicator */}
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    currentIndex === index ? "bg-neutral-900" : "bg-neutral-300 hover:bg-neutral-400"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="p-3 bg-white rounded-full shadow-sm border border-neutral-200 hover:bg-neutral-50 transition-colors duration-200"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <Reveal delay={0.2}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-center">
            {[
              { number: "98%", label: "Client Satisfaction" },
              { number: "150+", label: "Projects Completed" },
              { number: "4.9/5", label: "Average Rating" },
              { number: "95%", label: "Repeat Clients" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-neutral-600 font-medium text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}