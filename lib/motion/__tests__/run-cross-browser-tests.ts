/**
 * Cross-browser testing runner
 * Executes comprehensive tests across different browser environments
 */

import { execSync } from 'child_process'
import { writeFileSync, readFileSync } from 'fs'
import { join } from 'path'

interface BrowserTestResult {
  browser: string
  version: string
  passed: number
  failed: number
  skipped: number
  duration: number
  errors: string[]
}

interface TestSuite {
  name: string
  browsers: string[]
  tests: string[]
}

const TEST_SUITES: TestSuite[] = [
  {
    name: 'Animation Performance',
    browsers: ['chrome', 'firefox', 'safari', 'edge'],
    tests: [
      'cross-browser-compatibility.test.tsx',
      'performance-cross-browser.test.ts',
      'accessibility-comprehensive.test.tsx'
    ]
  },
  {
    name: 'Component Integration',
    browsers: ['chrome', 'firefox', 'safari', 'edge'],
    tests: [
      'animation-integration.test.tsx',
      'component-animation-suite.test.tsx'
    ]
  },
  {
    name: 'Fallback Systems',
    browsers: ['chrome', 'firefox', 'safari', 'edge'],
    tests: [
      'accessibility-compliance.test.tsx',
      'performance-validation.test.ts'
    ]
  }
]

/**
 * Run tests in a specific browser environment
 */
async function runBrowserTests(browser: string, testFiles: string[]): Promise<BrowserTestResult> {
  const startTime = Date.now()
  const result: BrowserTestResult = {
    browser,
    version: 'unknown',
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
    errors: []
  }

  try {
    // Set browser-specific environment variables
    const env = {
      ...process.env,
      BROWSER: browser,
      NODE_ENV: 'test'
    }

    // Create browser-specific Jest config
    const jestConfig = {
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testMatch: testFiles.map(file => `**/${file}`),
      collectCoverage: false,
      verbose: true,
      testEnvironmentOptions: {
        userAgent: getBrowserUserAgent(browser)
      }
    }

    const configPath = join(process.cwd(), `jest.config.${browser}.js`)
    writeFileSync(configPath, `module.exports = ${JSON.stringify(jestConfig, null, 2)}`)

    // Run Jest with browser-specific config
    const command = `npx jest --config=jest.config.${browser}.js --json`
    const output = execSync(command, { 
      env,
      encoding: 'utf8',
      timeout: 300000 // 5 minutes timeout
    })

    // Parse Jest output
    const testResults = JSON.parse(output)
    
    result.passed = testResults.numPassedTests || 0
    result.failed = testResults.numFailedTests || 0
    result.skipped = testResults.numPendingTests || 0
    result.duration = Date.now() - startTime

    // Collect error messages
    if (testResults.testResults) {
      testResults.testResults.forEach((testFile: any) => {
        if (testFile.message) {
          result.errors.push(`${testFile.name}: ${testFile.message}`)
        }
      })
    }

    console.log(`✅ ${browser} tests completed: ${result.passed} passed, ${result.failed} failed`)

  } catch (error) {
    result.failed = testFiles.length
    result.errors.push(`Browser test execution failed: ${error}`)
    result.duration = Date.now() - startTime
    
    console.error(`❌ ${browser} tests failed:`, error)
  }

  return result
}

/**
 * Get user agent string for browser simulation
 */
function getBrowserUserAgent(browser: string): string {
  const userAgents = {
    chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.91'
  }
  
  return userAgents[browser as keyof typeof userAgents] || userAgents.chrome
}

/**
 * Generate HTML test report
 */
function generateTestReport(results: BrowserTestResult[]): string {
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0)
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0)
  const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0)
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)

  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Cross-Browser Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .browser-result { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        .passed { background-color: #d4edda; border-color: #c3e6cb; }
        .failed { background-color: #f8d7da; border-color: #f5c6cb; }
        .errors { margin-top: 10px; padding: 10px; background: #fff3cd; border-radius: 3px; }
        .metric { display: inline-block; margin-right: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Cross-Browser Animation Test Report</h1>
    
    <div class="summary">
        <h2>Test Summary</h2>
        <div class="metric"><strong>Total Passed:</strong> ${totalPassed}</div>
        <div class="metric"><strong>Total Failed:</strong> ${totalFailed}</div>
        <div class="metric"><strong>Total Skipped:</strong> ${totalSkipped}</div>
        <div class="metric"><strong>Total Duration:</strong> ${(totalDuration / 1000).toFixed(2)}s</div>
    </div>

    <h2>Browser Results</h2>
    ${results.map(result => `
        <div class="browser-result ${result.failed > 0 ? 'failed' : 'passed'}">
            <h3>${result.browser.charAt(0).toUpperCase() + result.browser.slice(1)} ${result.version}</h3>
            <div class="metric"><strong>Passed:</strong> ${result.passed}</div>
            <div class="metric"><strong>Failed:</strong> ${result.failed}</div>
            <div class="metric"><strong>Skipped:</strong> ${result.skipped}</div>
            <div class="metric"><strong>Duration:</strong> ${(result.duration / 1000).toFixed(2)}s</div>
            
            ${result.errors.length > 0 ? `
                <div class="errors">
                    <strong>Errors:</strong>
                    <ul>
                        ${result.errors.map(error => `<li>${error}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `).join('')}

    <h2>Detailed Results</h2>
    <table>
        <thead>
            <tr>
                <th>Browser</th>
                <th>Passed</th>
                <th>Failed</th>
                <th>Skipped</th>
                <th>Success Rate</th>
                <th>Duration (s)</th>
            </tr>
        </thead>
        <tbody>
            ${results.map(result => {
                const total = result.passed + result.failed + result.skipped
                const successRate = total > 0 ? ((result.passed / total) * 100).toFixed(1) : '0'
                
                return `
                    <tr>
                        <td>${result.browser}</td>
                        <td style="color: green;">${result.passed}</td>
                        <td style="color: red;">${result.failed}</td>
                        <td style="color: orange;">${result.skipped}</td>
                        <td>${successRate}%</td>
                        <td>${(result.duration / 1000).toFixed(2)}</td>
                    </tr>
                `
            }).join('')}
        </tbody>
    </table>

    <div style="margin-top: 30px; font-size: 12px; color: #666;">
        Generated on ${new Date().toISOString()}
    </div>
</body>
</html>
  `

  return html
}

/**
 * Main test runner function
 */
async function runCrossBrowserTests(): Promise<void> {
  console.log('🚀 Starting cross-browser animation tests...')
  
  const allResults: BrowserTestResult[] = []

  for (const suite of TEST_SUITES) {
    console.log(`\n📋 Running test suite: ${suite.name}`)
    
    for (const browser of suite.browsers) {
      console.log(`\n🌐 Testing ${browser}...`)
      
      try {
        const result = await runBrowserTests(browser, suite.tests)
        allResults.push(result)
      } catch (error) {
        console.error(`Failed to run tests for ${browser}:`, error)
        allResults.push({
          browser,
          version: 'unknown',
          passed: 0,
          failed: suite.tests.length,
          skipped: 0,
          duration: 0,
          errors: [`Test execution failed: ${error}`]
        })
      }
    }
  }

  // Generate and save report
  const reportHtml = generateTestReport(allResults)
  const reportPath = join(process.cwd(), 'cross-browser-test-report.html')
  writeFileSync(reportPath, reportHtml)

  // Generate JSON report for CI/CD
  const jsonReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPassed: allResults.reduce((sum, r) => sum + r.passed, 0),
      totalFailed: allResults.reduce((sum, r) => sum + r.failed, 0),
      totalSkipped: allResults.reduce((sum, r) => sum + r.skipped, 0),
      totalDuration: allResults.reduce((sum, r) => sum + r.duration, 0)
    },
    results: allResults
  }
  
  const jsonReportPath = join(process.cwd(), 'cross-browser-test-results.json')
  writeFileSync(jsonReportPath, JSON.stringify(jsonReport, null, 2))

  // Print summary
  console.log('\n📊 Cross-Browser Test Summary:')
  console.log(`✅ Total Passed: ${jsonReport.summary.totalPassed}`)
  console.log(`❌ Total Failed: ${jsonReport.summary.totalFailed}`)
  console.log(`⏭️  Total Skipped: ${jsonReport.summary.totalSkipped}`)
  console.log(`⏱️  Total Duration: ${(jsonReport.summary.totalDuration / 1000).toFixed(2)}s`)
  console.log(`\n📄 HTML Report: ${reportPath}`)
  console.log(`📄 JSON Report: ${jsonReportPath}`)

  // Exit with error code if any tests failed
  if (jsonReport.summary.totalFailed > 0) {
    console.error('\n❌ Some tests failed. Check the reports for details.')
    process.exit(1)
  } else {
    console.log('\n🎉 All cross-browser tests passed!')
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runCrossBrowserTests().catch(error => {
    console.error('Cross-browser test runner failed:', error)
    process.exit(1)
  })
}

export { runCrossBrowserTests, BrowserTestResult, TestSuite }