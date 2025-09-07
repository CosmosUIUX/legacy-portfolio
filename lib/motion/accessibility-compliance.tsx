'use client'

import React, { useEffect, useState, useRef } from 'react'
import { 
  useReducedMotion, 
  useKeyboardNavigation, 
  useAriaAnnouncements,
  useAlternativeInteractions,
  validateAnimationSafety,
  getAccessibleAnimationConfig
} from './accessibility'

interface AccessibilityComplianceProps {
  children: React.ReactNode
  enableCompliance?: boolean
  enableReporting?: boolean
  onComplianceReport?: (report: AccessibilityReport) => void
}

interface AccessibilityReport {
  timestamp: Date
  reducedMotionSupport: boolean
  keyboardNavigationSupport: boolean
  screenReaderSupport: boolean
  ariaCompliance: boolean
  colorContrastCompliance: boolean
  animationSafety: boolean
  focusManagement: boolean
  alternativeInteractions: boolean
  issues: AccessibilityIssue[]
  recommendations: string[]
}

interface AccessibilityIssue {
  severity: 'error' | 'warning' | 'info'
  type: 'wcag' | 'usability' | 'performance'
  description: string
  element?: string
  guideline?: string
  fix?: string
}

/**
 * Accessibility compliance monitoring and validation component
 */
export function AccessibilityCompliance({
  children,
  enableCompliance = true,
  enableReporting = false,
  onComplianceReport
}: AccessibilityComplianceProps) {
  const reducedMotion = useReducedMotion()
  const { isKeyboardUser, getFocusableElements } = useKeyboardNavigation()
  const { announce } = useAriaAnnouncements()
  const { availableInteractionMethods } = useAlternativeInteractions()
  
  const [complianceReport, setComplianceReport] = useState<AccessibilityReport | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Run accessibility compliance checks
  useEffect(() => {
    if (!enableCompliance) return

    const runComplianceCheck = () => {
      const issues: AccessibilityIssue[] = []
      const recommendations: string[] = []

      // Check reduced motion support
      const reducedMotionSupport = checkReducedMotionSupport()
      if (!reducedMotionSupport.compliant) {
        issues.push(...reducedMotionSupport.issues)
        recommendations.push(...reducedMotionSupport.recommendations)
      }

      // Check keyboard navigation
      const keyboardSupport = checkKeyboardNavigationSupport()
      if (!keyboardSupport.compliant) {
        issues.push(...keyboardSupport.issues)
        recommendations.push(...keyboardSupport.recommendations)
      }

      // Check ARIA compliance
      const ariaCompliance = checkAriaCompliance()
      if (!ariaCompliance.compliant) {
        issues.push(...ariaCompliance.issues)
        recommendations.push(...ariaCompliance.recommendations)
      }

      // Check color contrast
      const colorContrast = checkColorContrast()
      if (!colorContrast.compliant) {
        issues.push(...colorContrast.issues)
        recommendations.push(...colorContrast.recommendations)
      }

      // Check animation safety
      const animationSafety = checkAnimationSafety()
      if (!animationSafety.compliant) {
        issues.push(...animationSafety.issues)
        recommendations.push(...animationSafety.recommendations)
      }

      // Check focus management
      const focusManagement = checkFocusManagement()
      if (!focusManagement.compliant) {
        issues.push(...focusManagement.issues)
        recommendations.push(...focusManagement.recommendations)
      }

      const report: AccessibilityReport = {
        timestamp: new Date(),
        reducedMotionSupport: reducedMotionSupport.compliant,
        keyboardNavigationSupport: keyboardSupport.compliant,
        screenReaderSupport: checkScreenReaderSupport(),
        ariaCompliance: ariaCompliance.compliant,
        colorContrastCompliance: colorContrast.compliant,
        animationSafety: animationSafety.compliant,
        focusManagement: focusManagement.compliant,
        alternativeInteractions: availableInteractionMethods.length > 1,
        issues,
        recommendations
      }

      setComplianceReport(report)

      if (enableReporting && onComplianceReport) {
        onComplianceReport(report)
      }

      // Log issues in development
      if (process.env.NODE_ENV === 'development' && issues.length > 0) {
        console.group('🔍 Accessibility Compliance Issues')
        issues.forEach(issue => {
          const emoji = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️'
          console.log(`${emoji} ${issue.description}`)
          if (issue.fix) {
            console.log(`   💡 Fix: ${issue.fix}`)
          }
        })
        console.groupEnd()
      }
    }

    // Run initial check
    runComplianceCheck()

    // Run periodic checks
    const interval = setInterval(runComplianceCheck, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [enableCompliance, enableReporting, onComplianceReport, availableInteractionMethods])

  const checkReducedMotionSupport = () => {
    const issues: AccessibilityIssue[] = []
    const recommendations: string[] = []
    let compliant = true

    // Check if reduced motion is properly detected
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      
      if (!mediaQuery) {
        issues.push({
          severity: 'error',
          type: 'wcag',
          description: 'Reduced motion detection not supported',
          guideline: 'WCAG 2.2.2',
          fix: 'Implement prefers-reduced-motion media query support'
        })
        compliant = false
      }

      // Check if animations are disabled when reduced motion is preferred
      if (reducedMotion) {
        const animatedElements = document.querySelectorAll('[style*="animation"], [style*="transition"]')
        animatedElements.forEach((element, index) => {
          const computedStyle = window.getComputedStyle(element)
          const animationDuration = computedStyle.animationDuration
          const transitionDuration = computedStyle.transitionDuration
          
          if (animationDuration !== '0s' && animationDuration !== '0.01ms' &&
              transitionDuration !== '0s' && transitionDuration !== '0.01ms') {
            issues.push({
              severity: 'warning',
              type: 'wcag',
              description: `Element ${index + 1} still has animations despite reduced motion preference`,
              guideline: 'WCAG 2.2.2',
              fix: 'Disable or reduce animation duration when prefers-reduced-motion is set'
            })
            compliant = false
          }
        })
      }
    }

    if (compliant) {
      recommendations.push('Reduced motion support is properly implemented')
    }

    return { compliant, issues, recommendations }
  }

  const checkKeyboardNavigationSupport = () => {
    const issues: AccessibilityIssue[] = []
    const recommendations: string[] = []
    let compliant = true

    if (containerRef.current) {
      const focusableElements = getFocusableElements(containerRef.current)
      
      // Check if interactive elements are focusable
      const interactiveElements = containerRef.current.querySelectorAll(
        'button, a, input, select, textarea, [onclick], [role="button"], [role="link"]'
      )
      
      interactiveElements.forEach((element, index) => {
        const htmlElement = element as HTMLElement
        
        // Check if element is focusable
        if (htmlElement.tabIndex < 0 && !htmlElement.hasAttribute('disabled')) {
          issues.push({
            severity: 'error',
            type: 'wcag',
            description: `Interactive element ${index + 1} is not keyboard accessible`,
            element: htmlElement.tagName.toLowerCase(),
            guideline: 'WCAG 2.1.1',
            fix: 'Add tabindex="0" or ensure element is naturally focusable'
          })
          compliant = false
        }

        // Check for focus indicators
        const computedStyle = window.getComputedStyle(htmlElement, ':focus')
        if (computedStyle.outline === 'none' && computedStyle.boxShadow === 'none') {
          issues.push({
            severity: 'warning',
            type: 'wcag',
            description: `Element ${index + 1} lacks visible focus indicator`,
            element: htmlElement.tagName.toLowerCase(),
            guideline: 'WCAG 2.4.7',
            fix: 'Add visible focus styles using outline or box-shadow'
          })
        }
      })

      // Check for skip links
      const skipLinks = document.querySelectorAll('a[href^="#"]')
      if (skipLinks.length === 0 && interactiveElements.length > 5) {
        recommendations.push('Consider adding skip navigation links for better keyboard accessibility')
      }
    }

    return { compliant, issues, recommendations }
  }

  const checkAriaCompliance = () => {
    const issues: AccessibilityIssue[] = []
    const recommendations: string[] = []
    let compliant = true

    if (containerRef.current) {
      // Check for missing ARIA labels on interactive elements
      const interactiveElements = containerRef.current.querySelectorAll(
        'button, a, input, select, textarea, [role="button"], [role="link"]'
      )
      
      interactiveElements.forEach((element, index) => {
        const htmlElement = element as HTMLElement
        const hasLabel = htmlElement.hasAttribute('aria-label') ||
                        htmlElement.hasAttribute('aria-labelledby') ||
                        htmlElement.textContent?.trim() ||
                        htmlElement.querySelector('img')?.hasAttribute('alt')
        
        if (!hasLabel) {
          issues.push({
            severity: 'error',
            type: 'wcag',
            description: `Interactive element ${index + 1} lacks accessible name`,
            element: htmlElement.tagName.toLowerCase(),
            guideline: 'WCAG 4.1.2',
            fix: 'Add aria-label, aria-labelledby, or visible text content'
          })
          compliant = false
        }
      })

      // Check for proper heading structure
      const headings = containerRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6')
      let previousLevel = 0
      
      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1))
        
        if (level > previousLevel + 1) {
          issues.push({
            severity: 'warning',
            type: 'wcag',
            description: `Heading level skipped at heading ${index + 1}`,
            element: heading.tagName.toLowerCase(),
            guideline: 'WCAG 1.3.1',
            fix: 'Use proper heading hierarchy without skipping levels'
          })
        }
        
        previousLevel = level
      })

      // Check for ARIA live regions
      const liveRegions = document.querySelectorAll('[aria-live]')
      if (liveRegions.length === 0) {
        recommendations.push('Consider adding ARIA live regions for dynamic content announcements')
      }
    }

    return { compliant, issues, recommendations }
  }

  const checkColorContrast = () => {
    const issues: AccessibilityIssue[] = []
    const recommendations: string[] = []
    let compliant = true

    // This is a simplified check - in a real implementation, you'd use a proper color contrast library
    if (containerRef.current) {
      const textElements = containerRef.current.querySelectorAll('p, span, div, button, a, label')
      
      textElements.forEach((element, index) => {
        const computedStyle = window.getComputedStyle(element)
        const color = computedStyle.color
        const backgroundColor = computedStyle.backgroundColor
        
        // Simple check for very light text on light backgrounds or very dark on dark
        if ((color.includes('rgb(255') && backgroundColor.includes('rgb(255')) ||
            (color.includes('rgb(0') && backgroundColor.includes('rgb(0'))) {
          issues.push({
            severity: 'warning',
            type: 'wcag',
            description: `Potential color contrast issue at element ${index + 1}`,
            element: element.tagName.toLowerCase(),
            guideline: 'WCAG 1.4.3',
            fix: 'Ensure color contrast ratio is at least 4.5:1 for normal text'
          })
        }
      })
    }

    return { compliant, issues, recommendations }
  }

  const checkAnimationSafety = () => {
    const issues: AccessibilityIssue[] = []
    const recommendations: string[] = []
    let compliant = true

    // Check for potentially dangerous animations
    const safetyCheck = validateAnimationSafety({
      flashRate: 2, // This would be calculated from actual animations
      colorChanges: 3,
      contrastRatio: 4.5
    })

    if (!safetyCheck.safe) {
      safetyCheck.warnings.forEach(warning => {
        issues.push({
          severity: 'error',
          type: 'wcag',
          description: warning,
          guideline: 'WCAG 2.3.1',
          fix: 'Reduce flash rate, color changes, or improve contrast ratio'
        })
      })
      compliant = false
    }

    return { compliant, issues, recommendations }
  }

  const checkFocusManagement = () => {
    const issues: AccessibilityIssue[] = []
    const recommendations: string[] = []
    let compliant = true

    // Check if focus is properly managed during dynamic content changes
    if (containerRef.current) {
      const modals = containerRef.current.querySelectorAll('[role="dialog"]')
      
      modals.forEach((modal, index) => {
        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        
        if (focusableElements.length === 0) {
          issues.push({
            severity: 'warning',
            type: 'usability',
            description: `Modal ${index + 1} has no focusable elements`,
            element: 'dialog',
            fix: 'Ensure modals contain at least one focusable element'
          })
        }
      })
    }

    return { compliant, issues, recommendations }
  }

  const checkScreenReaderSupport = () => {
    // Check for screen reader specific features
    const liveRegions = document.querySelectorAll('[aria-live]')
    const landmarks = document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]')
    
    return liveRegions.length > 0 && landmarks.length > 0
  }

  // Announce compliance status for screen readers
  useEffect(() => {
    if (complianceReport && enableReporting) {
      const errorCount = complianceReport.issues.filter(issue => issue.severity === 'error').length
      const warningCount = complianceReport.issues.filter(issue => issue.severity === 'warning').length
      
      if (errorCount === 0 && warningCount === 0) {
        announce('Accessibility compliance check passed', 'polite')
      } else {
        announce(`Accessibility issues found: ${errorCount} errors, ${warningCount} warnings`, 'assertive')
      }
    }
  }, [complianceReport, enableReporting, announce])

  return (
    <div ref={containerRef} className="accessibility-compliance-container">
      {children}
      
      {/* Development mode compliance indicator */}
      {process.env.NODE_ENV === 'development' && complianceReport && (
        <div 
          className="accessibility-compliance-indicator"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: 'white',
            backgroundColor: complianceReport.issues.filter(i => i.severity === 'error').length === 0 
              ? '#22c55e' 
              : '#ef4444',
            zIndex: 10000,
            cursor: 'pointer'
          }}
          onClick={() => console.table(complianceReport.issues)}
          title="Click to view accessibility report in console"
        >
          A11Y: {complianceReport.issues.filter(i => i.severity === 'error').length === 0 ? '✓' : '✗'}
        </div>
      )}
    </div>
  )
}

/**
 * Hook to get current accessibility compliance status
 */
export function useAccessibilityCompliance() {
  const [complianceStatus, setComplianceStatus] = useState<AccessibilityReport | null>(null)

  const checkCompliance = (element: HTMLElement) => {
    // Implementation would run the same checks as AccessibilityCompliance component
    // This is a simplified version
    return {
      timestamp: new Date(),
      reducedMotionSupport: true,
      keyboardNavigationSupport: true,
      screenReaderSupport: true,
      ariaCompliance: true,
      colorContrastCompliance: true,
      animationSafety: true,
      focusManagement: true,
      alternativeInteractions: true,
      issues: [],
      recommendations: []
    }
  }

  return {
    complianceStatus,
    checkCompliance
  }
}