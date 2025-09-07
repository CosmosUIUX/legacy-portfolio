"use client";

import React, { useState } from "react";
import { AccessibilityWrapper } from "@/lib/motion/accessibility-wrapper";
import { AccessibilityCompliance } from "@/lib/motion/accessibility-compliance";
import { SkipNavigation, SkipTarget } from "@/lib/motion/skip-navigation";
import { FocusManager, FocusBoundary } from "@/lib/motion/focus-management";
import {
  ReducedMotionProvider,
  MotionPreference,
  MotionPreferenceSettings,
  useReducedMotionContext,
} from "@/lib/motion/reduced-motion";
import {
  AriaLiveProvider,
  AnimationAnnouncer,
  useContextualAnnouncements,
} from "@/lib/motion/aria-live";
import { motion } from "@/lib/motion";
import {
  useReducedMotion,
  useKeyboardNavigation,
  useAlternativeInteractions,
} from "@/lib/motion/accessibility";

/**
 * Demo component showcasing comprehensive accessibility features
 */
function AccessibilityDemoContent() {
  const [animationState, setAnimationState] = useState<
    "idle" | "animating" | "complete" | "error"
  >("idle");
  const [showModal, setShowModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const reducedMotion = useReducedMotion();
  const { isKeyboardUser } = useKeyboardNavigation();
  const { interactionMode, availableInteractionMethods } =
    useAlternativeInteractions();
  const { announceInteraction, announceStatus } = useContextualAnnouncements();
  const { reducedMotion: contextReducedMotion } = useReducedMotionContext();

  const handleButtonClick = () => {
    announceInteraction("click", "demo button");
    setAnimationState("animating");
    setTimeout(() => {
      setAnimationState("complete");
      announceStatus("success", "Animation completed successfully");
      setTimeout(() => setAnimationState("idle"), 2000);
    }, 1000);
  };

  const handleModalOpen = () => {
    announceInteraction("click", "open modal button");
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <AccessibilityCompliance enableCompliance={true} enableReporting={true}>
      <SkipNavigation />
      <div className="p-8 max-w-4xl mx-auto">
        <SkipTarget id="main-content" label="Main content area" as="main">
          <h1 className="text-3xl font-bold mb-8">
            Accessibility Features Demo
          </h1>

          <AnimationAnnouncer
            animationState={animationState}
            messages={{
              animating: "Demo animation started",
              complete: "Demo animation completed",
              error: "Demo animation failed",
            }}
          />

          {/* Motion preference settings */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Motion Preferences</h2>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {showSettings ? "Hide Settings" : "Show Settings"}
              </button>
            </div>

            {showSettings && <MotionPreferenceSettings className="mb-4" />}

            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Current Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>System Reduced Motion:</strong>{" "}
                  {reducedMotion ? "Enabled" : "Disabled"}
                </div>
                <div>
                  <strong>Context Reduced Motion:</strong>{" "}
                  {contextReducedMotion ? "Enabled" : "Disabled"}
                </div>
                <div>
                  <strong>Keyboard User:</strong>{" "}
                  {isKeyboardUser ? "Yes" : "No"}
                </div>
                <div>
                  <strong>Interaction Mode:</strong> {interactionMode}
                </div>
              </div>
            </div>
          </section>

          {/* Interactive button demo */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Interactive Button with Accessibility
            </h2>
            <FocusBoundary
              label="Animation demo section"
              onEnter={() =>
                announceInteraction("focus", "animation demo section")
              }
            >
              <MotionPreference
                fallback={
                  <button
                    onClick={handleButtonClick}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Static Button (Reduced Motion)
                  </button>
                }
              >
                <AccessibilityWrapper
                  elementType="button"
                  animationState={animationState}
                  ariaLabel="Accessible animation demo button"
                  ariaDescription="This button demonstrates accessible animations with proper ARIA support"
                  announcement="Button animation"
                  enableAlternativeInteractions={true}
                  interactions={["hover", "click"]}
                  customInstructions="Press Enter or Space to activate. Animation respects your motion preferences."
                >
                  <motion.button
                    onClick={handleButtonClick}
                    className={`
                      px-6 py-3 bg-blue-600 text-white rounded-lg font-medium
                      hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors duration-200
                      ${animationState === "animating" ? "animate-pulse" : ""}
                      ${animationState === "complete" ? "bg-green-600" : ""}
                    `}
                    animate={{
                      scale: animationState === "animating" ? [1, 1.05, 1] : 1,
                      backgroundColor:
                        animationState === "complete" ? "#16a34a" : "#2563eb",
                    }}
                    transition={{
                      duration: contextReducedMotion ? 0 : 0.3,
                    }}
                    disabled={animationState === "animating"}
                  >
                    {animationState === "idle" && "Click me!"}
                    {animationState === "animating" && "Animating..."}
                    {animationState === "complete" && "Complete!"}
                  </motion.button>
                </AccessibilityWrapper>
              </MotionPreference>
            </FocusBoundary>
          </section>

          {/* Modal demo */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Accessible Modal</h2>
            <button
              onClick={handleModalOpen}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Open Modal
            </button>

            {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <FocusManager
                  restoreFocus={true}
                  trapFocus={true}
                  autoFocus={true}
                  onEscape={handleModalClose}
                >
                  <AccessibilityWrapper
                    elementType="modal"
                    animationState="complete"
                    ariaLabel="Accessibility demo modal"
                    ariaDescription="This modal demonstrates accessible focus management and keyboard navigation"
                    enableFocusTrap={true}
                    onEscape={handleModalClose}
                    interactions={["keyboard"]}
                  >
                    <MotionPreference
                      fallback={
                        <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                          <h3 className="text-xl font-semibold mb-4">
                            Accessible Modal (Static)
                          </h3>
                          <p className="mb-4">
                            This modal demonstrates proper focus management,
                            keyboard navigation, and screen reader support.
                            Animations are disabled due to motion preferences.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={handleModalClose}
                              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                              Close
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                              Action
                            </button>
                          </div>
                        </div>
                      }
                    >
                      <motion.div
                        className="bg-white p-6 rounded-lg max-w-md w-full mx-4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{
                          duration: contextReducedMotion ? 0 : 0.2,
                        }}
                      >
                        <h3 className="text-xl font-semibold mb-4">
                          Accessible Modal
                        </h3>
                        <p className="mb-4">
                          This modal demonstrates proper focus management,
                          keyboard navigation, and screen reader support. Try
                          using Tab to navigate and Escape to close.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleModalClose}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                          >
                            Close
                          </button>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            Action
                          </button>
                        </div>
                      </motion.div>
                    </MotionPreference>
                  </AccessibilityWrapper>
                </FocusManager>
              </div>
            )}
          </section>

          {/* Card grid demo */}
          <SkipTarget id="card-grid" label="Card grid section">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Accessible Card Grid
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((item) => (
                  <AccessibilityWrapper
                    key={item}
                    elementType="card"
                    ariaLabel={`Demo card ${item}`}
                    ariaDescription={`This is demo card number ${item} with accessible interactions`}
                    enableAlternativeInteractions={true}
                    interactions={["hover"]}
                  >
                    <MotionPreference
                      fallback={
                        <div
                          className="p-4 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                          tabIndex={0}
                          onClick={() =>
                            announceInteraction("click", `card ${item}`)
                          }
                        >
                          <h3 className="font-semibold mb-2">
                            Card {item} (Static)
                          </h3>
                          <p className="text-gray-600">
                            This card demonstrates accessible interactions
                            without animations.
                          </p>
                        </div>
                      }
                    >
                      <motion.div
                        className="p-4 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                        whileHover={contextReducedMotion ? {} : { y: -2 }}
                        whileTap={contextReducedMotion ? {} : { scale: 0.98 }}
                        tabIndex={0}
                        onClick={() =>
                          announceInteraction("click", `card ${item}`)
                        }
                      >
                        <h3 className="font-semibold mb-2">Card {item}</h3>
                        <p className="text-gray-600">
                          This card demonstrates accessible hover effects and
                          keyboard navigation.
                        </p>
                      </motion.div>
                    </MotionPreference>
                  </AccessibilityWrapper>
                ))}
              </div>
            </section>
          </SkipTarget>

          {/* Instructions */}
          <SkipTarget id="instructions" label="Accessibility instructions">
            <section className="mb-8 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">
                Accessibility Instructions
              </h2>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Skip Navigation:</strong> Press Tab at the top of the
                  page to reveal skip links
                </p>
                <p>
                  <strong>Keyboard Navigation:</strong> Use Tab to navigate,
                  Enter/Space to activate, Escape to close modals
                </p>
                <p>
                  <strong>Screen Readers:</strong> All interactions are
                  announced with proper ARIA labels and live regions
                </p>
                <p>
                  <strong>Reduced Motion:</strong> Animations are disabled or
                  reduced when motion preferences are set
                </p>
                <p>
                  <strong>Alternative Feedback:</strong> Audio and haptic
                  feedback available where supported
                </p>
                <p>
                  <strong>Focus Management:</strong> Focus is properly trapped
                  in modals and preserved during animations
                </p>
                <p>
                  <strong>Motion Settings:</strong> Use the settings panel above
                  to customize motion preferences
                </p>
              </div>
            </section>
          </SkipTarget>

          {/* Testing tools */}
          <section className="p-4 bg-yellow-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Testing Tools</h2>
            <div className="space-y-2 text-sm">
              <p>
                • Try navigating with keyboard only (Tab, Enter, Space, Escape)
              </p>
              <p>
                • Enable "Reduce motion" in your system preferences to see
                animations disable
              </p>
              <p>
                • Use the motion preference settings above to test different
                configurations
              </p>
              <p>• Use a screen reader to test announcements and navigation</p>
              <p>
                • Check the browser console for accessibility compliance reports
              </p>
              <p>• Test with high contrast mode and forced colors</p>
              <p>
                • Try the skip navigation links by pressing Tab at the top of
                the page
              </p>
            </div>
          </section>
        </SkipTarget>
      </div>
    </AccessibilityCompliance>
  );
}

/**
 * Main accessibility demo component with all providers
 */
export function AccessibilityDemo() {
  return (
    <ReducedMotionProvider>
      <AriaLiveProvider>
        <AccessibilityDemoContent />
      </AriaLiveProvider>
    </ReducedMotionProvider>
  );
}
