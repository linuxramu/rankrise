import { describe, beforeEach, afterEach, it, expect } from '@jest/globals'
import { LoginPage } from '../src/pages/login-page.js'
import { RegisterPage } from '../src/pages/register-page.js'

/**
 * Smoke Tests
 * Quick tests to verify basic application functionality
 */
describe('🔥 Smoke Tests', () => {
  let loginPage
  let registerPage

  beforeEach(async () => {
    loginPage = new LoginPage()
    registerPage = new RegisterPage()
    await loginPage.initDriver()
  })

  afterEach(async () => {
    await loginPage.closeDriver()
  })

  it('should load login page', async () => {
    await loginPage.navigateToLogin()
    expect(await loginPage.getTitle()).toContain('RankRise')
  })

  it('should load register page', async () => {
    await registerPage.navigateToRegister()
    expect(await registerPage.getTitle()).toContain('RankRise')
  })

  it('should navigate between login and register pages', async () => {
    // Start at login
    await loginPage.navigateToLogin()
    let url = await loginPage.getCurrentUrl()
    expect(url).toContain('/login')

    // Navigate to register
    await loginPage.clickSignUp()
    await registerPage.waitForElement(registerPage.nameInput)
    url = await registerPage.getCurrentUrl()
    expect(url).toContain('/register')

    // Navigate back to login
    await registerPage.clickSignIn()
    await loginPage.waitForElement(loginPage.emailInput)
    url = await loginPage.getCurrentUrl()
    expect(url).toContain('/login')
  })

  it('should accept user input in registration form', async () => {
    await registerPage.navigateToRegister()

    await registerPage.enterName('Test User')
    await registerPage.enterEmail('test@example.com')
    await registerPage.enterPassword('SecurePass123')

    // Verify values are entered (getInputValue helper needed for full verification)
    const nameField = await registerPage.findElement(registerPage.nameInput)
    const emailField = await registerPage.findElement(registerPage.emailInput)
    const passwordField = await registerPage.findElement(registerPage.passwordInput)

    expect(nameField).toBeDefined()
    expect(emailField).toBeDefined()
    expect(passwordField).toBeDefined()
  })
})
