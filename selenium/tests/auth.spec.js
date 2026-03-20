import { describe, beforeEach, afterEach, it, expect } from '@jest/globals'
import { LoginPage } from '../src/pages/login-page.js'
import { RegisterPage } from '../src/pages/register-page.js'
import { DashboardPage } from '../src/pages/dashboard-page.js'

/**
 * Authentication Tests
 */
describe('🔐 Authentication Tests', () => {
  let loginPage
  let registerPage
  let dashboardPage

  beforeEach(async () => {
    loginPage = new LoginPage()
    registerPage = new RegisterPage()
    dashboardPage = new DashboardPage()
    await loginPage.initDriver()
  })

  afterEach(async () => {
    await loginPage.closeDriver()
  })

  describe('✅ Login Page', () => {
    it('should display welcome heading', async () => {
      await loginPage.navigateToLogin()
      const isDisplayed = await loginPage.isWelcomeHeadingDisplayed()
      expect(isDisplayed).toBe(true)
    })

    it('should display email and password fields', async () => {
      await loginPage.navigateToLogin()
      const emailFieldDisplayed = await loginPage.isDisplayed(loginPage.emailInput)
      const passwordFieldDisplayed = await loginPage.isDisplayed(loginPage.passwordInput)
      expect(emailFieldDisplayed).toBe(true)
      expect(passwordFieldDisplayed).toBe(true)
    })

    it('should show error on invalid credentials', async () => {
      await loginPage.navigateToLogin()
      await loginPage.login('invalid@test.com', 'wrongpassword')
      await loginPage.sleep(2000) // Wait for error message
      
      const errorMessage = await loginPage.getErrorMessage()
      expect(errorMessage).not.toBeNull()
      expect(errorMessage).toContain('Invalid email or password')
    })

    it('should have sign up link', async () => {
      await loginPage.navigateToLogin()
      const signUpLinkDisplayed = await loginPage.isDisplayed(loginPage.signUpLink)
      expect(signUpLinkDisplayed).toBe(true)
    })

    it('should navigate to sign up page when clicking sign up link', async () => {
      await loginPage.navigateToLogin()
      await loginPage.clickSignUp()
      await registerPage.waitForElement(registerPage.nameInput)
      
      const url = await loginPage.getCurrentUrl()
      expect(url).toContain('/register')
    })
  })

  describe('✅ Registration Page', () => {
    beforeEach(async () => {
      await registerPage.navigateToRegister()
    })

    it('should display all form fields', async () => {
      const nameFieldDisplayed = await registerPage.isDisplayed(registerPage.nameInput)
      const emailFieldDisplayed = await registerPage.isDisplayed(registerPage.emailInput)
      const passwordFieldDisplayed = await registerPage.isDisplayed(registerPage.passwordInput)
      const confirmPasswordDisplayed = await registerPage.isDisplayed(registerPage.confirmPasswordInput)

      expect(nameFieldDisplayed).toBe(true)
      expect(emailFieldDisplayed).toBe(true)
      expect(passwordFieldDisplayed).toBe(true)
      expect(confirmPasswordDisplayed).toBe(true)
    })

    it('should display password criteria checklist when typing password', async () => {
      await registerPage.enterPassword('Test')
      await registerPage.sleep(500)

      const criteriaDisplayed = await registerPage.isPasswordCriteriaDisplayed()
      expect(criteriaDisplayed).toBe(true)
    })

    it('should show password match indicator when passwords match', async () => {
      await registerPage.enterPassword('SecurePass123')
      await registerPage.enterConfirmPassword('SecurePass123')
      await registerPage.sleep(500)

      const matchDisplayed = await registerPage.isPasswordsMatchDisplayed()
      expect(matchDisplayed).toBe(true)
    })

    it('should show error when passwords do not match', async () => {
      await registerPage.enterPassword('SecurePass123')
      await registerPage.enterConfirmPassword('DifferentPass456')
      await registerPage.sleep(500)

      const confirmPasswordError = await registerPage.getConfirmPasswordError()
      expect(confirmPasswordError).not.toBeNull()
      expect(confirmPasswordError).toContain('Passwords do not match')
    })

    it('should show error for invalid password format', async () => {
      await registerPage.enterPassword('weak')
      await registerPage.sleep(500)

      const passwordError = await registerPage.getPasswordError()
      expect(passwordError).not.toBeNull()
    })

    it('should have sign in link', async () => {
      const signInLinkDisplayed = await registerPage.isDisplayed(registerPage.signInLink)
      expect(signInLinkDisplayed).toBe(true)
    })

    it('should navigate to login page when clicking sign in link', async () => {
      await registerPage.clickSignIn()
      await loginPage.waitForElement(loginPage.emailInput)

      const url = await registerPage.getCurrentUrl()
      expect(url).toContain('/login')
    })
  })

  describe('✅ Registration Flow', () => {
    it('should successfully register a new user', async () => {
      const timestamp = Date.now()
      const email = `test_${timestamp}@example.com`

      await registerPage.navigateToRegister()
      await registerPage.register('Test User', email, 'SecurePass123')
      await registerPage.sleep(3000) // Wait for registration and redirect

      // Should redirect to dashboard
      const url = await registerPage.getCurrentUrl()
      expect(url).toContain('/dashboard')
    })

    it('should show email already registered error on duplicate', async () => {
      const email = 'duplicate@test.com'

      // First registration
      await registerPage.navigateToRegister()
      await registerPage.register('First User', email, 'SecurePass123')
      await registerPage.sleep(2000)

      // Attempt second registration with same email
      await registerPage.navigateToRegister()
      await registerPage.register('Second User', email, 'SecurePass123')
      await registerPage.sleep(2000)

      const emailError = await registerPage.getEmailError()
      expect(emailError).not.toBeNull()
      expect(emailError).toContain('already')
    })
  })

  describe('✅ Login Flow', () => {
    it('should successfully login with valid credentials after registration', async () => {
      const timestamp = Date.now()
      const email = `login_test_${timestamp}@example.com`
      const password = 'SecurePass123'

      // Register first
      await registerPage.navigateToRegister()
      await registerPage.register('Login Test User', email, password)
      await registerPage.sleep(2000)

      // Logout by clearing token
      await registerPage.clearLocalStorage()
      await registerPage.clearCookies()

      // Navigate to login
      await loginPage.navigateToLogin()
      await loginPage.login(email, password)
      await loginPage.sleep(3000)

      // Should redirect to dashboard
      const url = await loginPage.getCurrentUrl()
      expect(url).toContain('/dashboard')
    })
  })

  describe('✅ Dashboard Access', () => {
    it('should display dashboard after successful login', async () => {
      const timestamp = Date.now()
      const email = `dashboard_test_${timestamp}@example.com`

      // Register
      await registerPage.navigateToRegister()
      await registerPage.register('Dashboard Test', email, 'SecurePass123')
      await registerPage.sleep(2000)

      // Verify dashboard is loaded
      const isDashboardLoaded = await dashboardPage.isDashboardLoaded()
      expect(isDashboardLoaded).toBe(true)
    })

    it('should display navigation links on dashboard', async () => {
      const timestamp = Date.now()
      const email = `nav_test_${timestamp}@example.com`

      // Register
      await registerPage.navigateToRegister()
      await registerPage.register('Nav Test', email, 'SecurePass123')
      await registerPage.sleep(2000)

      // Check navigation links
      const testsLinkDisplayed = await dashboardPage.isDisplayed(dashboardPage.testsLink)
      const analyticsLinkDisplayed = await dashboardPage.isDisplayed(dashboardPage.analyticsLink)
      const leaderboardLinkDisplayed = await dashboardPage.isDisplayed(dashboardPage.leaderboardLink)

      expect(testsLinkDisplayed).toBe(true)
      expect(analyticsLinkDisplayed).toBe(true)
      expect(leaderboardLinkDisplayed).toBe(true)
    })
  })
})
