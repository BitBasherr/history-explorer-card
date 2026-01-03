# Fixes and Improvements

This document describes the fixes and improvements made to ensure compatibility with Home Assistant 2025.12.4 and to address Issue #48.

## Issue #48: Timeline Color Customization

### What was fixed
The ability to customize timeline colors for sensors was already implemented in the codebase through the `stateColors` configuration option. This PR adds comprehensive tests to verify this functionality works correctly.

### How to use it
You can customize timeline colors at multiple levels:

#### Entity-specific colors
```yaml
type: custom:history-explorer-card
stateColors:
  sensor.temperature.hot: 'red'
  sensor.temperature.cold: 'blue'
```

#### Device class colors
```yaml
type: custom:history-explorer-card
stateColors:
  motion.on: 'yellow'
  door.on: 'blue'
```

#### Domain colors
```yaml
type: custom:history-explorer-card
stateColors:
  binary_sensor.on: 'red'
  binary_sensor.off: 'green'
```

#### Global state colors
```yaml
type: custom:history-explorer-card
stateColors:
  on: 'red'
  off: 'green'
  unknown: '#888888'
```

### Color Resolution Priority
The card resolves colors in the following priority order (highest to lowest):
1. Entity-specific colors (e.g., `sensor.temperature.hot`)
2. Entity fallback colors (e.g., `sensor.temperature`)
3. Device class-specific colors (e.g., `motion.on`)
4. Device class fallback colors (e.g., `motion`)
5. Domain-specific colors (e.g., `binary_sensor.on`)
6. Domain fallback colors (e.g., `binary_sensor`)
7. Global state colors (e.g., `on`)
8. Default state colors (built-in)
9. Generated colors from MD5 hash

### Supported Color Formats
- Hex colors: `#ff0000` or `#f00`
- RGB: `rgb(255, 0, 0)`
- RGBA: `rgba(255, 0, 0, 0.5)`
- HSL: `hsl(0, 100%, 50%)`
- CSS variables: `--primary-color`
- Named colors: `red`, `blue`, `green`, etc.

### Color Ranges for Bar Graphs
Bar graphs can use color ranges based on values:
```yaml
entityOptions:
  energy:
    type: bar
    color:
      '0.0': blue    # Below 1.0 kWh
      '1.0': green   # 1.0 - 1.5 kWh
      '1.5': red     # 1.5 kWh and above
```

## Home Assistant 2025.12.4 Compatibility

### What was verified
1. **Card Lifecycle Methods**: The card properly implements `setConfig()` and `getCardSize()` methods required by Lovelace
2. **Custom Element Registration**: Works with the modern Custom Elements API
3. **Modern JavaScript**: Uses ES2020+ features (optional chaining, nullish coalescing)
4. **Browser APIs**: Compatible with localStorage, customElements, and other required browser APIs
5. **Error Handling**: Gracefully handles missing or malformed configuration
6. **Performance**: Efficiently handles large configurations and many entities

### Breaking Changes
There are no breaking changes. The card remains fully backward compatible with previous configurations.

### New Features
- Comprehensive test suite (36 tests)
- Automated CI/CD pipeline
- Test coverage reporting
- Build verification in CI

## Testing Infrastructure

### Test Framework
- **Jest**: Modern JavaScript testing framework
- **jsdom**: Browser environment simulation
- **@testing-library/dom**: DOM testing utilities

### Test Coverage
- 36 comprehensive tests
- State color customization tests
- Home Assistant compatibility tests
- Configuration validation tests
- Error handling tests

### Continuous Integration
GitHub Actions workflow runs on every push:
- ✓ Installs dependencies
- ✓ Runs all tests
- ✓ Generates coverage reports
- ✓ Builds the card
- ✓ Verifies build output
- ✓ Checks compatibility

## Build System

### Build Tools
- **Webpack 5**: Modern module bundler
- **Babel**: JavaScript transpilation (for tests)
- **Terser**: Code minification

### Build Output
- Single file: `history-explorer-card.js` (~325KB)
- Includes all dependencies
- Minified and optimized

### Build Commands
```bash
# Build the card
yarn build

# Run tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run tests in watch mode
yarn test:watch
```

## Migration Guide

### For Users
No changes needed! Your existing configuration will continue to work exactly as before.

### For Developers
If you're contributing to the project:
1. Install dependencies: `yarn install`
2. Make your changes
3. Add tests for new features
4. Run tests: `yarn test`
5. Build: `yarn build`
6. Submit PR

## Security

The code has been designed with security in mind:
- No external API calls without user configuration
- Safe handling of user input
- No execution of arbitrary code from configuration
- Proper sanitization of colors and values

## Performance

The card is optimized for performance:
- Efficient color resolution with caching
- Data decimation for large datasets
- Lazy loading where possible
- Minimal re-renders

## Future Improvements

Potential future enhancements:
- Additional chart types
- More customization options
- Enhanced accessibility
- Additional language support
- Performance optimizations

## Credits

- Original author: alexarch21
- Fork maintainer: SpangleLabs
- Current maintainer: BitBasherr
- Issue #48 reporter: (various community members)

## References

- [Issue #48](https://github.com/alexarch21/history-explorer-card/issues/48) - Timeline color customization
- [Home Assistant Lovelace Documentation](https://developers.home-assistant.io/docs/frontend/custom-ui/lovelace-custom-card)
- [Custom Elements API](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)
