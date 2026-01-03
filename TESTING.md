# Testing

This project includes a comprehensive test suite to ensure compatibility with Home Assistant 2025.12.4 and to verify the timeline color customization features.

## Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode (useful during development)
yarn test:watch

# Run tests with coverage report
yarn test:coverage
```

## Test Structure

- `tests/setup.js` - Test environment setup with mocks for browser APIs
- `tests/state-colors.test.js` - Tests for state color customization (Issue #48)
- `tests/ha-compatibility.test.js` - Tests for Home Assistant 2025.12.4 compatibility

## Test Coverage

The test suite covers:

### State Color Customization (Issue #48)
- Default state colors for common states
- Device class specific colors
- Domain specific colors  
- Multiple state colors
- Dark mode color overrides
- CSS variable resolution
- Color range parsing
- Color resolution priority

### Home Assistant 2025.12.4 Compatibility
- Custom element registration
- Card lifecycle methods (setConfig, getCardSize)
- Configuration validation
- Modern JavaScript features support
- Browser API compatibility
- Error handling
- Performance considerations

## Continuous Integration

Tests run automatically on every push and pull request via GitHub Actions. The CI workflow:

1. Runs all tests with Jest
2. Generates coverage reports
3. Builds the card
4. Verifies build output
5. Runs compatibility checks

## Writing New Tests

When adding new features, please add corresponding tests:

1. Create a new test file in `tests/` directory
2. Import the code you want to test
3. Write descriptive test cases
4. Run `yarn test` to verify

Example:
```javascript
import { myFunction } from '../src/my-module.js';

describe('My Feature', () => {
  test('should do something', () => {
    expect(myFunction('input')).toBe('expected output');
  });
});
```

## Test Requirements

Tests must:
- Pass on Node.js 18+
- Have clear, descriptive names
- Test one thing per test case
- Use proper assertions
- Clean up after themselves
