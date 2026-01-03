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

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
