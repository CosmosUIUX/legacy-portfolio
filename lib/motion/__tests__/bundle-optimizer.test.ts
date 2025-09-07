import {
  loadMotionComponent,
  preloadCriticalComponents,
  isMotionAvailable,
  getBundleInfo,
  clearComponentCache,
  ImportOptimizer,
  globalImportOptimizer,
  useOptimizedMotion,
  analyzeBundleUsage
} from '../bundle-optimizer'

// Mock dynamic imports
jest.mock('motion/react', () => ({
  motion: 'MockedMotion',
  AnimatePresence: 'MockedAnimatePresence',
  useMotionValue: 'MockedUseMotionValue',
  useSpring: 'MockedUseSpring',
  useTransform: 'MockedUseTransform',
  useAnimation: 'MockedUseAnimation',
  useScroll: 'MockedUseScroll',
  useInView: 'MockedUseInView',
  useDragControls: 'MockedUseDragControls',
  useAnimationControls: 'MockedUseAnimationControls'
}), { virtual: true })

// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  warn: jest.spyOn(console, 'warn').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation(),
  group: jest.spyOn(console, 'group').mockImplementation(),
  groupEnd: jest.spyOn(console, 'groupEnd').mockImplementation()
}

describe('Bundle Optimizer', () => {
  beforeEach(() => {
    clearComponentCache()
    jest.clearAllMocks()
    Object.values(consoleSpy).forEach(spy => spy.mockClear())
  })

  describe('loadMotionComponent', () => {
    it('should load and cache motion components', async () => {
      const component = await loadMotionComponent('motion')
      expect(component).toBe('MockedMotion')
      
      // Second call should return cached version
      const cachedComponent = await loadMotionComponent('motion')
      expect(cachedComponent).toBe('MockedMotion')
    })

    it('should load different component types', async () => {
      const components = [
        'motion',
        'AnimatePresence',
        'useMotionValue',
        'useSpring',
        'useTransform',
        'useAnimation',
        'useScroll',
        'useInView',
        'useDragControls',
        'useAnimationControls'
      ]

      for (const componentName of components) {
        const component = await loadMotionComponent(componentName)
        expect(component).toBe(`Mocked${componentName.charAt(0).toUpperCase() + componentName.slice(1)}`)
      }
    })

    it('should handle unknown components', async () => {
      await expect(loadMotionComponent('unknownComponent')).rejects.toThrow('Unknown Motion.dev component')
    })

    it('should handle loading errors', async () => {
      // Mock import failure
      jest.doMock('motion/react', () => {
        throw new Error('Import failed')
      })

      await expect(loadMotionComponent('motion')).rejects.toThrow()
    })
  })

  describe('preloadCriticalComponents', () => {
    it('should preload critical components', async () => {
      await preloadCriticalComponents()
      
      expect(consoleSpy.log).toHaveBeenCalledWith('Preloaded motion')
      expect(consoleSpy.log).toHaveBeenCalledWith('Preloaded AnimatePresence')
      expect(consoleSpy.log).toHaveBeenCalledWith('Preloaded useMotionValue')
      expect(consoleSpy.log).toHaveBeenCalledWith('Preloaded useInView')
      expect(consoleSpy.log).toHaveBeenCalledWith('Critical Motion.dev components preloaded successfully')
    })

    it('should handle preload failures gracefully', async () => {
      // Mock one component to fail
      const originalLoadMotionComponent = loadMotionComponent
      jest.spyOn(require('../bundle-optimizer'), 'loadMotionComponent')
        .mockImplementation((componentName: string) => {
          if (componentName === 'motion') {
            return Promise.reject(new Error('Failed to load'))
          }
          return originalLoadMotionComponent(componentName)
        })

      await preloadCriticalComponents()
      
      expect(consoleSpy.warn).toHaveBeenCalledWith('Failed to preload motion:', expect.any(Error))
    })
  })

  describe('isMotionAvailable', () => {
    it('should check if Motion.dev is available', () => {
      // This test depends on the environment setup
      const available = isMotionAvailable()
      expect(typeof available).toBe('boolean')
    })
  })

  describe('getBundleInfo', () => {
    it('should return bundle information', async () => {
      // Load some components first
      await loadMotionComponent('motion')
      await loadMotionComponent('AnimatePresence')
      
      const info = getBundleInfo()
      
      expect(info.loadedComponents).toContain('motion')
      expect(info.loadedComponents).toContain('AnimatePresence')
      expect(info.cacheSize).toBe(2)
      expect(info.estimatedSize).toBeGreaterThan(0)
    })

    it('should estimate bundle size correctly', async () => {
      await loadMotionComponent('motion') // 45KB
      await loadMotionComponent('useMotionValue') // 8KB
      
      const info = getBundleInfo()
      expect(info.estimatedSize).toBe(53) // 45 + 8
    })
  })

  describe('clearComponentCache', () => {
    it('should clear the component cache', async () => {
      await loadMotionComponent('motion')
      
      let info = getBundleInfo()
      expect(info.cacheSize).toBe(1)
      
      clearComponentCache()
      
      info = getBundleInfo()
      expect(info.cacheSize).toBe(0)
      expect(consoleSpy.log).toHaveBeenCalledWith('Motion.dev component cache cleared')
    })
  })
})

describe('ImportOptimizer', () => {
  let optimizer: ImportOptimizer

  beforeEach(() => {
    optimizer = new ImportOptimizer()
  })

  describe('recordUsage', () => {
    it('should record component usage', () => {
      optimizer.recordUsage('motion')
      optimizer.recordUsage('motion')
      optimizer.recordUsage('AnimatePresence')
      
      const stats = optimizer.getUsageStats()
      expect(stats).toHaveLength(2)
      expect(stats[0].component).toBe('motion')
      expect(stats[0].count).toBe(2)
      expect(stats[1].component).toBe('AnimatePresence')
      expect(stats[1].count).toBe(1)
    })

    it('should track last used timestamp', () => {
      const before = Date.now()
      optimizer.recordUsage('motion')
      const after = Date.now()
      
      const stats = optimizer.getUsageStats()
      expect(stats[0].lastUsed).toBeGreaterThanOrEqual(before)
      expect(stats[0].lastUsed).toBeLessThanOrEqual(after)
    })
  })

  describe('getRecommendations', () => {
    it('should recommend preloading for frequently used components', () => {
      // Record frequent usage
      for (let i = 0; i < 5; i++) {
        optimizer.recordUsage('motion')
      }
      
      const recommendations = optimizer.getRecommendations()
      expect(recommendations.shouldPreload).toContain('motion')
    })

    it('should recommend lazy loading for infrequently used components', () => {
      optimizer.recordUsage('AnimatePresence') // Only once
      
      const recommendations = optimizer.getRecommendations()
      expect(recommendations.canLazyLoad).toContain('AnimatePresence')
    })

    it('should identify unused components', async () => {
      // Load a component but don't record usage
      await loadMotionComponent('useSpring')
      
      const recommendations = optimizer.getRecommendations()
      expect(recommendations.unused).toContain('useSpring')
    })
  })

  describe('clearStats', () => {
    it('should clear usage statistics', () => {
      optimizer.recordUsage('motion')
      expect(optimizer.getUsageStats()).toHaveLength(1)
      
      optimizer.clearStats()
      expect(optimizer.getUsageStats()).toHaveLength(0)
    })
  })
})

describe('Global Import Optimizer', () => {
  it('should provide global optimizer instance', () => {
    expect(globalImportOptimizer).toBeInstanceOf(ImportOptimizer)
  })

  it('should record usage globally', () => {
    globalImportOptimizer.clearStats()
    globalImportOptimizer.recordUsage('motion')
    
    const stats = globalImportOptimizer.getUsageStats()
    expect(stats).toHaveLength(1)
    expect(stats[0].component).toBe('motion')
  })
})

describe('analyzeBundleUsage', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  it('should analyze bundle usage in development mode', async () => {
    process.env.NODE_ENV = 'development'
    
    // Set up some data
    await loadMotionComponent('motion')
    globalImportOptimizer.recordUsage('motion')
    
    analyzeBundleUsage()
    
    expect(consoleSpy.group).toHaveBeenCalledWith('Motion.dev Bundle Analysis')
    expect(consoleSpy.log).toHaveBeenCalledWith('Loaded Components:', ['motion'])
    expect(consoleSpy.groupEnd).toHaveBeenCalled()
  })

  it('should warn when not in development mode', () => {
    process.env.NODE_ENV = 'production'
    
    analyzeBundleUsage()
    
    expect(consoleSpy.warn).toHaveBeenCalledWith('Bundle analysis is only available in development mode')
  })
})