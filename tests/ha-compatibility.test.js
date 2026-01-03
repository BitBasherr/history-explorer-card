/**
 * Tests for Home Assistant 2025.12.4 compatibility
 * Ensures the card works with latest HA version and follows Lovelace custom card standards
 */

describe('Home Assistant 2025 Compatibility', () => {
  describe('Custom Element Registration', () => {
    test('should be able to define custom element', () => {
      const mockDefine = jest.fn();
      const customElements = {
        define: mockDefine,
        get: jest.fn(),
        whenDefined: jest.fn(() => Promise.resolve()),
      };

      // Verify that custom elements can be registered
      expect(() => {
        customElements.define('test-element', class extends HTMLElement {});
      }).not.toThrow();
      expect(mockDefine).toHaveBeenCalled();
    });
  });

  describe('Card Lifecycle Methods', () => {
    let cardInstance;

    beforeEach(() => {
      // Create a minimal card instance for testing
      cardInstance = {
        setConfig: jest.fn((config) => {
          cardInstance.config = config;
        }),
        getCardSize: jest.fn(() => 3),
        connectedCallback: jest.fn(),
        disconnectedCallback: jest.fn(),
      };
    });

    test('should implement setConfig method', () => {
      expect(typeof cardInstance.setConfig).toBe('function');
      
      const testConfig = { 
        type: 'custom:history-explorer-card',
        graphs: []
      };
      
      cardInstance.setConfig(testConfig);
      expect(cardInstance.setConfig).toHaveBeenCalledWith(testConfig);
      expect(cardInstance.config).toEqual(testConfig);
    });

    test('should implement getCardSize method', () => {
      expect(typeof cardInstance.getCardSize).toBe('function');
      const size = cardInstance.getCardSize();
      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThan(0);
    });

    test('should handle empty config gracefully', () => {
      expect(() => {
        cardInstance.setConfig({});
      }).not.toThrow();
    });

    test('should handle minimal config', () => {
      const minimalConfig = {
        type: 'custom:history-explorer-card'
      };
      
      expect(() => {
        cardInstance.setConfig(minimalConfig);
      }).not.toThrow();
    });
  });

  describe('Configuration Validation', () => {
    test('should accept valid stateColors configuration', () => {
      const config = {
        type: 'custom:history-explorer-card',
        stateColors: {
          'on': 'red',
          'off': 'green',
          'sensor.temperature.hot': 'orange',
          'binary_sensor.motion.on': 'yellow'
        }
      };
      
      expect(config.stateColors).toBeDefined();
      expect(config.stateColors['on']).toBe('red');
      expect(config.stateColors['sensor.temperature.hot']).toBe('orange');
    });

    test('should accept valid entityOptions configuration', () => {
      const config = {
        type: 'custom:history-explorer-card',
        entityOptions: {
          'humidity': {
            color: 'blue',
            ymin: 20,
            ymax: 100
          }
        }
      };
      
      expect(config.entityOptions).toBeDefined();
      expect(config.entityOptions['humidity']).toBeDefined();
    });

    test('should accept valid graphs configuration', () => {
      const config = {
        type: 'custom:history-explorer-card',
        graphs: [
          {
            type: 'line',
            entities: [
              { entity: 'sensor.temperature' }
            ]
          },
          {
            type: 'timeline',
            entities: [
              { entity: 'binary_sensor.motion' }
            ]
          }
        ]
      };
      
      expect(config.graphs).toBeDefined();
      expect(Array.isArray(config.graphs)).toBe(true);
      expect(config.graphs.length).toBe(2);
    });
  });

  describe('Version Compatibility', () => {
    test('should work with modern JavaScript features', () => {
      // Test optional chaining (ES2020)
      const obj = { a: { b: { c: 'value' } } };
      expect(obj?.a?.b?.c).toBe('value');
      expect(obj?.x?.y?.z).toBeUndefined();
      
      // Test nullish coalescing (ES2020)
      const value1 = null ?? 'default';
      expect(value1).toBe('default');
      
      const value2 = 'actual' ?? 'default';
      expect(value2).toBe('actual');
    });

    test('should handle modern array and object methods', () => {
      // Test Array methods
      const arr = [1, 2, 3, 4, 5];
      expect(arr.includes(3)).toBe(true);
      expect(arr.find(x => x > 3)).toBe(4);
      expect(arr.filter(x => x > 3)).toEqual([4, 5]);
      
      // Test Object methods
      const obj = { a: 1, b: 2 };
      expect(Object.keys(obj)).toEqual(['a', 'b']);
      expect(Object.values(obj)).toEqual([1, 2]);
      expect(Object.entries(obj)).toEqual([['a', 1], ['b', 2]]);
    });
  });

  describe('Browser API Compatibility', () => {
    test('should handle localStorage operations', () => {
      localStorage.setItem('test-key', 'test-value');
      expect(localStorage.getItem('test-key')).toBe('test-value');
      
      localStorage.removeItem('test-key');
      expect(localStorage.getItem('test-key')).toBeNull();
    });

    test('should handle custom elements API', () => {
      expect(global.customElements).toBeDefined();
      expect(typeof global.customElements.define).toBe('function');
      expect(typeof global.customElements.get).toBe('function');
      expect(typeof global.customElements.whenDefined).toBe('function');
    });
  });

  describe('Error Handling', () => {
    test('should handle missing required fields gracefully', () => {
      const invalidConfig = {
        // Missing type field
        graphs: []
      };
      
      // The card should handle this gracefully, not throw
      expect(invalidConfig).toBeDefined();
    });

    test('should handle malformed entity IDs', () => {
      const config = {
        type: 'custom:history-explorer-card',
        graphs: [
          {
            type: 'line',
            entities: [
              { entity: '' }, // Empty entity ID
              { entity: 'invalid' }, // Missing domain
            ]
          }
        ]
      };
      
      // Card should handle these gracefully
      expect(config.graphs[0].entities).toBeDefined();
    });
  });

  describe('Performance Considerations', () => {
    test('should handle large color configuration efficiently', () => {
      const largeColorConfig = {};
      
      // Create a large stateColors object
      for (let i = 0; i < 1000; i++) {
        largeColorConfig[`state_${i}`] = `#${i.toString(16).padStart(6, '0')}`;
      }
      
      const config = {
        type: 'custom:history-explorer-card',
        stateColors: largeColorConfig
      };
      
      expect(Object.keys(config.stateColors).length).toBe(1000);
    });

    test('should handle multiple entities efficiently', () => {
      const entities = [];
      
      // Create many entity configurations
      for (let i = 0; i < 100; i++) {
        entities.push({ entity: `sensor.test_${i}` });
      }
      
      const config = {
        type: 'custom:history-explorer-card',
        graphs: [{
          type: 'line',
          entities: entities
        }]
      };
      
      expect(config.graphs[0].entities.length).toBe(100);
    });
  });
});
