/**
 * @fileoverview Debug Utilities
 *
 * Shared utilities for debug logging functionality.
 */

/**
 * Filters stack trace lines to find user code (non-library code)
 */
export function findUserCodeLine(stack: string): string | undefined {
  const lines = stack.split('\n');
  return lines
    .slice(1) // Skip the "Error" line
    .find(
      line =>
        !line.includes('core.ts') &&
        !line.includes('derived.ts') &&
        !line.includes('effects.ts') &&
        !line.includes('react.ts') &&
        !line.includes('node_modules') &&
        !line.includes('dist/react-understate') &&
        !line.includes('.js?t=') &&
        !line.includes('rollup') &&
        !line.includes('vite') &&
        !line.includes('ModuleJob.run') &&
        !line.includes('node:internal') &&
        line.trim() !== '' &&
        line.includes(':'),
    );
}

/**
 * Extracts file, line, and column information from a stack trace line
 */
export function parseStackLine(
  line: string,
): { file: string; line: string; col: string } | null {
  const match = line.match(/at\s+(.+):(\d+):(\d+)/);
  if (match) {
    const [, file, lineNum, col] = match;
    if (file && lineNum && col) {
      return { file, line: lineNum, col };
    }
  }
  return null;
}

/**
 * Creates a clickable file location string for console logging
 */
export function createFileLocation(
  file: string,
  line: string,
  col: string,
): string {
  return `%c${file}:${line}:${col}`;
}

/**
 * Gets the file location styling for console.log
 */
export function getFileLocationStyle(): string {
  return 'color: #0066cc; text-decoration: underline; cursor: pointer;';
}

/**
 * Logs a debug message with optional file location
 */
export function logDebug(
  message: string,
  debugConfig: {
    enabled?: boolean;
    logger?: (message: string, ...args: any[]) => void;
    showFile?: boolean;
  },
): void {
  if (!debugConfig.enabled || !debugConfig.logger) {
    return;
  }

  if (debugConfig.showFile) {
    const stack = new Error().stack;
    if (stack) {
      const userLine = findUserCodeLine(stack);
      if (userLine) {
        const location = parseStackLine(userLine);
        if (location) {
          debugConfig.logger(
            `${message} ${createFileLocation(location.file, location.line, location.col)}`,
            getFileLocationStyle(),
          );
          return;
        } else {
          debugConfig.logger(`${message} at ${userLine.trim()}`);
          return;
        }
      }
    }
  }

  debugConfig.logger(message);
}
