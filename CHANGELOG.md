# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### 🎉 Major Release

This is the first stable release of react-understate with all core functionality working correctly.

### ✨ Added

- **Multiple Signal Support**: `useUnderstate` now accepts multiple signals in a single call

  ```tsx
  // Before: Multiple calls
  useUnderstate(state1);
  useUnderstate(state2);
  useUnderstate(state3);

  // After: Single call
  useUnderstate(state1, state2, state3);
  ```

- **Automatic React Detection**: No manual setup required - works out of the box with React 18+
- **Comprehensive TypeScript Support**: Full type safety with proper overloads

### 🐛 Fixed

- **Critical Text Input Bug**: Fixed issue where text inputs were not updating due to incorrect `useSyncExternalStore` implementation
- **React Integration**: Properly implemented `useUnderstate` hook to trigger re-renders when state changes
- **State Subscription**: Fixed dependency tracking in React components

### 🔧 Changed

- **Deprecated `setReact`**: Manual React setup is no longer needed
- **Simplified API**: Removed unnecessary configuration steps
- **Updated Examples**: Todo app and calculator examples now use the new multi-signal syntax

### 📚 Documentation

- Updated README with new API examples
- Added comprehensive JSDoc comments
- Improved code examples and usage patterns

### 🧪 Testing

- Added comprehensive test suite for React integration
- Tests for both single and multiple signal scenarios
- Improved test coverage and reliability

### 🏗️ Build & Development

- Cleaned up debugging code from production builds
- Improved build process and optimization
- Better error handling and development experience

---

## [0.1.1] - Pre-release

### Added

- Initial implementation of reactive signals
- Core state management functionality
- Basic React integration
- TypeScript support
- Build system and examples

### Known Issues

- Text input not working in React components
- Manual React setup required
- Limited documentation
