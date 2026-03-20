import dotenv from 'dotenv'
import { jest } from '@jest/globals'

dotenv.config()

// Set test timeout for all tests
jest.setTimeout(120000)

// Global test configuration
global.testConfig = {
  baseURL: process.env.TEST_BASE_URL || 'https://rankrise-frontend.pages.dev',
  headless: process.env.HEADLESS === 'true',
  browserTimeout: 30000,
  waitTimeout: 10000,
}

console.log('\n🧪 Test Configuration:')
console.log(`   Base URL: ${global.testConfig.baseURL}`)
console.log(`   Headless: ${global.testConfig.headless}`)
console.log(`   Browser Timeout: ${global.testConfig.browserTimeout}ms\n`)
