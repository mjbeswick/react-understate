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

// Setup window.understate for testing
global.window = {
  understate: {
    configureDebug: jest.fn(),
    states: {},
  },
};

// Clear states between tests to prevent name conflicts
beforeEach(() => {
  if (global.window?.understate?.states) {
    global.window.understate.states = {};
  }
});
