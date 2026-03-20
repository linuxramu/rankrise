module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.spec.js'],
  collectCoverageFrom: ['tests/**/*.spec.js'],
  testTimeout: 120000,
  maxWorkers: 1,
  reporters: [
    'default',
    [
      'jest-allure',
      {
        outputDir: 'allure-results',
        usePackageJsonName: true,
      },
    ],
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
