export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.spec.js'],
  collectCoverageFrom: ['tests/**/*.spec.js'],
  testTimeout: 120000,
  maxWorkers: 1,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {},
  transformIgnorePatterns: ['node_modules/'],
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
