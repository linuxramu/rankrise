# 🧪 RankRise E2E Tests with Selenium

Comprehensive end-to-end testing suite for RankRise using Selenium WebDriver with Jest and Allure reporting.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Page Objects](#page-objects)
- [Writing Tests](#writing-tests)
- [CI/CD Pipeline](#cicd-pipeline)
- [Reports & Dashboards](#reports--dashboards)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This E2E test suite validates the functionality of the RankRise platform end-to-end:
- User authentication (registration & login)
- Form validation
- Navigation flows
- Dashboard access
- Error handling

**Technology Stack:**
- 🤖 **Selenium WebDriver 4** - Browser automation
- 🧪 **Jest** - Test framework & runner
- 📊 **Allure Report** - Beautiful test reporting & dashboards
- ⚙️ **Node.js** - Runtime
- 🔄 **GitHub Actions** - CI/CD automation

---

## ✨ Features

- ✅ **Page Object Model** - Maintainable test code structure
- ✅ **Headless Mode** - Faster test execution in CI/CD
- ✅ **Allure Reports** - Rich HTML dashboards with trends
- ✅ **Parallel Testing** - Run tests concurrently (configurable)
- ✅ **Screenshot Capture** - Auto-capture on failures
- ✅ **Environment Config** - Support for multiple environments
- ✅ **CI/CD Integration** - GitHub Actions pipeline included
- ✅ **Smoke Tests** - Quick sanity checks
- ✅ **Full Auth Flow Tests** - Register, login, dashboard access

---

## 🚀 Setup

### Prerequisites

- Node.js 18+ ([download](https://nodejs.org/))
- Google Chrome or Chromium ([download](https://www.google.com/chrome/))
- Chrome Driver (auto-downloaded by Selenium)

### Installation

```bash
# Navigate to selenium folder
cd selenium

# Install dependencies
npm install

# Copy .env.example to .env and update if needed
cp .env.example .env
```

### Environment Configuration

Create a `.env` file in the `selenium/` folder:

```env
# Frontend URL
TEST_BASE_URL=https://rankrise-frontend.pages.dev

# Test User (optional - auto-generated with timestamps)
TEST_USER_EMAIL=testuser@example.com
TEST_USER_PASSWORD=SecurePass123
TEST_USER_NAME=Test User

# Browser settings
HEADLESS=false        # Set to true for headless mode
BROWSER=chrome

# Timeouts
IMPLICIT_WAIT=10000
EXPLICIT_WAIT=15000
PAGE_LOAD_TIMEOUT=30000
```

---

## 🏃 Running Tests

### Quick Start

```bash
# Run all tests
npm test

# Run with verbose output
npm run test:debug

# Run tests in debug mode (browser stays open)
npm run test:watch

# Run in headless mode (CI-friendly)
npm run test:headless

# Run specific test file
npm test tests/auth.spec.js

# Run specific test by pattern
npm test -- --testNamePattern="Login"
```

### Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests with default output |
| `npm run test:debug` | Run with verbose logging |
| `npm run test:watch` | Run in watch mode (rerun on changes) |
| `npm run test:headless` | Run in headless mode (no browser UI) |
| `npm run test:ci` | Run with coverage (for CI/CD) |

### Running Specific Suites

```bash
# Run only smoke tests
npm test tests/smoke.spec.js

# Run only auth tests
npm test tests/auth.spec.js

# Run tests matching pattern
npm test -- --testNamePattern="Registration"
```

---

## 📁 Project Structure

```
selenium/
├── src/
│   ├── base-page.js           # Base class with common methods
│   └── pages/
│       ├── login-page.js       # Login page object
│       ├── register-page.js    # Registration page object
│       └── dashboard-page.js   # Dashboard page object
├── tests/
│   ├── auth.spec.js            # Auth flow tests
│   └── smoke.spec.js           # Smoke tests
├── screenshots/                # Failed test screenshots
├── allure-results/             # Test results (JSON)
├── allure-report/              # Generated HTML report
├── jest.config.js              # Jest configuration
├── jest.setup.js               # Jest setup hooks
├── package.json                # Dependencies & scripts
├── .env.example                # Environment template
└── README.md                   # This file
```

---

## 🎭 Page Objects

Page Objects encapsulate page elements and interactions. Each page has:
- **Locators** - Element selectors
- **Methods** - User actions (login, register, etc.)
- **Assertions** - Check element state

### Example: LoginPage

```javascript
import { LoginPage } from '../src/pages/login-page.js'

const loginPage = new LoginPage()
await loginPage.initDriver()

// Navigate to login
await loginPage.navigateToLogin()

// Perform login
await loginPage.login('user@example.com', 'password123')

// Check results
const dashboardUrl = await loginPage.getCurrentUrl()
expect(dashboardUrl).toContain('/dashboard')

// Cleanup
await loginPage.closeDriver()
```

### Available Page Objects

#### LoginPage
- `navigateToLogin()` - Go to login page
- `enterEmail(email)` - Enter email
- `enterPassword(password)` - Enter password
- `clickSignIn()` - Click sign in button
- `login(email, password)` - Login shortcut
- `getErrorMessage()` - Get error text
- `isWelcomeHeadingDisplayed()` - Check heading

#### RegisterPage
- `navigateToRegister()` - Go to register page
- `enterName(name)` - Enter name
- `enterEmail(email)` - Enter email
- `enterPassword(password)` - Enter password
- `enterConfirmPassword(password)` - Confirm password
- `selectTargetExam(exam)` - Select exam
- `register(name, email, password, exam)` - Register shortcut
- `getEmailError()` - Get email error
- `isPasswordsMatchDisplayed()` - Check password match
- `isPasswordCriteriaDisplayed()` - Check criteria checklist

#### DashboardPage
- `navigateToDashboard()` - Go to dashboard
- `isDashboardLoaded()` - Check if loaded
- `clickTestsLink()` - Navigate to tests
- `clickAnalyticsLink()` - Navigate to analytics
- `clickLeaderboardLink()` - Navigate to leaderboard
- `logout()` - Logout user

### BasePage Methods (Available to All Pages)

```javascript
// Navigation
await page.navigate(url)
await page.refreshPage()
await page.goBack()

// Element Interaction
await page.click(locator)
await page.enterText(locator, text)
await page.getText(locator)
await page.isDisplayed(locator)

// Waiting
await page.findElement(locator)
await page.waitForElement(locator)
await page.waitForElementToDisappear(locator)

// Browser Control
await page.takeScreenshot(filename)
await page.executeScript(script)
await page.clearLocalStorage()
await page.clearCookies()

// Utilities
await page.sleep(milliseconds)
await page.getTitle()
await page.getCurrentUrl()
```

---

## ✍️ Writing Tests

### Test Structure

```javascript
import { describe, it, beforeEach, afterEach, expect } from '@jest/globals'
import { LoginPage } from '../src/pages/login-page.js'

describe('Login Tests', () => {
  let loginPage

  beforeEach(async () => {
    loginPage = new LoginPage()
    await loginPage.initDriver()
  })

  afterEach(async () => {
    await loginPage.closeDriver()
  })

  it('should login successfully', async () => {
    // Arrange
    await loginPage.navigateToLogin()
    
    // Act
    await loginPage.login('user@example.com', 'password123')
    await loginPage.sleep(2000)
    
    // Assert
    const url = await loginPage.getCurrentUrl()
    expect(url).toContain('/dashboard')
  })
})
```

### Best Practices

1. **One Test = One Scenario** - Each test should test one thing
2. **Arrange-Act-Assert** - Structure tests clearly
3. **Use Page Objects** - Avoid direct locator usage
4. **Add Waits** - Use `waitForElement()` for dynamic content
5. **Meaningful Names** - Test names should describe what's tested
6. **Cleanup** - Always close driver in `afterEach`
7. **Use Unique Data** - Generate unique emails with timestamps

```javascript
// Good: Unique email per test
const timestamp = Date.now()
const email = `test_${timestamp}@example.com`
await registerPage.register('Test', email, 'SecurePass123')

// Good: Clear test name
it('should show error on duplicate email registration', async () => {
  // ...
})

// Bad: Unclear test names
it('test1', async () => { })
it('does stuff', async () => { })
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The pipeline runs automatically:

**Triggers:**
- ✅ Push to `main` or `develop` branches
- ✅ Pull requests to `main` or `develop`
- ✅ Daily schedule (2 AM UTC)
- ✅ Manual trigger (workflow_dispatch)

**Workflow Steps:**

```
1. Checkout Code
   ↓
2. Setup Node.js 18
   ↓
3. Setup Chrome & ChromeDriver
   ↓
4. Install Dependencies
   ↓
5. Run Smoke Tests
   ↓
6. Run Auth Tests
   ↓
7. Generate Allure Report (if always)
   ↓
8. Upload Report to Artifacts
   ↓
9. Deploy Report to GitHub Pages (main branch only)
   ↓
10. Comment PR with Results
```

### Accessing Results

**After Each Run:**
1. Go to GitHub Actions tab
2. Click the test workflow run
3. Download "allure-report" artifact
4. Open `index.html` in browser

**GitHub Pages (Main Branch):**
- Reports auto-published to: `https://<username>.github.io/rankrise/`

### PR Comments

Tests automatically comment on PRs:
```
✅ E2E Tests completed! Download the Allure Report from artifacts 
   to view detailed test results.
```

---

## 📊 Reports & Dashboards

### Generate Local Report

```bash
# Generate Allure report from results
npm run test:report

# Or serve report locally
npm run test:report:serve

# Then open http://localhost:8080
```

### Allure Report Features

**Dashboard:**
- ✅ Total tests passed/failed/skipped
- 📈 Pass rate trends
- 🕐 Test duration analysis

**Test List:**
- Per-test status and duration
- Detailed test steps
- Attached screenshots
- Error messages

**Defects:**
- Failed tests grouped by error
- Stacktraces
- Video/screenshot evidence

**Suites:**
- Test hierarchy
- Breakdown by feature

### Report Elements

**Test Details:**
```
✅ Test Name: "should successfully register a new user"
├── Duration: 3.2s
├── Status: PASSED
├── Screenshots: 2 attached
└── Steps:
    └── Navigate to register page
    └── Enter user details
    └── Click create account
    └── Verify dashboard redirect
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. **Chrome/ChromeDriver Not Found**
```bash
# Solution: Install chrome
# Mac
brew install google-chrome

# Linux
apt-get install google-chrome-stable

# Or use Selenium's auto-download
npm run test  # Auto-downloads matching driver
```

#### 2. **Element Not Found**
```javascript
// Add explicit wait
await page.waitForElement(locator, timeout)

// Or increase timeout
// Edit jest.setup.js: global.testConfig.waitTimeout = 20000
```

#### 3. **Tests Timeout**
```bash
# Increase timeout
npm test -- --testTimeout=180000

# Or in jest.config.js:
// testTimeout: 180000
```

#### 4. **Port Already in Use**
```bash
# Kill process on port 8080
lsof -i :8080
kill -9 <PID>
```

#### 5. **Headless Mode Issues**
```bash
# Test in headed mode first
HEADLESS=false npm test

# Then debug in headless
HEADLESS=true npm run test:debug
```

### Debug Mode

```bash
# Run with verbose logging
npm run test:debug

# Keep browser open between tests
npm run test:watch

# Run single test with logging
npm test -- --testNamePattern="specific test" --verbose
```

### Getting Help

If tests fail:

1. **Check Allure Report** - Most detailed info
   ```bash
   npm run test:report
   ```

2. **View Screenshots** - In `selenium/screenshots/`

3. **Check Console Output** - Run with `npm run test:debug`

4. **Verify URL** - Make sure `TEST_BASE_URL` is correct

5. **Check Timing** - Increase wait timeouts if needed

---

## 🚀 Next Steps

### Add More Tests

Create new test files in `tests/`:

```bash
# tests/profile.spec.js - Profile page tests
# tests/tests-flow.spec.js - Test taking flow
# tests/results.spec.js - Results page tests
```

### Set Custom Allure Tags

```javascript
it('should login', async () => {
  // Add tags for better reporting
  // @critical @smoke @auth
})
```

### Enable Parallel Testing

In `jest.config.js`:
```javascript
maxWorkers: 4  // Run 4 tests in parallel
```

### Add Screenshot on Failure

Extend `BasePage`:
```javascript
afterEach(async () => {
  if (testResult.status === 'FAIL') {
    await page.takeScreenshot(`failure_${Date.now()}`)
  }
})
```

---

## 📚 Resources

- [Selenium WebDriver Docs](https://www.selenium.dev/documentation/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Allure Report](http://allure.qatools.ru/)
- [GitHub Actions Workflows](https://docs.github.com/en/actions)

---

## 📝 License

MIT

---

**Happy Testing! 🚀✨**

For questions or issues, create an issue on GitHub or contact the RankRise team.
