// /Users/ctk/Programming/VSCodeProjects/carsontkempf.github.io/jest.config.js
module.exports = {
  testEnvironment: 'node', // Since we are controlling servers and Puppeteer from Node
  testTimeout: 90000,    // Default timeout for each test file (can be overridden)
  verbose: true,           // More detailed output
  // Match test files in the Testing directory ending with .test.js or .spec.js
  testMatch: [
    "**/Testing/**/*.test.js",
    "**/Testing/**/*.spec.js"
  ],
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  bail: 1,
};
