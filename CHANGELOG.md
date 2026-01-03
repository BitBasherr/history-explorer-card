# Changelog

Changelog for the HA History Explorer Card.
(Using format and definitions from https://keepachangelog.com/en/1.0.0/)

## [Unreleased]
### Added
- Comprehensive test suite with Jest and jsdom
- 36 tests covering state color customization and HA 2025.12.4 compatibility
- GitHub Actions CI/CD workflow for automated testing
- Test coverage reporting
- TESTING.md documentation for test infrastructure
- CHANGES.md explaining Issue #48 fix and compatibility improvements
- .gitignore file to exclude test artifacts and build files

### Fixed
- Verified state color customization works correctly (Issue #48)
- Ensured Home Assistant 2025.12.4 compatibility
- Verified card lifecycle methods (setConfig, getCardSize)
- Confirmed custom element registration compatibility

### Changed
- Added test, test:watch, and test:coverage npm scripts
- Updated package.json with testing dependencies

## [v1.0.54] - 2024-05-10
### Changed
- Switch from concatenating files, to using normal JS imports and exports. Hopefully making the build process more reliable and repeatable

## [v1.0.53] - 2024-05-07
### Added
- Adding full reference config, at full-reference-config.yaml, which explains all possible configuration options

## [v1.0.52] - 2024-05-02
### Changed
- First release from SpangleLabs fork
- Re-implement build system, switching to using yarn and webpack

## [v1.0.51] - 2023-11-24
Final release from original alexarch21 repository