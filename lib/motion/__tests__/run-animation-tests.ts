// Test runner for comprehensive animation test suite
import { execSync } from 'child_process'
import { performance } from 'perf_hooks'

interface TestResult {
  suite: string
  passed: boolean
  duration: number
  coverage?: number
  errors?: string[]
}

interface TestSummary {
  totalSuites: number
  passedSuites: number
  failedSuites: number
  totalDuration: number
  overallCoverage: number
  results: TestResult[]
}

/**
 * Animation Test Runner
 * Executes all animation-related tests and provides comprehensive reporting
 */
class AnimationTestRunner {
  private testSuites = [
    {
      name: 'Animation Hooks',
      pattern: 'lib/motion/__tests__/hooks.test.tsx',
      description: 'Unit tests for all animation hooks'
    },
    {
      name: 'Performance Validation',
      pattern: 'lib/motion/__tests__/performance-validation.test.ts',
      description: '60fps validation and performance tests'
    },
    {
      name: 'Accessibility Comprehensive',
      pattern: 'lib/motion/__tests__/accessibility-comprehensive.test.tsx',
      description: 'Reduced motion and screen reader compatibility tests'
    },
    {
      name: 'Animation Integration',
      pattern: 'lib/motion/__tests__/animation-integration.test.tsx',
      description: 'Component animation interaction tests'
    },
    {
      name: 'Component Animation Suite',
      pattern: 'lib/motion/__tests__/component-animation-suite.test.tsx',
      description: 'Comprehensive component animation tests'
    },
    {
      name: 'Existing Motion Tests',
      pattern: 'lib/motion/__tests__/*.test.{ts,tsx}',
      description: 'All existing motion library tests'
    },
    {
      name: 'Component Tests',
      pattern: 'components/__tests__/*.test.{ts,tsx}',
      description: 'All component-level animation tests'
    }
  ]

  /**
   * Run a single test suite
   */
  private async runTestSuite(suite: { name: string; pattern: string; description: string }): Promise<TestResult> {
    const startTime = performance.now()
    
    try {
      console.log(`\n🧪 Running ${suite.name}...`)
      console.log(`   ${suite.description}`)
      
      // Run Jest with specific pattern
      const command = `npx jest ${suite.pattern} --coverage --coverageReporters=json-summary --silent`
      
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe'
      })
      
      const duration = performance.now() - startTime
      
      // Parse coverage if available
      let coverage = 0
      try {
        const coverageData = JSON.parse(
          execSync('cat coverage/coverage-summary.json', { encoding: 'utf8' })
        )
        coverage = coverageData.total.lines.pct || 0
      } catch (e) {
        // Coverage data not available
      }
      
      console.log(`   ✅ Passed in ${Math.round(duration)}ms (Coverage: ${coverage}%)`)
      
      return {
        suite: suite.name,
        passed: true,
        duration,
        coverage
      }
    } catch (error) {
      const duration = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      console.log(`   ❌ Failed in ${Math.round(duration)}ms`)
      console.log(`   Error: ${errorMessage}`)
      
      return {
        suite: suite.name,
        passed: false,
        duration,
        errors: [errorMessage]
      }
    }
  }

  /**
   * Run performance benchmarks
   */
  private async runPerformanceBenchmarks(): Promise<void> {
    console.log('\n🚀 Running Performance Benchmarks...')
    
    try {
      // Run performance-specific tests with longer timeout
      const command = `npx jest lib/motion/__tests__/performance-validation.test.ts --testTimeout=30000 --verbose`
      
      execSync(command, { 
        encoding: 'utf8',
        stdio: 'inherit'
      })
      
      console.log('   ✅ Performance benchmarks completed')
    } catch (error) {
      console.log('   ❌ Performance benchmarks failed')
      console.log(`   Error: ${error}`)
    }
  }

  /**
   * Run accessibility validation
   */
  private async runAccessibilityValidation(): Promise<void> {
    console.log('\n♿ Running Accessibility Validation...')
    
    try {
      // Run accessibility-specific tests
      const command = `npx jest lib/motion/__tests__/accessibility-comprehensive.test.tsx --verbose`
      
      execSync(command, { 
        encoding: 'utf8',
        stdio: 'inherit'
      })
      
      console.log('   ✅ Accessibility validation completed')
    } catch (error) {
      console.log('   ❌ Accessibility validation failed')
      console.log(`   Error: ${error}`)
    }
  }

  /**
   * Generate test coverage report
   */
  private async generateCoverageReport(): Promise<void> {
    console.log('\n📊 Generating Coverage Report...')
    
    try {
      // Generate comprehensive coverage report
      const command = `npx jest --coverage --coverageDirectory=coverage/animation-tests --coverageReporters=html,text,lcov`
      
      execSync(command, { 
        encoding: 'utf8',
        stdio: 'inherit'
      })
      
      console.log('   ✅ Coverage report generated in coverage/animation-tests/')
    } catch (error) {
      console.log('   ❌ Coverage report generation failed')
      console.log(`   Error: ${error}`)
    }
  }

  /**
   * Validate animation safety
   */
  private async validateAnimationSafety(): Promise<void> {
    console.log('\n🛡️  Validating Animation Safety...')
    
    try {
      // Run animation safety validation
      const command = `npx jest lib/motion/__tests__/accessibility.test.tsx --testNamePattern="validateAnimationSafety"`
      
      execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe'
      })
      
      console.log('   ✅ Animation safety validation passed')
    } catch (error) {
      console.log('   ❌ Animation safety validation failed')
      console.log('   Warning: Some animations may not meet accessibility guidelines')
    }
  }

  /**
   * Run all animation tests
   */
  public async runAllTests(): Promise<TestSummary> {
    console.log('🎬 Starting Comprehensive Animation Test Suite')
    console.log('=' .repeat(60))
    
    const startTime = performance.now()
    const results: TestResult[] = []
    
    // Run each test suite
    for (const suite of this.testSuites) {
      const result = await this.runTestSuite(suite)
      results.push(result)
    }
    
    // Run additional validations
    await this.runPerformanceBenchmarks()
    await this.runAccessibilityValidation()
    await this.validateAnimationSafety()
    await this.generateCoverageReport()
    
    const totalDuration = performance.now() - startTime
    const passedSuites = results.filter(r => r.passed).length
    const failedSuites = results.filter(r => !r.passed).length
    
    // Calculate overall coverage
    const coverageResults = results.filter(r => r.coverage !== undefined)
    const overallCoverage = coverageResults.length > 0 
      ? coverageResults.reduce((sum, r) => sum + (r.coverage || 0), 0) / coverageResults.length
      : 0
    
    const summary: TestSummary = {
      totalSuites: results.length,
      passedSuites,
      failedSuites,
      totalDuration,
      overallCoverage,
      results
    }
    
    this.printSummary(summary)
    
    return summary
  }

  /**
   * Print test summary
   */
  private printSummary(summary: TestSummary): void {
    console.log('\n' + '=' .repeat(60))
    console.log('📋 Animation Test Suite Summary')
    console.log('=' .repeat(60))
    
    console.log(`Total Test Suites: ${summary.totalSuites}`)
    console.log(`Passed: ${summary.passedSuites} ✅`)
    console.log(`Failed: ${summary.failedSuites} ${summary.failedSuites > 0 ? '❌' : ''}`)
    console.log(`Total Duration: ${Math.round(summary.totalDuration)}ms`)
    console.log(`Overall Coverage: ${Math.round(summary.overallCoverage)}%`)
    
    if (summary.failedSuites > 0) {
      console.log('\n❌ Failed Test Suites:')
      summary.results
        .filter(r => !r.passed)
        .forEach(result => {
          console.log(`   • ${result.suite}`)
          if (result.errors) {
            result.errors.forEach(error => {
              console.log(`     ${error}`)
            })
          }
        })
    }
    
    console.log('\n📊 Test Results by Category:')
    summary.results.forEach(result => {
      const status = result.passed ? '✅' : '❌'
      const coverage = result.coverage ? ` (${Math.round(result.coverage)}% coverage)` : ''
      console.log(`   ${status} ${result.suite} - ${Math.round(result.duration)}ms${coverage}`)
    })
    
    // Performance recommendations
    console.log('\n🚀 Performance Recommendations:')
    if (summary.overallCoverage < 80) {
      console.log('   • Increase test coverage to at least 80%')
    }
    if (summary.totalDuration > 30000) {
      console.log('   • Consider optimizing slow tests (current: ' + Math.round(summary.totalDuration) + 'ms)')
    }
    if (summary.failedSuites > 0) {
      console.log('   • Fix failing tests before deploying animations')
    }
    
    // Accessibility recommendations
    console.log('\n♿ Accessibility Recommendations:')
    console.log('   • Ensure all animations respect prefers-reduced-motion')
    console.log('   • Verify screen reader compatibility')
    console.log('   • Test keyboard navigation with animations')
    console.log('   • Validate animation safety (no seizure triggers)')
    
    console.log('\n🎯 Next Steps:')
    if (summary.passedSuites === summary.totalSuites) {
      console.log('   ✅ All tests passed! Animation system is ready for production.')
    } else {
      console.log('   🔧 Fix failing tests and re-run the test suite.')
    }
    console.log('   📖 Review coverage report: coverage/animation-tests/index.html')
    console.log('   🔍 Monitor performance in production environments')
    
    console.log('\n' + '=' .repeat(60))
  }

  /**
   * Run quick validation (subset of tests)
   */
  public async runQuickValidation(): Promise<boolean> {
    console.log('⚡ Running Quick Animation Validation...')
    
    const criticalTests = [
      'lib/motion/__tests__/hooks.test.tsx',
      'lib/motion/__tests__/accessibility.test.tsx',
      'lib/motion/__tests__/performance.test.ts'
    ]
    
    try {
      for (const testPattern of criticalTests) {
        execSync(`npx jest ${testPattern} --silent`, { 
          encoding: 'utf8',
          stdio: 'pipe'
        })
      }
      
      console.log('✅ Quick validation passed')
      return true
    } catch (error) {
      console.log('❌ Quick validation failed')
      console.log(`Error: ${error}`)
      return false
    }
  }
}

// Export for use in other scripts
export { AnimationTestRunner }

// CLI usage
if (require.main === module) {
  const runner = new AnimationTestRunner()
  
  const args = process.argv.slice(2)
  const isQuick = args.includes('--quick')
  
  if (isQuick) {
    runner.runQuickValidation()
      .then(passed => {
        process.exit(passed ? 0 : 1)
      })
      .catch(error => {
        console.error('Test runner error:', error)
        process.exit(1)
      })
  } else {
    runner.runAllTests()
      .then(summary => {
        process.exit(summary.failedSuites === 0 ? 0 : 1)
      })
      .catch(error => {
        console.error('Test runner error:', error)
        process.exit(1)
      })
  }
}