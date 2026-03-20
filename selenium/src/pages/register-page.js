import { By } from 'selenium-webdriver'
import { BasePage } from '../base-page.js'

/**
 * Register Page Object
 */
export class RegisterPage extends BasePage {
  // Locators
  nameInput = By.id('name')
  emailInput = By.id('email')
  passwordInput = By.id('password')
  confirmPasswordInput = By.id('confirmPassword')
  targetExamSelect = By.id('exam')
  createAccountButton = By.xpath("//button[contains(text(), 'Create account')]")
  signInLink = By.xpath("//a[contains(text(), 'Sign in')]")

  // Error messages
  nameError = By.xpath("//label[contains(text(), 'Full Name')]/following-sibling::*//p[@class='text-xs text-red-600']")
  emailError = By.xpath("//label[contains(text(), 'Email Address')]/following-sibling::*//p[@class='text-xs text-red-600']")
  passwordError = By.xpath("//label[contains(text(), 'Password')]/following-sibling::*//p[@class='text-xs text-red-600']")
  confirmPasswordError = By.xpath("//label[contains(text(), 'Confirm Password')]/following-sibling::*//p[@class='text-xs text-red-600']")

  // Validation feedback
  passwordMatchIndicator = By.xpath("//div[contains(text(), 'Passwords match')]")
  passwordCriteria = By.xpath("//div[@class='rounded-lg bg-gray-50 p-3']")

  /**
   * Navigate to register page
   */
  async navigateToRegister() {
    await this.navigate(`${global.testConfig.baseURL}/register`)
    await this.waitForElement(this.nameInput)
  }

  /**
   * Enter name
   */
  async enterName(name) {
    await this.enterText(this.nameInput, name)
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
   * Enter confirm password
   */
  async enterConfirmPassword(password) {
    await this.enterText(this.confirmPasswordInput, password)
  }

  /**
   * Select target exam
   */
  async selectTargetExam(examValue) {
    const select = await this.findElement(this.targetExamSelect)
    await select.sendKeys(examValue)
  }

  /**
   * Click create account button
   */
  async clickCreateAccount() {
    await this.click(this.createAccountButton)
  }

  /**
   * Click register button (alias)
   */
  async clickRegisterButton() {
    await this.clickCreateAccount()
  }

  /**
   * Register with full details
   */
  async register(name, email, password, exam = 'JEE_MAINS') {
    await this.enterName(name)
    await this.enterEmail(email)
    await this.enterPassword(password)
    await this.enterConfirmPassword(password)
    await this.selectTargetExam(exam)
    await this.clickCreateAccount()
  }

  /**
   * Get name error message
   */
  async getNameError() {
    if (await this.isDisplayed(this.nameError)) {
      return await this.getText(this.nameError)
    }
    return null
  }

  /**
   * Get email error message
   */
  async getEmailError() {
    if (await this.isDisplayed(this.emailError)) {
      return await this.getText(this.emailError)
    }
    return null
  }

  /**
   * Get password error message
   */
  async getPasswordError() {
    if (await this.isDisplayed(this.passwordError)) {
      return await this.getText(this.passwordError)
    }
    return null
  }

  /**
   * Get confirm password error message
   */
  async getConfirmPasswordError() {
    if (await this.isDisplayed(this.confirmPasswordError)) {
      return await this.getText(this.confirmPasswordError)
    }
    return null
  }

  /**
   * Clear password field
   */
  async clearPasswordField() {
    const element = await this.findElement(this.passwordInput)
    // Select all and delete
    await element.clear()
  }

  /**
   * Clear email field
   */
  async clearEmailField() {
    const element = await this.findElement(this.emailInput)
    await element.clear()
  }

  /**
   * Get password criteria object
   */
  async getPasswordCriteria() {
    if (await this.isDisplayed(this.passwordCriteria)) {
      return await this.getText(this.passwordCriteria)
    }
    return null
  }

  /**
   * Is passwords match indicator displayed
   */
  async isPasswordsMatchDisplayed() {
    return await this.isDisplayed(this.passwordMatchIndicator)
  }

  /**
   * Is password criteria checklist displayed
   */
  async isPasswordCriteriaDisplayed() {
    return await this.isDisplayed(this.passwordCriteria)
  }

  /**
   * Click sign in link
   */
  async clickSignIn() {
    await this.click(this.signInLink)
  }
}
