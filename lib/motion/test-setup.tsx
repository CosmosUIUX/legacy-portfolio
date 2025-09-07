'use client'

import React from 'react'
import { motion } from '@/lib/motion'
import { MotionProvider, useMotionSettings } from './provider'

/**
 * Test component to verify Motion.dev setup
 */
function TestMotionComponent() {
  const { shouldAnimate, getDuration, getEasing } = useMotionSettings()

  if (!shouldAnimate) {
    return <div>Motion disabled (reduced motion preference)</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: getDuration(0.5),
        ease: getEasing('easeOut') as any
      }}
      style={{
        padding: '20px',
        background: '#f0f0f0',
        borderRadius: '8px',
        margin: '20px'
      }}
    >
      Motion.dev is working! 🎉
    </motion.div>
  )
}

/**
 * Test wrapper with MotionProvider
 */
export function MotionTestSetup() {
  return (
    <MotionProvider enablePerformanceMonitoring={true}>
      <TestMotionComponent />
    </MotionProvider>
  )
}

export default MotionTestSetup