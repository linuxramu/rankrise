module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.spec.js'],
  collectCoverageFrom: ['tests/**/*.spec.js'],
  testTimeout: 120000,
  maxWorkers: 1,
  reporters: [
    'default',
    [
      'jest-allure2-adapter',
      {
        resultsDir: 'allure-results',
        config: {
          host: 'localhost',
          port: 4444,
        },
      },
    ],
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
