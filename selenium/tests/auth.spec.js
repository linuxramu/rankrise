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

  describe('✅ Field-Level Validation Tests', () => {
    beforeEach(async () => {
      await registerPage.navigateToRegister()
    })

    it('should show error for empty name field', async () => {
      await registerPage.enterEmail('test@example.com')
      await registerPage.enterPassword('SecurePass123')
      await registerPage.enterConfirmPassword('SecurePass123')
      await registerPage.clickRegisterButton()
      await registerPage.sleep(1000)

      const nameError = await registerPage.getNameError()
      expect(nameError).not.toBeNull()
    })

    it('should show error for empty email field', async () => {
      await registerPage.enterName('Test User')
      await registerPage.enterPassword('SecurePass123')
      await registerPage.enterConfirmPassword('SecurePass123')
      await registerPage.clickRegisterButton()
      await registerPage.sleep(1000)

      const emailError = await registerPage.getEmailError()
      expect(emailError).not.toBeNull()
    })

    it('should show error for invalid email format', async () => {
      await registerPage.enterName('Test User')
      await registerPage.enterEmail('invalid-email')
      await registerPage.sleep(500)

      const emailError = await registerPage.getEmailError()
      expect(emailError).not.toBeNull()
      expect(emailError).toContain('valid')
    })

    it('should show error for password less than 8 characters', async () => {
      await registerPage.enterPassword('Short1')
      await registerPage.sleep(500)

      const passwordError = await registerPage.getPasswordError()
      expect(passwordError).not.toBeNull()
    })

    it('should show error for password without uppercase letter', async () => {
      await registerPage.enterPassword('securepass123')
      await registerPage.sleep(500)

      const passwordError = await registerPage.getPasswordError()
      expect(passwordError).not.toBeNull()
    })

    it('should show error for password without lowercase letter', async () => {
      await registerPage.enterPassword('SECUREPASS123')
      await registerPage.sleep(500)

      const passwordError = await registerPage.getPasswordError()
      expect(passwordError).not.toBeNull()
    })

    it('should show error for password without number', async () => {
      await registerPage.enterPassword('SecurePass')
      await registerPage.sleep(500)

      const passwordError = await registerPage.getPasswordError()
      expect(passwordError).not.toBeNull()
    })

    it('should validate all criteria in real-time', async () => {
      // Type password step by step and verify criteria updates
      await registerPage.enterPassword('S')
      await registerPage.sleep(300)
      let criteria = await registerPage.getPasswordCriteria()
      expect(criteria).toBeDefined()

      await registerPage.clearPasswordField()
      await registerPage.enterPassword('Secure1')
      await registerPage.sleep(300)
      criteria = await registerPage.getPasswordCriteria()
      expect(criteria).toBeDefined()
    })

    it('should clear error when correcting invalid input', async () => {
      // Enter invalid email
      await registerPage.enterEmail('invalid-email')
      await registerPage.sleep(500)
      let emailError = await registerPage.getEmailError()
      expect(emailError).not.toBeNull()

      // Correct to valid email
      await registerPage.clearEmailField()
      await registerPage.enterEmail('valid@example.com')
      await registerPage.sleep(500)
      emailError = await registerPage.getEmailError()
      expect(emailError).toBeNull()
    })
  })

  describe('✅ Dynamic User Registration and Sign In', () => {
    it('should create new user and sign in successfully', async () => {
      const timestamp = Date.now()
      const testUser = {
        name: `Dynamic User ${timestamp}`,
        email: `dynamic_${timestamp}@example.com`,
        password: 'DynamicPass123',
      }

      // Step 1: Register the dynamic user
      await registerPage.navigateToRegister()
      await registerPage.register(testUser.name, testUser.email, testUser.password)
      await registerPage.sleep(3000)

      // Verify registration successful - should be on dashboard
      let url = await registerPage.getCurrentUrl()
      expect(url).toContain('/dashboard')

      // Step 2: Clear authentication and logout
      await registerPage.clearLocalStorage()
      await registerPage.clearCookies()

      // Step 3: Sign in with the same credentials
      await loginPage.navigateToLogin()
      await loginPage.login(testUser.email, testUser.password)
      await loginPage.sleep(3000)

      // Verify sign in successful
      url = await loginPage.getCurrentUrl()
      expect(url).toContain('/dashboard')

      // Verify dashboard loaded with user authenticated
      const isDashboardLoaded = await dashboardPage.isDashboardLoaded()
      expect(isDashboardLoaded).toBe(true)
    })

    it('should create multiple users and verify unique emails', async () => {
      const timestamp = Date.now()
      const users = [
        {
          name: `User One ${timestamp}`,
          email: `user_one_${timestamp}@example.com`,
          password: 'UserOne123',
        },
        {
          name: `User Two ${timestamp}`,
          email: `user_two_${timestamp}@example.com`,
          password: 'UserTwo123',
        },
      ]

      // Register first user
      await registerPage.navigateToRegister()
      await registerPage.register(users[0].name, users[0].email, users[0].password)
      await registerPage.sleep(2000)

      // Clear and register second user
      await registerPage.clearLocalStorage()
      await registerPage.clearCookies()
      await registerPage.navigateToRegister()
      await registerPage.register(users[1].name, users[1].email, users[1].password)
      await registerPage.sleep(2000)

      // Verify second registration successful
      const url = await registerPage.getCurrentUrl()
      expect(url).toContain('/dashboard')
    })

    it('should prevent duplicate email registration after user creation', async () => {
      const timestamp = Date.now()
      const email = `unique_${timestamp}@example.com`

      // Create first user
      await registerPage.navigateToRegister()
      await registerPage.register('First User', email, 'FirstPass123')
      await registerPage.sleep(2000)

      // Try to create another user with same email
      await registerPage.clearLocalStorage()
      await registerPage.clearCookies()
      await registerPage.navigateToRegister()
      await registerPage.register('Second User', email, 'SecondPass123')
      await registerPage.sleep(2000)

      // Should show duplicate email error and stay on register page
      const emailError = await registerPage.getEmailError()
      const url = await registerPage.getCurrentUrl()

      expect(emailError).not.toBeNull()
      expect(url).toContain('/register')
    })

    it('should sign in fail with wrong password for valid user', async () => {
      const timestamp = Date.now()
      const email = `failtest_${timestamp}@example.com`
      const correctPassword = 'CorrectPass123'
      const wrongPassword = 'WrongPass123'

      // Register user
      await registerPage.navigateToRegister()
      await registerPage.register('Fail Test User', email, correctPassword)
      await registerPage.sleep(2000)

      // Clear and try to login with wrong password
      await registerPage.clearLocalStorage()
      await registerPage.clearCookies()
      await loginPage.navigateToLogin()
      await loginPage.login(email, wrongPassword)
      await loginPage.sleep(2000)

      // Should show error and stay on login page
      const errorMessage = await loginPage.getErrorMessage()
      const url = await loginPage.getCurrentUrl()

      expect(errorMessage).not.toBeNull()
      expect(url).toContain('/login')
    })

    it('should maintain session after sign in with dynamic user', async () => {
      const timestamp = Date.now()
      const testUser = {
        name: `Session User ${timestamp}`,
        email: `session_${timestamp}@example.com`,
        password: 'SessionPass123',
      }

      // Register and login
      await registerPage.navigateToRegister()
      await registerPage.register(testUser.name, testUser.email, testUser.password)
      await registerPage.sleep(2000)

      // Verify on dashboard
      let url = await dashboardPage.getCurrentUrl()
      expect(url).toContain('/dashboard')

      // Navigate away and back to verify session persists
      await dashboardPage.navigateToLogin()
      await dashboardPage.sleep(1000)

      // Try to navigate to dashboard directly - should work due to session
      await dashboardPage.navigateTo(`${global.testConfig.baseURL}/dashboard`)
      await dashboardPage.sleep(2000)

      const isDashboardLoaded = await dashboardPage.isDashboardLoaded()
      expect(isDashboardLoaded).toBe(true)
    })
  })
})
