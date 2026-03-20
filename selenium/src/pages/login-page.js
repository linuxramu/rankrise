import { By } from 'selenium-webdriver'
import { BasePage } from './base-page.js'

/**
 * Login Page Object
 */
export class LoginPage extends BasePage {
  // Locators
  emailInput = By.id('email')
  passwordInput = By.id('password')
  signInButton = By.xpath("//button[contains(text(), 'Sign in')]")
  errorMessage = By.xpath("//div[@class='rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700']")
  welcomeHeading = By.xpath("//h1[contains(text(), 'Welcome to RankRise')]")
  signUpLink = By.xpath("//a[contains(text(), 'Sign up')]")

  /**
   * Navigate to login page
   */
  async navigateToLogin() {
    await this.navigate(`${global.testConfig.baseURL}/login`)
    await this.waitForElement(this.emailInput)
  }

  /**
   * Enter email
   */
  async enterEmail(email) {
    await this.enterText(this.emailInput, email)
  }

  /**
   * Enter password
   */
  async enterPassword(password) {
    await this.enterText(this.passwordInput, password)
  }

  /**
   * Click sign in button
   */
  async clickSignIn() {
    await this.click(this.signInButton)
  }

  /**
   * Login with credentials
   */
  async login(email, password) {
    await this.enterEmail(email)
    await this.enterPassword(password)
    await this.clickSignIn()
  }

  /**
   * Get error message
   */
  async getErrorMessage() {
    if (await this.isDisplayed(this.errorMessage)) {
      return await this.getText(this.errorMessage)
    }
    return null
  }

  /**
   * Is welcome heading displayed
   */
  async isWelcomeHeadingDisplayed() {
    return await this.isDisplayed(this.welcomeHeading)
  }

  /**
   * Click sign up link
   */
  async clickSignUp() {
    await this.click(this.signUpLink)
  }
}
