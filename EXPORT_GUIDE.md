# Export Functionality Guide

## Overview
The History Explorer Card now includes enhanced export functionality with custom date range selection. This allows users to export historical data for any time period, not just the currently displayed range.

## Features

### 1. CSV Export
Export entity history data as CSV files with customizable date ranges.

**Supported formats:**
- Time stamps in configurable format
- Entity states
- Optional attributes (when enabled)
- Custom separators (comma, semicolon, etc.)
- Number localization

### 2. Statistics Export
Export statistical data (mean, min, max values) as CSV files.

**Supported formats:**
- Time stamps
- State values
- Mean values
- Minimum values
- Maximum values
- Configurable time periods (hour, day, month)

### 3. Date Range Selection
When exporting, users can select a custom date and time range:
- **Start Date & Time**: The beginning of the export period
- **End Date & Time**: The end of the export period
- **Validation**: Ensures end time is after start time
- **Native Inputs**: Uses HTML5 datetime-local inputs for optimal mobile/desktop experience

## How to Use

### Exporting Data

1. Click on the menu button (three dots) in the card toolbar
2. Select "Export as CSV" or "Export statistics as CSV"
3. A dialog will appear asking you to select a date range
4. Choose your desired start and end dates/times
5. Click "Export" to download the file

### Date Range Dialog

The date range dialog provides:
- **Start Date & Time input**: Select when your export should begin
- **End Date & Time input**: Select when your export should end
- **Cancel button**: Close the dialog without exporting
- **Export button**: Confirm and download the export file

### Mobile Support

On mobile devices:
- The datetime-local inputs automatically display native date/time pickers
- On iOS: Native iOS date/time picker
- On Android: Native Android date/time picker
- Touch-friendly interface with appropriate sizing

### Desktop Support

On desktop browsers:
- Modern browsers provide a built-in date/time picker
- Keyboard navigation supported
- Consistent across Chrome, Firefox, Safari, and Edge

## Configuration

Export behavior can be configured in your card configuration:

```yaml
type: custom:history-explorer-card
csv:
  separator: ','              # CSV column separator (default: ',')
  timeFormat: 'YYYY-MM-DD HH:mm:ss'  # Time format (default: 'YYYY-MM-DD HH:mm:ss')
  exportAttributes: false     # Include entity attributes (default: false)
  numberLocale: 'en-US'       # Number formatting locale (default: undefined)
  statisticsPeriod: 'hour'    # Statistics aggregation period (default: 'hour')
```

## File Naming

Exported files are automatically named with a timestamp:
- Format: `entities-YYYY-MM-DD_HH:mm:ss.csv`
- Example: `entities-2024-01-15_14:30:45.csv`

## Browser Compatibility

The export functionality works across all modern browsers:
- ✅ Chrome/Chromium (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile)
- ✅ Edge (Desktop)
- ✅ Opera (Desktop & Mobile)

## Technical Details

### Dependencies
- **moment.js**: Date/time manipulation and formatting
- **FileSaver.js**: Cross-browser file saving functionality

### Date/Time Format
- Internal storage: ISO 8601 format (`YYYY-MM-DDTHH:mm:ss`)
- Input format: HTML5 datetime-local (`YYYY-MM-DDTHH:mm`)
- Export format: Configurable via `csv.timeFormat`

### Data Sources
- **CSV Export**: Uses Home Assistant's `history/history_during_period` API
- **Statistics Export**: Uses Home Assistant's `recorder/statistics_during_period` API (HA 2022.11+) or `history/statistics_during_period` (older versions)

## Troubleshooting

### Export button doesn't work
- Check browser console for errors
- Ensure Home Assistant connection is active
- Verify entities exist in the selected time range

### Date picker not showing
- Some older browsers may not support datetime-local inputs
- Try updating to the latest browser version
- On desktop, you can manually type the date/time

### Export file is empty
- Verify the selected date range contains data
- Check that entities are recorded by Home Assistant
- Ensure the time range is not too large (may take time to load)

### Error: "moment is not defined"
- This should be fixed in the latest version
- Ensure you have the latest card version installed
- Try clearing browser cache

## Examples

### Exporting Last Week's Data
1. Click export button
2. Set start date: 7 days ago at 00:00
3. Set end date: Today at 23:59
4. Click Export

### Exporting Specific Date Range
1. Click export button
2. Set start date: 2024-01-01 08:00
3. Set end date: 2024-01-31 17:00
4. Click Export

### Exporting Statistics for a Month
1. Click export statistics button
2. Set start date: First day of month at 00:00
3. Set end date: Last day of month at 23:59
4. Configure `statisticsPeriod: 'day'` for daily aggregation
5. Click Export
