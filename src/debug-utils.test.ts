/**
 * @fileoverview Tests for Debug Utilities
 */

import {
  findUserCodeLine,
  parseStackLine,
  createFileLocation,
  getFileLocationStyle,
  logDebug,
} from './debug-utils';

describe('Debug Utilities', () => {
  describe('findUserCodeLine', () => {
    it('should find user code line from stack trace', () => {
      const stack = `Error: Test error
    at Object.<anonymous> (/path/to/user/file.ts:10:5)
    at ModuleJob.run (node:internal/modules/esm/module_job:194:21)
    at async Loader.import (node:internal/modules/esm/loader:316:24)`;

      const result = findUserCodeLine(stack);
      expect(result).toBe(
        '    at Object.<anonymous> (/path/to/user/file.ts:10:5)',
      );
    });

    it('should filter out library code lines', () => {
      const stack = `Error: Test error
    at Object.<anonymous> (/path/to/user/file.ts:10:5)
    at core.ts:123:45
    at derived.ts:456:78
    at effects.ts:789:12
    at react.ts:321:65
    at node_modules/some-lib/index.js:1:1
    at dist/react-understate.esm.js:100:200
    at rollup/dist/index.js:50:30
    at vite/dist/client.js:200:400
    at ModuleJob.run (node:internal/modules/esm/module_job:194:21)`;

      const result = findUserCodeLine(stack);
      expect(result).toBe(
        '    at Object.<anonymous> (/path/to/user/file.ts:10:5)',
      );
    });

    it('should return undefined when no user code found', () => {
      const stack = `Error: Test error
    at core.ts:123:45
    at derived.ts:456:78
    at node_modules/some-lib/index.js:1:1`;

      const result = findUserCodeLine(stack);
      expect(result).toBeUndefined();
    });

    it('should handle empty stack trace', () => {
      const stack = 'Error: Test error';

      const result = findUserCodeLine(stack);
      expect(result).toBeUndefined();
    });

    it('should filter out lines without colons', () => {
      const stack = `Error: Test error
    at Object.<anonymous> (/path/to/user/file.ts:10:5)
    at some function without location
    at another function`;

      const result = findUserCodeLine(stack);
      expect(result).toBe(
        '    at Object.<anonymous> (/path/to/user/file.ts:10:5)',
      );
    });

    it('should filter out empty lines', () => {
      const stack = `Error: Test error

    at Object.<anonymous> (/path/to/user/file.ts:10:5)
    `;

      const result = findUserCodeLine(stack);
      expect(result).toBe(
        '    at Object.<anonymous> (/path/to/user/file.ts:10:5)',
      );
    });
  });

  describe('parseStackLine', () => {
    it('should parse valid stack line', () => {
      const line = '    at Object.<anonymous> (/path/to/user/file.ts:10:5)';
      const result = parseStackLine(line);

      expect(result).toEqual({
        file: 'Object.<anonymous> (/path/to/user/file.ts',
        line: '10',
        col: '5',
      });
    });

    it('should parse stack line with different format', () => {
      const line = 'at someFunction (file.js:123:456)';
      const result = parseStackLine(line);

      expect(result).toEqual({
        file: 'someFunction (file.js',
        line: '123',
        col: '456',
      });
    });

    it('should return null for invalid stack line', () => {
      const line = '    at some function without location';
      const result = parseStackLine(line);

      expect(result).toBeNull();
    });

    it('should return null for empty line', () => {
      const line = '';
      const result = parseStackLine(line);

      expect(result).toBeNull();
    });

    it('should return null for line without proper format', () => {
      const line = '    at Object.<anonymous> (/path/to/user/file.ts)';
      const result = parseStackLine(line);

      expect(result).toBeNull();
    });
  });

  describe('createFileLocation', () => {
    it('should create file location string', () => {
      const result = createFileLocation('/path/to/file.ts', '10', '5');
      expect(result).toBe('%c/path/to/file.ts:10:5');
    });

    it('should handle different file paths', () => {
      const result = createFileLocation('file.js', '123', '456');
      expect(result).toBe('%cfile.js:123:456');
    });
  });

  describe('getFileLocationStyle', () => {
    it('should return file location style', () => {
      const result = getFileLocationStyle();
      expect(result).toBe(
        'color: #0066cc; text-decoration: underline; cursor: pointer;',
      );
    });
  });

  describe('logDebug', () => {
    let mockLogger: jest.Mock;

    beforeEach(() => {
      mockLogger = jest.fn();
    });

    it('should not log when debug is disabled', () => {
      logDebug('test message', { enabled: false, logger: mockLogger });
      expect(mockLogger).not.toHaveBeenCalled();
    });

    it('should not log when logger is not provided', () => {
      logDebug('test message', { enabled: true });
      expect(mockLogger).not.toHaveBeenCalled();
    });

    it('should log simple message when showFile is false', () => {
      logDebug('test message', {
        enabled: true,
        logger: mockLogger,
        showFile: false,
      });
      expect(mockLogger).toHaveBeenCalledWith('test message');
    });

    it('should log simple message when showFile is not specified', () => {
      logDebug('test message', { enabled: true, logger: mockLogger });
      expect(mockLogger).toHaveBeenCalledWith('test message');
    });

    it('should log with file location when showFile is true and stack is available', () => {
      // Mock Error.stack
      const originalError = Error;
      const mockError = jest.fn().mockImplementation(() => {
        const error = new originalError();
        error.stack = `Error: Test error
    at Object.<anonymous> (/path/to/user/file.ts:10:5)
    at core.ts:123:45`;
        return error;
      });
      (global as any).Error = mockError;

      logDebug('test message', {
        enabled: true,
        logger: mockLogger,
        showFile: true,
      });

      expect(mockLogger).toHaveBeenCalledWith(
        'test message %cObject.<anonymous> (/path/to/user/file.ts:10:5',
        'color: #0066cc; text-decoration: underline; cursor: pointer;',
      );

      // Restore original Error
      (global as any).Error = originalError;
    });

    it('should log with fallback when file location cannot be parsed', () => {
      // Mock Error.stack
      const originalError = Error;
      const mockError = jest.fn().mockImplementation(() => {
        const error = new originalError();
        error.stack = `Error: Test error
    at some function without proper location
    at core.ts:123:45`;
        return error;
      });
      (global as any).Error = mockError;

      logDebug('test message', {
        enabled: true,
        logger: mockLogger,
        showFile: true,
      });

      expect(mockLogger).toHaveBeenCalledWith('test message');

      // Restore original Error
      (global as any).Error = originalError;
    });

    it('should log simple message when no user code found in stack', () => {
      // Mock Error.stack
      const originalError = Error;
      const mockError = jest.fn().mockImplementation(() => {
        const error = new originalError();
        error.stack = `Error: Test error
    at core.ts:123:45
    at derived.ts:456:78`;
        return error;
      });
      (global as any).Error = mockError;

      logDebug('test message', {
        enabled: true,
        logger: mockLogger,
        showFile: true,
      });

      expect(mockLogger).toHaveBeenCalledWith('test message');

      // Restore original Error
      (global as any).Error = originalError;
    });

    it('should log simple message when stack is not available', () => {
      // Mock Error.stack to be undefined
      const originalError = Error;
      const mockError = jest.fn().mockImplementation(() => {
        const error = new originalError();
        error.stack = undefined;
        return error;
      });
      (global as any).Error = mockError;

      logDebug('test message', {
        enabled: true,
        logger: mockLogger,
        showFile: true,
      });

      expect(mockLogger).toHaveBeenCalledWith('test message');

      // Restore original Error
      (global as any).Error = originalError;
    });
  });
});
