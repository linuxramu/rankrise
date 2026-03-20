import { By } from 'selenium-webdriver'
import { BasePage } from '../base-page.js'

/**
 * Dashboard Page Object
 */
export class DashboardPage extends BasePage {
  // Locators
  dashboardHeading = By.xpath("//h1[contains(text(), 'Dashboard')]")
  testsLink = By.xpath("//a[contains(text(), 'Tests')]")
  analyticsLink = By.xpath("//a[contains(text(), 'Analytics')]")
  leaderboardLink = By.xpath("//a[contains(text(), 'Leaderboard')]")
  logoutButton = By.xpath("//button[contains(text(), 'Logout')]")
  userMenu = By.xpath("//div[@class='flex items-center gap-3']")

  /**
   * Navigate to dashboard
   */
  async navigateToDashboard() {
    await this.navigate(`${global.testConfig.baseURL}/dashboard`)
    await this.waitForElement(this.dashboardHeading)
  }

  /**
   * Is dashboard loaded
   */
  async isDashboardLoaded() {
    return await this.isDisplayed(this.dashboardHeading)
  }

  /**
   * Click tests link
   */
  async clickTestsLink() {
    await this.click(this.testsLink)
  }

  /**
   * Click analytics link
   */
  async clickAnalyticsLink() {
    await this.click(this.analyticsLink)
  }

  /**
   * Click leaderboard link
   */
  async clickLeaderboardLink() {
    await this.click(this.leaderboardLink)
  }

  /**
   * Logout
   */
  async logout() {
    // First click user menu to show logout button
    await this.click(this.userMenu)
    await this.sleep(500) // Wait for menu animation
    await this.click(this.logoutButton)
  }
}
