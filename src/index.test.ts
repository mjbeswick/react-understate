import * as ReactiveDOM from './index';

describe('ReactiveDOM exports', () => {
  describe('signal exports', () => {
    it('should export signal function', () => {
      expect(typeof ReactiveDOM.signal).toBe('function');
      // Test that Signal type is available
      const signal = ReactiveDOM.signal(0);
      expect(signal).toBeDefined();
    });

    it('should export derived function', () => {
      expect(typeof ReactiveDOM.derived).toBe('function');
      // Test that derived type is available
      const signal = ReactiveDOM.signal(0);
      const derivedValue = ReactiveDOM.derived(() => signal.value * 2);
      expect(derivedValue).toBeDefined();
    });

    it('should export effect function', () => {
      expect(typeof ReactiveDOM.effect).toBe('function');
    });

    it('should export batch function', () => {
      expect(typeof ReactiveDOM.batch).toBe('function');
    });
  });

  describe('default export test', () => {
    it('should have all expected properties', () => {
      const expectedProperties = [
        'signal',
        'derived',
        'effect',
        'batch',
        'useSubscribe',
        'setReact',
      ];

      expectedProperties.forEach((prop) => {
        expect(ReactiveDOM).toHaveProperty(prop);
      });
    });
  });
});
