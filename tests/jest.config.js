// /Users/ctk/Programming/VSCodeProjects/carsontkempf.github.io/jest.config.js
module.exports = {
  testEnvironment: 'jsdom', // Changed to jsdom for frontend DOM testing
  testTimeout: 90000,    // Default timeout for each test file (can be overridden)
  verbose: true,           // More detailed output
  // Match test files in multiple directories ending with .test.js or .spec.js
  testMatch: [
    "**/Testing/**/*.test.js",
    "**/Testing/**/*.spec.js",
    "**/tests/**/*.test.js",
    "**/tests/**/*.spec.js"
  ],
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  bail: 1,
  // Transform ES modules
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  // Setup files
  setupFilesAfterEnv: [],
  // Module name mapping for easier imports
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/assets/js/$1",
  },
};
