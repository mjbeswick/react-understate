/**
 * @fileoverview Browser debugging API declarations
 *
 * This file provides TypeScript declarations for the browser debugging API
 * that is exposed on window.reactUnderstate in development builds.
 */

declare global {
  interface Window {
    reactUnderstate: {
      /**
       * Configure debug logging for the reactive system.
       *
       * @param options - Optional debug configuration options
       * @returns Current debug configuration
       */
      configureDebug(options?: {
        enabled: boolean;
        logger?: (message: string, ...args: any[]) => void;
      }): {
        enabled: boolean;
        logger?: (message: string, ...args: any[]) => void;
      };

      /**
       * All named states, derived values, and effects registered for debugging.
       *
       * This object contains all reactive elements that were created with names,
       * allowing you to inspect and manipulate them from the browser console.
       */
      states: Record<string, any>;

      /**
       * All named actions registered for debugging.
       *
       * This object contains all actions that were created with names,
       * allowing you to call them directly from the browser console.
       */
      actions: Record<string, (...args: any[]) => any>;
    };
  }
}

export {};
