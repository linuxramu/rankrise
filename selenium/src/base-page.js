import { Builder, By, until, Key } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'

/**
 * Base class for all Selenium tests
 * Provides common functionality like browser setup, navigation, etc.
 */
export class BasePage {
  constructor() {
    this.driver = null
    this.timeout = process.env.EXPLICIT_WAIT || 15000
  }

  /**
   * Initialize WebDriver
   */
  async initDriver() {
    const options = new chrome.Options()

    // Set headless mode
    if (global.testConfig?.headless) {
      options.addArguments('--headless')
    }

    // Add other useful arguments
    options.addArguments(
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1920,1080'
    )

    // Disable notifications
    options.excludeSwitch('enable-automation')
    options.setUserPreferences({
      'profile.default_content_setting_values.notifications': 2,
    })

    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build()

    // Set implicit wait
    await this.driver.manage().setTimeouts({
      implicit: 10000,
      pageLoad: 30000,
    })

    return this.driver
  }

  /**
   * Close the WebDriver
   */
  async closeDriver() {
    if (this.driver) {
      await this.driver.quit()
    }
  }

  /**
   * Navigate to URL
   */
  async navigate(url) {
    await this.driver.get(url)
    await this.driver.wait(until.titleIs('RankRise'), this.timeout)
  }

  /**
   * Find element by locator
   */
  async findElement(locator) {
    return await this.driver.wait(until.elementLocated(locator), this.timeout)
  }

  /**
   * Find multiple elements
   */
  async findElements(locator) {
    return await this.driver.findElements(locator)
  }

  /**
   * Enter text in input field
   */
  async enterText(locator, text) {
    const element = await this.findElement(locator)
    await element.clear()
    await element.sendKeys(text)
  }

  /**
   * Click element
   */
  async click(locator) {
    const element = await this.findElement(locator)
    await this.driver.wait(until.elementIsVisible(element), this.timeout)
    await element.click()
  }

  /**
   * Get element text
   */
  async getText(locator) {
    const element = await this.findElement(locator)
    return await element.getText()
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator) {
    const element = await this.findElement(locator)
    await this.driver.wait(until.elementIsVisible(element), this.timeout)
    return element
  }

  /**
   * Wait for element to disappear
   */
  async waitForElementToDisappear(locator) {
    await this.driver.wait(until.stalenessOf(await this.findElement(locator)), this.timeout)
  }

  /**
   * Check if element is displayed
   */
  async isDisplayed(locator) {
    try {
      const element = await this.findElement(locator)
      return await element.isDisplayed()
    } catch {
      return false
    }
  }

  /**
   * Get page title
   */
  async getTitle() {
    return await this.driver.getTitle()
  }

  /**
   * Get current URL
   */
  async getCurrentUrl() {
    return await this.driver.getCurrentUrl()
  }

  /**
   * Execute JavaScript
   */
  async executeScript(script, ...args) {
    return await this.driver.executeScript(script, ...args)
  }

  /**
   * Switch to alert and accept
   */
  async acceptAlert() {
    const alert = await this.driver.switchTo().alert()
    await alert.accept()
  }

  /**
   * Refresh page
   */
  async refreshPage() {
    await this.driver.navigate().refresh()
  }

  /**
   * Go back
   */
  async goBack() {
    await this.driver.navigate().back()
  }

  /**
   * Sleep utility
   */
  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(filename) {
    const screenshot = await this.driver.takeScreenshot()
    const fs = await import('fs/promises')
    await fs.writeFile(`./screenshots/${filename}.png`, screenshot, 'base64')
  }

  /**
   * Clear localStorage
   */
  async clearLocalStorage() {
    await this.executeScript('window.localStorage.clear();')
  }

  /**
   * Clear cookies
   */
  async clearCookies() {
    await this.driver.manage().deleteAllCookies()
  }

  /**
   * Get localStorage value
   */
  async getLocalStorageValue(key) {
    return await this.executeScript(`return window.localStorage.getItem('${key}');`)
  }
}
