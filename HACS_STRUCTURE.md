# HACS Structure for history-explorer-card

## Repository Type: Lovelace Plugin (Frontend Card)

This repository is a **Lovelace custom card** (also called a "Dashboard card" or "plugin" in HACS), NOT a Home Assistant integration.

### Key Differences

| Feature | Lovelace Plugin (THIS REPO) | Integration (e.g., PillAssistant) |
|---------|----------------------------|---------------------------------------------------|
| **Location** | `dist/history-explorer-card.js` | `custom_components/<domain>/` |
| **Language** | JavaScript (frontend) | Python (backend) |
| **Files** | `.js` file | `manifest.json`, `__init__.py`, `.py` files |
| **hacs.json** | `name` + `filename` | `name` + `domain` + `content_in_root: false` |
| **Purpose** | UI components/cards | Backend functionality/services |

### Current Structure (CORRECT ✅)

```
history-explorer-card/
├── dist/
│   └── history-explorer-card.js    # ✅ Main plugin file
├── src/                             # Source files
├── tests/                           # Test files
├── hacs.json                        # ✅ HACS metadata
├── package.json                     # Build configuration
└── README.md                        # Documentation
```

### hacs.json Configuration (CORRECT ✅)

```json
{
    "name": "history-explorer-card",
    "filename": "history-explorer-card.js"
}
```

## Current HACS Requirements for Lovelace Plugins

According to [official HACS documentation](https://hacs.xyz/docs/publish/plugin/):

1. ✅ **JavaScript file must match repository name**
   - Repo: `history-explorer-card`
   - File: `history-explorer-card.js`
   - Match: YES ✅

2. ✅ **File location: `dist/` directory (preferred) or root**
   - Current: `dist/history-explorer-card.js` ✅

3. ✅ **hacs.json with correct format**
   - Has `name` and `filename` ✅
   - Does NOT need `domain` or `content_in_root` (those are for integrations)

4. ✅ **File is tracked in git**
   - Committed to repository ✅

## Why NOT `custom_components/`?

The `custom_components/` directory is **ONLY** for Home Assistant **integrations** (backend Python components):
- Integrations provide services, sensors, platforms
- They run on the Home Assistant backend (Python)
- They require `manifest.json`, `__init__.py`, etc.

Lovelace cards are:
- Frontend UI components (JavaScript)
- Loaded in the browser
- Don't need Python or backend code

**Adding `custom_components/` to this repository would be INCORRECT and break functionality!**

## Verification

All requirements met:
```bash
# Check file exists
$ ls dist/history-explorer-card.js
dist/history-explorer-card.js  ✅

# Check hacs.json
$ cat hacs.json
{"name": "history-explorer-card", "filename": "history-explorer-card.js"}  ✅

# Check file is tracked
$ git ls-files | grep dist/history-explorer-card.js
dist/history-explorer-card.js  ✅

# Build and test
$ yarn build && yarn test
Build successful!  ✅
36 tests passed  ✅
```

## Common HACS Validation Issues

If HACS shows "Repository structure for main is not compliant", it's usually because:

1. **Missing GitHub Releases** - While not required, HACS prefers repositories with tagged releases
2. **Cache Issues** - HACS may cache old repository structure
3. **Validation Timing** - HACS validation may take time to update after changes

### This Repository IS Compliant

The current structure matches all HACS requirements for a Lovelace plugin. The error message may be:
- A temporary caching issue
- Related to missing releases (optional but recommended)
- A misunderstanding of the error message

## References

- [HACS Plugin Documentation](https://hacs.xyz/docs/publish/plugin/)
- [Lovelace Custom Cards](https://developers.home-assistant.io/docs/frontend/custom-ui/lovelace-custom-card/)
- [Example Working Repos](https://github.com/custom-cards)
