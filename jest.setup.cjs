// Jest setup file
const { TextEncoder, TextDecoder } = require('util');

// Add missing global polyfills for JSDOM
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock console methods if needed
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Ensure a window object exists
global.window = global.window || {};

// Setup window.reactUnderstate for testing and clear between tests
beforeEach(() => {
  global.window.reactUnderstate = {
    configureDebug: () => ({}),
    states: {},
    actions: {},
  };
});
