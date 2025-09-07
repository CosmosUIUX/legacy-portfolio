"use client"

import React from "react"
import { PageTransition, SectionTransition, usePageTransition, useFocusManagement, TransitionProgress } from "./page-transition"
import { motion } from "@/lib/motion"

export function PageTransitionDemo() {
  const [currentPage, setCurrentPage] = React.useState('home')
  const [loading, setLoading] = React.useState(false)
  const { 
    isTransitioning, 
    transitionProgress, 
    startTransition, 
    navigateWithTransition 
  } = usePageTransition()
  const { focusMainContent } = useFocusManagement()

  const handlePageChange = (page: string) => {
    setLoading(true)
    startTransition('forward', { 
      showLoading: true,
      onProgress: (progress) => {
        if (progress >= 100) {
          setCurrentPage(page)
          setLoading(false)
          focusMainContent()
        }
      }
    })
  }

  const pages = {
    home: {
      title: "Home Page",
      content: "Welcome to the enhanced page transition demo using Motion.dev components."
    },
    about: {
      title: "About Page", 
      content: "This page demonstrates smooth transitions with proper focus management and accessibility features."
    },
    contact: {
      title: "Contact Page",
      content: "Experience seamless navigation with loading states and progress indicators."
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress bar */}
        <TransitionProgress
          progress={transitionProgress}
          isVisible={loading}
          className="mb-8"
          color="bg-gradient-to-r from-blue-500 to-purple-500"
        />

        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex gap-4 justify-center">
            {Object.keys(pages).map((page) => (
              <motion.button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                {page.charAt(0).toUpperCase() + page.slice(1)}
              </motion.button>
            ))}
          </div>
        </nav>

        {/* Page content with transitions */}
        <PageTransition
          transitionKey={currentPage}
          direction="fade"
          loading={loading}
          loadingText={`Loading ${currentPage} page...`}
          className="bg-white rounded-xl shadow-lg p-8"
          onTransitionComplete={() => {
            console.log(`Transitioned to ${currentPage}`)
          }}
        >
          <main>
            <h1 className="text-3xl font-bold text-gray-900 mb-6" tabIndex={-1}>
              {pages[currentPage as keyof typeof pages].title}
            </h1>
            
            <SectionTransition
              sectionId={`${currentPage}-content`}
              animationType="fade-up"
              delay={200}
            >
              <p className="text-lg text-gray-700 mb-8">
                {pages[currentPage as keyof typeof pages].content}
              </p>
            </SectionTransition>

            <SectionTransition
              sectionId={`${currentPage}-features`}
              animationType="slide-left"
              delay={400}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Motion.dev Integration
                  </h3>
                  <p className="text-blue-700">
                    Enhanced animations with better performance and accessibility.
                  </p>
                </div>
                
                <div className="p-6 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">
                    Focus Management
                  </h3>
                  <p className="text-green-700">
                    Proper focus handling for screen readers and keyboard navigation.
                  </p>
                </div>
                
                <div className="p-6 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">
                    Loading States
                  </h3>
                  <p className="text-purple-700">
                    Smooth loading animations with progress indicators.
                  </p>
                </div>
                
                <div className="p-6 bg-orange-50 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-2">
                    Accessibility
                  </h3>
                  <p className="text-orange-700">
                    Respects reduced motion preferences and screen reader compatibility.
                  </p>
                </div>
              </div>
            </SectionTransition>
          </main>
        </PageTransition>

        {/* Status indicator */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Current page: <strong>{currentPage}</strong> | 
            Transitioning: <strong>{isTransitioning ? 'Yes' : 'No'}</strong> |
            Progress: <strong>{transitionProgress}%</strong>
          </p>
        </div>
      </div>
    </div>
  )
}