import * as ReactiveDOM from './index';

describe('ReactiveDOM exports', () => {
  describe('state exports', () => {
    it('should export state function', () => {
      expect(typeof ReactiveDOM.state).toBe('function');
      // Test that State type is available
      const state = ReactiveDOM.state(0);
      expect(state).toBeDefined();
    });

    it('should export derived function', () => {
      expect(typeof ReactiveDOM.derived).toBe('function');
      // Test that derived type is available
      const state = ReactiveDOM.state(0);
      const derivedValue = ReactiveDOM.derived(() => state.value * 2);
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
        'state',
        'derived',
        'effect',
        'batch',
        'useUnderstate',
      ];

      expectedProperties.forEach(prop => {
        expect(ReactiveDOM).toHaveProperty(prop);
      });
    });
  });
});
