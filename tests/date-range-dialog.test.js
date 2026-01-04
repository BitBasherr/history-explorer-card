/**
 * Tests for date range selection dialog
 * Tests the export date range picker UI functionality
 */

// Setup mocks for moment's isBefore method
beforeAll(() => {
  // Extend the mock moment to support isBefore
  const originalMoment = global.window.HXLocal_moment;
  global.window.HXLocal_moment = jest.fn((input) => {
    const mockMoment = originalMoment(input);
    // Store the input for comparison
    mockMoment._input = input;
    mockMoment.isBefore = jest.fn((other) => {
      // Parse dates properly for comparison
      const thisDate = new Date(mockMoment._input);
      const otherDate = other._input ? new Date(other._input) : new Date(other);
      return thisDate < otherDate;
    });
    return mockMoment;
  });
});

import { HistoryCardState } from '../src/history-explorer-card.js';

describe('Date Range Selection Dialog', () => {
  let cardState;
  let mockHass;
  
  beforeEach(() => {
    // Create a mock HTML element to act as the card container
    document.body.innerHTML = '<div id="test-container"></div>';
    
    cardState = new HistoryCardState();
    mockHass = {
      states: {
        'sensor.test': {
          attributes: {
            unit_of_measurement: '°C'
          }
        }
      },
      callWS: jest.fn(() => Promise.resolve({}))
    };
    
    cardState._hass = mockHass;
    cardState._this = document.getElementById('test-container');
    cardState.startTime = '2024-01-15T00:00:00';
    cardState.endTime = '2024-01-15T23:59:59';
    cardState.pconfig = {
      exportSeparator: ',',
      exportTimeFormat: 'YYYY-MM-DD HH:mm:ss'
    };
    cardState.graphs = [{
      entities: [{ entity: 'sensor.test' }]
    }];
    cardState.ui = {
      spinOverlay: document.createElement('div')
    };
    
    // Mock menuSetVisibility
    cardState.menuSetVisibility = jest.fn();
    
    // Mock alert
    global.alert = jest.fn();
  });
  
  afterEach(() => {
    // Clean up any remaining dialogs
    const dialog = document.getElementById('export-date-range-dialog');
    if (dialog) {
      document.body.removeChild(dialog);
    }
    document.body.innerHTML = '';
  });
  
  describe('showDateRangeDialog', () => {
    test('should create and display dialog', () => {
      const callback = jest.fn();
      
      cardState.showDateRangeDialog(callback);
      
      const dialog = document.getElementById('export-date-range-dialog');
      expect(dialog).not.toBeNull();
      expect(dialog.style.display).toBe('flex');
    });
    
    test('should populate dialog with current start and end times', () => {
      const callback = jest.fn();
      
      cardState.showDateRangeDialog(callback);
      
      const startInput = document.getElementById('export-start-time');
      const endInput = document.getElementById('export-end-time');
      
      expect(startInput).not.toBeNull();
      expect(endInput).not.toBeNull();
      expect(startInput.value).toBeTruthy();
      expect(endInput.value).toBeTruthy();
    });
    
    test('should close dialog on cancel', () => {
      const callback = jest.fn();
      
      cardState.showDateRangeDialog(callback);
      
      const cancelBtn = document.getElementById('export-cancel-btn');
      cancelBtn.click();
      
      const dialog = document.getElementById('export-date-range-dialog');
      expect(dialog).toBeNull();
      expect(callback).not.toHaveBeenCalled();
    });
    
    test('should validate empty inputs', () => {
      const callback = jest.fn();
      
      cardState.showDateRangeDialog(callback);
      
      const startInput = document.getElementById('export-start-time');
      const endInput = document.getElementById('export-end-time');
      const confirmBtn = document.getElementById('export-confirm-btn');
      
      startInput.value = '';
      endInput.value = '';
      
      confirmBtn.click();
      
      expect(global.alert).toHaveBeenCalledWith('Please select both start and end date/time');
      expect(callback).not.toHaveBeenCalled();
    });
    
    test('should validate end time is after start time', () => {
      const callback = jest.fn();
      
      cardState.showDateRangeDialog(callback);
      
      const startInput = document.getElementById('export-start-time');
      const endInput = document.getElementById('export-end-time');
      const confirmBtn = document.getElementById('export-confirm-btn');
      
      startInput.value = '2024-01-15T23:00';
      endInput.value = '2024-01-15T12:00';
      
      confirmBtn.click();
      
      expect(global.alert).toHaveBeenCalledWith('End date/time must be after start date/time');
      expect(callback).not.toHaveBeenCalled();
    });
    
    test('should call callback with custom date range on confirm', () => {
      const callback = jest.fn();
      
      cardState.showDateRangeDialog(callback);
      
      const startInput = document.getElementById('export-start-time');
      const endInput = document.getElementById('export-end-time');
      const confirmBtn = document.getElementById('export-confirm-btn');
      
      startInput.value = '2024-01-15T08:00';
      endInput.value = '2024-01-15T18:00';
      
      confirmBtn.click();
      
      expect(callback).toHaveBeenCalled();
      const exportState = callback.mock.calls[0][0];
      expect(exportState.startTime).toBeTruthy();
      expect(exportState.endTime).toBeTruthy();
    });
    
    test('should remove dialog after confirm', () => {
      const callback = jest.fn();
      
      cardState.showDateRangeDialog(callback);
      
      const startInput = document.getElementById('export-start-time');
      const endInput = document.getElementById('export-end-time');
      const confirmBtn = document.getElementById('export-confirm-btn');
      
      startInput.value = '2024-01-15T08:00';
      endInput.value = '2024-01-15T18:00';
      
      confirmBtn.click();
      
      const dialog = document.getElementById('export-date-range-dialog');
      expect(dialog).toBeNull();
    });
  });
  
  describe('exportFile with date range', () => {
    test('should show date range dialog when export is called', () => {
      cardState.csvExporter = {
        exportFile: jest.fn()
      };
      
      cardState.exportFile();
      
      const dialog = document.getElementById('export-date-range-dialog');
      expect(dialog).not.toBeNull();
    });
    
    test('should pass custom date range to csv exporter', (done) => {
      cardState.csvExporter = {
        exportFile: jest.fn()
      };
      
      cardState.exportFile();
      
      setTimeout(() => {
        const startInput = document.getElementById('export-start-time');
        const endInput = document.getElementById('export-end-time');
        const confirmBtn = document.getElementById('export-confirm-btn');
        
        if (startInput && endInput && confirmBtn) {
          startInput.value = '2024-01-15T08:00';
          endInput.value = '2024-01-15T18:00';
          
          confirmBtn.click();
          
          expect(cardState.csvExporter.exportFile).toHaveBeenCalled();
          done();
        } else {
          done(new Error('Dialog elements not found'));
        }
      }, 50);
    });
  });
  
  describe('exportStatistics with date range', () => {
    test('should show date range dialog when export statistics is called', () => {
      cardState.statsExporter = {
        exportFile: jest.fn()
      };
      
      cardState.exportStatistics();
      
      const dialog = document.getElementById('export-date-range-dialog');
      expect(dialog).not.toBeNull();
    });
    
    test('should pass custom date range to statistics exporter', (done) => {
      cardState.statsExporter = {
        exportFile: jest.fn()
      };
      
      cardState.exportStatistics();
      
      setTimeout(() => {
        const startInput = document.getElementById('export-start-time');
        const endInput = document.getElementById('export-end-time');
        const confirmBtn = document.getElementById('export-confirm-btn');
        
        if (startInput && endInput && confirmBtn) {
          startInput.value = '2024-01-15T08:00';
          endInput.value = '2024-01-15T18:00';
          
          confirmBtn.click();
          
          expect(cardState.statsExporter.exportFile).toHaveBeenCalled();
          done();
        } else {
          done(new Error('Dialog elements not found'));
        }
      }, 50);
    });
  });
  
  describe('Mobile and Desktop Compatibility', () => {
    test('datetime-local input should be supported', () => {
      const callback = jest.fn();
      
      cardState.showDateRangeDialog(callback);
      
      const startInput = document.getElementById('export-start-time');
      const endInput = document.getElementById('export-end-time');
      
      // HTML5 datetime-local inputs should be created
      expect(startInput.type).toBe('datetime-local');
      expect(endInput.type).toBe('datetime-local');
    });
    
    test('dialog should be responsive', () => {
      const callback = jest.fn();
      
      cardState.showDateRangeDialog(callback);
      
      const dialog = document.getElementById('export-date-range-dialog');
      const dialogContent = dialog.querySelector('div');
      
      // Check that dialog uses percentage width for responsiveness
      expect(dialogContent.style.width).toContain('%');
    });
  });
});
