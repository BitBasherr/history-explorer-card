/**
 * Tests for export functionality
 * Tests CSV export and Statistics export features
 */

import { HistoryCSVExporter, StatisticsCSVExporter } from '../src/history-csv-exporter.js';

describe('Export Functionality', () => {
  describe('HistoryCSVExporter', () => {
    let exporter;
    let mockCardState;
    
    beforeEach(() => {
      exporter = new HistoryCSVExporter();
      
      // Mock Blob for each test
      global.Blob = jest.fn((content, options) => ({
        content,
        options,
        type: options.type
      }));
      
      // Mock card state
      mockCardState = {
        pconfig: {
          exportSeparator: ',',
          exportTimeFormat: 'YYYY-MM-DD HH:mm:ss',
          exportAttributes: false,
          exportNumberLocale: 'en-US'
        },
        _hass: {
          states: {
            'sensor.temperature': {
              attributes: {
                unit_of_measurement: '°C',
                friendly_name: 'Temperature'
              }
            }
          },
          callWS: jest.fn()
        },
        startTime: '2024-01-15T00:00:00',
        endTime: '2024-01-15T23:59:59',
        graphs: [{
          entities: [
            { entity: 'sensor.temperature' }
          ]
        }],
        ui: {
          spinOverlay: document.createElement('div')
        }
      };
      
      // Reset mocks
      global.window.saveAs.mockClear();
      global.Blob.mockClear();
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();
    });
    
    test('should be instantiated correctly', () => {
      expect(exporter).toBeDefined();
      expect(exporter.overlay).toBeNull();
      expect(exporter.separator).toBeUndefined();
      expect(exporter.timeFormat).toBeUndefined();
    });
    
    test('should initialize export parameters from card state', () => {
      const mockPromise = Promise.resolve({});
      mockCardState._hass.callWS.mockReturnValue(mockPromise);
      
      exporter.exportFile(mockCardState);
      
      expect(exporter.separator).toBe(',');
      expect(exporter.timeFormat).toBe('YYYY-MM-DD HH:mm:ss');
      expect(exporter.saveAttributes).toBe(false);
      expect(exporter.numberLocale).toBe('en-US');
    });
    
    test('should call Home Assistant WebSocket API with correct parameters', () => {
      const mockPromise = Promise.resolve({});
      mockCardState._hass.callWS.mockReturnValue(mockPromise);
      
      exporter.exportFile(mockCardState);
      
      expect(mockCardState._hass.callWS).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'history/history_during_period',
          entity_ids: ['sensor.temperature'],
          minimal_response: true,
          no_attributes: true
        })
      );
    });
    
    test('should show spinner overlay during export', () => {
      const mockPromise = Promise.resolve({});
      mockCardState._hass.callWS.mockReturnValue(mockPromise);
      
      exporter.exportFile(mockCardState);
      
      expect(document.body.appendChild).toHaveBeenCalledWith(mockCardState.ui.spinOverlay);
    });
    
    test('should format CSV data correctly', () => {
      const mockResult = {
        'sensor.temperature': [
          { lu: 1705305600, s: '22.5' },
          { lu: 1705309200, s: '23.0' }
        ]
      };
      
      exporter.separator = ',';
      exporter.timeFormat = 'YYYY-MM-DD HH:mm:ss';
      exporter.saveAttributes = false;
      exporter._hass = mockCardState._hass;
      exporter.overlay = mockCardState.ui.spinOverlay;
      
      exporter.exportCallback(mockResult);
      
      expect(global.Blob).toHaveBeenCalled();
      const blobCall = global.Blob.mock.calls[0];
      const csvContent = blobCall[0].join('');
      expect(csvContent).toContain('Time stamp,State');
      expect(csvContent).toContain('sensor.temperature');
      expect(blobCall[1]).toEqual({ type: 'text/plain;charset=utf-8' });
    });
    
    test('should use saveAs to download file', () => {
      const mockResult = {
        'sensor.temperature': [
          { lu: 1705305600, s: '22.5' }
        ]
      };
      
      exporter.separator = ',';
      exporter.timeFormat = 'YYYY-MM-DD HH:mm:ss';
      exporter.saveAttributes = false;
      exporter._hass = mockCardState._hass;
      exporter.overlay = mockCardState.ui.spinOverlay;
      
      exporter.exportCallback(mockResult);
      
      expect(global.window.saveAs).toHaveBeenCalled();
      const saveAsCall = global.window.saveAs.mock.calls[0];
      expect(saveAsCall[1]).toMatch(/^entities-.*\.csv$/);
    });
    
    test('should handle export failure gracefully', () => {
      const mockError = new Error('Export failed');
      exporter.overlay = mockCardState.ui.spinOverlay;
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      exporter.exportFailed(mockError);
      
      expect(document.body.removeChild).toHaveBeenCalledWith(mockCardState.ui.spinOverlay);
      expect(consoleSpy).toHaveBeenCalledWith(mockError);
      
      consoleSpy.mockRestore();
    });
    
    test('should support custom separators', () => {
      const mockResult = {
        'sensor.temperature': [
          { lu: 1705305600, s: '22.5' }
        ]
      };
      
      exporter.separator = ';';
      exporter.timeFormat = 'YYYY-MM-DD HH:mm:ss';
      exporter.saveAttributes = false;
      exporter._hass = mockCardState._hass;
      exporter.overlay = mockCardState.ui.spinOverlay;
      
      exporter.exportCallback(mockResult);
      
      const blobCall = global.Blob.mock.calls[0];
      const csvContent = blobCall[0].join('');
      expect(csvContent).toContain('Time stamp;State');
    });
    
    test('should escape values containing separator', () => {
      const mockResult = {
        'sensor.test': [
          { lu: 1705305600, s: 'value,with,commas' }
        ]
      };
      
      exporter.separator = ',';
      exporter.timeFormat = 'YYYY-MM-DD HH:mm:ss';
      exporter.saveAttributes = false;
      exporter._hass = mockCardState._hass;
      exporter.overlay = mockCardState.ui.spinOverlay;
      
      exporter.exportCallback(mockResult);
      
      const blobCall = global.Blob.mock.calls[0];
      expect(blobCall[0].join('')).toContain('"value,with,commas"');
    });
    
    test('should not export when no entities are present', () => {
      mockCardState.graphs = [];
      const mockPromise = Promise.resolve({});
      mockCardState._hass.callWS.mockReturnValue(mockPromise);
      
      exporter.exportFile(mockCardState);
      
      expect(mockCardState._hass.callWS).not.toHaveBeenCalled();
      expect(document.body.appendChild).not.toHaveBeenCalled();
    });
  });
  
  describe('StatisticsCSVExporter', () => {
    let exporter;
    let mockCardState;
    
    beforeEach(() => {
      exporter = new StatisticsCSVExporter();
      
      mockCardState = {
        pconfig: {
          exportSeparator: ',',
          exportTimeFormat: 'YYYY-MM-DD HH:mm:ss',
          exportStatsPeriod: 'hour',
          exportNumberLocale: 'en-US'
        },
        _hass: {
          callWS: jest.fn()
        },
        startTime: '2024-01-15T00:00:00',
        endTime: '2024-01-15T23:59:59',
        version: [2023, 1, 0],
        graphs: [{
          entities: [
            { entity: 'sensor.temperature' }
          ]
        }],
        ui: {
          spinOverlay: document.createElement('div')
        }
      };
      
      global.window.saveAs.mockClear();
      global.Blob.mockClear();
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();
    });
    
    test('should be instantiated correctly', () => {
      expect(exporter).toBeDefined();
      expect(exporter.overlay).toBeNull();
      expect(exporter.separator).toBeUndefined();
      expect(exporter.timeFormat).toBeUndefined();
    });
    
    test('should initialize export parameters from card state', () => {
      const mockPromise = Promise.resolve({});
      mockCardState._hass.callWS.mockReturnValue(mockPromise);
      
      exporter.exportFile(mockCardState);
      
      expect(exporter.separator).toBe(',');
      expect(exporter.timeFormat).toBe('YYYY-MM-DD HH:mm:ss');
      expect(exporter.numberLocale).toBe('en-US');
    });
    
    test('should call correct recorder API based on HA version', () => {
      const mockPromise = Promise.resolve({});
      mockCardState._hass.callWS.mockReturnValue(mockPromise);
      
      // Test with version >= 2022.11
      mockCardState.version = [2023, 1, 0];
      exporter.exportFile(mockCardState);
      
      expect(mockCardState._hass.callWS).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'recorder/statistics_during_period'
        })
      );
      
      // Test with version < 2022.11
      mockCardState._hass.callWS.mockClear();
      mockCardState.version = [2022, 10, 0];
      exporter.exportFile(mockCardState);
      
      expect(mockCardState._hass.callWS).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'history/statistics_during_period'
        })
      );
    });
    
    test('should format statistics CSV with all columns', () => {
      const mockResult = {
        'sensor.temperature': [
          {
            start: '2024-01-15T00:00:00Z',
            state: '22.5',
            mean: '22.3',
            min: '21.0',
            max: '24.0'
          }
        ]
      };
      
      exporter.separator = ',';
      exporter.timeFormat = 'YYYY-MM-DD HH:mm:ss';
      exporter.overlay = mockCardState.ui.spinOverlay;
      
      exporter.exportCallback(mockResult);
      
      expect(global.Blob).toHaveBeenCalled();
      const blobCall = global.Blob.mock.calls[0];
      const csvContent = blobCall[0].join('');
      expect(csvContent).toContain('Time stamp,State,Mean,Min,Max');
      expect(csvContent).toContain('sensor.temperature');
    });
    
    test('should handle missing statistic values', () => {
      const mockResult = {
        'sensor.temperature': [
          {
            start: '2024-01-15T00:00:00Z',
            state: '22.5'
            // mean, min, max missing
          }
        ]
      };
      
      exporter.separator = ',';
      exporter.timeFormat = 'YYYY-MM-DD HH:mm:ss';
      exporter.overlay = mockCardState.ui.spinOverlay;
      
      exporter.exportCallback(mockResult);
      
      expect(global.Blob).toHaveBeenCalled();
      // Should not throw error
    });
    
    test('should use correct statistic period', () => {
      const mockPromise = Promise.resolve({});
      mockCardState._hass.callWS.mockReturnValue(mockPromise);
      mockCardState.pconfig.exportStatsPeriod = 'day';
      
      exporter.exportFile(mockCardState);
      
      expect(mockCardState._hass.callWS).toHaveBeenCalledWith(
        expect.objectContaining({
          period: 'day'
        })
      );
    });
  });
  
  describe('Cross-browser and Mobile Compatibility', () => {
    test('moment should be available from window.HXLocal_moment', () => {
      expect(global.window.HXLocal_moment).toBeDefined();
      expect(typeof global.window.HXLocal_moment).toBe('function');
    });
    
    test('saveAs should be available from window.saveAs', () => {
      expect(global.window.saveAs).toBeDefined();
      expect(typeof global.window.saveAs).toBe('function');
    });
  });
});
