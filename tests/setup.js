// Test setup file
// This file runs before each test suite

// Mock window.localStorage
global.localStorage = {
  store: {},
  getItem: function(key) {
    return this.store[key] || null;
  },
  setItem: function(key, value) {
    this.store[key] = value.toString();
  },
  removeItem: function(key) {
    delete this.store[key];
  },
  clear: function() {
    this.store = {};
  }
};

// Mock window.customElements if not available
if (!global.customElements) {
  global.customElements = {
    define: jest.fn(),
    get: jest.fn(),
    whenDefined: jest.fn(() => Promise.resolve()),
  };
}

// Mock moment.js - create a recursive mock that returns itself for chaining
const createMockMoment = (input) => {
  const mockMoment = {
    format: jest.fn((fmt) => {
      // Return different formats based on format string
      if (fmt === 'YYYY-MM-DDTHH:mm:ssZ') {
        return '2024-01-15T12:30:45+00:00';
      } else if (fmt === 'YYYY-MM-DD_HH:mm:ss') {
        return '2024-01-15_12:30:45';
      } else if (fmt === 'YYYY-MM-DD HH:mm:ss') {
        return '2024-01-15 12:30:45';
      }
      return '2024-01-15_12:30:45';
    }),
    subtract: jest.fn(function() { return this; }),
    add: jest.fn(function() { return this; }),
  };
  return mockMoment;
};

global.window.HXLocal_moment = jest.fn(createMockMoment);

// Mock saveAs from FileSaver.js
global.window.saveAs = jest.fn();

// Selectively mock console methods to reduce noise in tests
// Set environment variable DEBUG=true to see console output during test development
const shouldMockConsole = !process.env.DEBUG;

if (shouldMockConsole) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
  };
}
