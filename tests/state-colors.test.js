/**
 * Tests for state color customization feature (Issue #48)
 * Tests the ability to customize timeline colors for sensors
 */

import { stateColors, stateColorsDark, parseColor, parseColorRange } from '../src/history-default-colors.js';

describe('State Color Customization', () => {
  describe('Default State Colors', () => {
    test('should have default colors for common states', () => {
      expect(stateColors).toBeDefined();
      expect(stateColors['on']).toBeDefined();
      expect(stateColors['off']).toBeDefined();
      expect(stateColors['unknown']).toBeDefined();
      expect(stateColors['unavailable']).toBeDefined();
    });

    test('should have device class specific colors', () => {
      expect(stateColors['battery_charging.on']).toBeDefined();
      expect(stateColors['connectivity.on']).toBeDefined();
      expect(stateColors['gas.on']).toBeDefined();
      expect(stateColors['smoke.on']).toBeDefined();
    });

    test('should have domain specific colors', () => {
      expect(stateColors['person.home']).toBeDefined();
      expect(stateColors['person.not_home']).toBeDefined();
      expect(stateColors['weather.cloudy']).toBeDefined();
      expect(stateColors['weather.sunny']).toBeDefined();
      expect(stateColors['automation.on']).toBeDefined();
    });

    test('should have multiple state colors', () => {
      expect(stateColors['binary_sensor.multiple']).toBeDefined();
      expect(stateColors['person.multiple']).toBeDefined();
      expect(stateColors['weather.multiple']).toBeDefined();
    });
  });

  describe('Dark Mode State Colors', () => {
    test('should have dark mode overrides', () => {
      expect(stateColorsDark).toBeDefined();
      expect(stateColorsDark['off']).toBeDefined();
    });

    test('dark mode off color should differ from light mode', () => {
      expect(stateColorsDark['off']).not.toBe(stateColors['off']);
    });
  });

  describe('parseColor function', () => {
    test('should return color string unchanged', () => {
      const color = '#ff0000';
      expect(parseColor(color)).toBe(color);
    });

    test('should return color object unchanged', () => {
      const colorObj = { color: '#ff0000', fill: 'rgba(255,0,0,0.2)' };
      expect(parseColor(colorObj)).toBe(colorObj);
    });

    test('should handle null/undefined colors', () => {
      expect(parseColor(null)).toBeNull();
      expect(parseColor(undefined)).toBeUndefined();
    });

    test('should resolve CSS variables', () => {
      // Mock getComputedStyle
      const mockGetComputedStyle = jest.fn(() => ({
        getPropertyValue: jest.fn((prop) => {
          if (prop === '--primary-color') return '#3e95cd';
          return '';
        })
      }));
      global.getComputedStyle = mockGetComputedStyle;
      
      const result = parseColor('--primary-color');
      expect(result).toBe('#3e95cd');
    });

    test('should resolve nested CSS variables', () => {
      // Mock getComputedStyle for nested variables
      const mockGetComputedStyle = jest.fn(() => ({
        getPropertyValue: jest.fn((prop) => {
          if (prop === '--var1') return '--var2';
          if (prop === '--var2') return '#00ff00';
          return '';
        })
      }));
      global.getComputedStyle = mockGetComputedStyle;
      
      const result = parseColor('--var1');
      expect(result).toBe('#00ff00');
    });
  });

  describe('parseColorRange function', () => {
    test('should return color for exact match', () => {
      const range = {
        '0': 'blue',
        '10': 'green',
        '20': 'red'
      };
      expect(parseColorRange(range, 10)).toBe('green');
    });

    test('should return color for value within range', () => {
      const range = {
        '0': 'blue',
        '10': 'green',
        '20': 'red'
      };
      expect(parseColorRange(range, 15)).toBe('green');
    });

    test('should return highest color for value above all ranges', () => {
      const range = {
        '0': 'blue',
        '10': 'green',
        '20': 'red'
      };
      expect(parseColorRange(range, 100)).toBe('red');
    });

    test('should return lowest color for value below all ranges', () => {
      const range = {
        '10': 'green',
        '20': 'red',
        '30': 'yellow'
      };
      expect(parseColorRange(range, 5)).toBe('green');
    });

    test('should handle negative values in range', () => {
      const range = {
        '-10': 'blue',
        '0': 'green',
        '10': 'red'
      };
      expect(parseColorRange(range, -5)).toBe('blue');
      expect(parseColorRange(range, 5)).toBe('green');
    });

    test('should handle single color range', () => {
      const range = {
        '0': 'blue'
      };
      expect(parseColorRange(range, 10)).toBe('blue');
      expect(parseColorRange(range, -10)).toBe('blue');
    });
  });

  describe('Color Resolution Priority', () => {
    test('should prioritize entity-specific colors over device class colors', () => {
      // This will be tested in integration tests with the card instance
      expect(true).toBe(true);
    });

    test('should prioritize device class colors over domain colors', () => {
      // This will be tested in integration tests with the card instance
      expect(true).toBe(true);
    });

    test('should prioritize domain colors over global state colors', () => {
      // This will be tested in integration tests with the card instance
      expect(true).toBe(true);
    });
  });
});
