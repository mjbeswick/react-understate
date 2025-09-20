/**
 * @fileoverview Tests for Array State functionality
 */

import { arrayState } from './array-state';

describe('ArrayState', () => {
  describe('Basic Functionality', () => {
    it('should create an array state with initial value', () => {
      const items = arrayState<string>(['a', 'b', 'c']);
      expect(items.value).toEqual(['a', 'b', 'c']);
      expect(items.length).toBe(3);
    });

    it('should create an empty array state by default', () => {
      const items = arrayState<string>();
      expect(items.value).toEqual([]);
      expect(items.length).toBe(0);
    });

    it('should support name option', () => {
      const items = arrayState<string>(['test'], { name: 'testItems' });
      expect(items.value).toEqual(['test']);
    });
  });

  describe('Mutating Methods', () => {
    it('should handle push operations', () => {
      const items = arrayState<string>(['a', 'b']);
      const result = items.push('c', 'd');

      expect(result).toBe(4);
      expect(items.value).toEqual(['a', 'b', 'c', 'd']);
      expect(items.length).toBe(4);
    });

    it('should handle pop operations', () => {
      const items = arrayState<string>(['a', 'b', 'c']);
      const result = items.pop();

      expect(result).toBe('c');
      expect(items.value).toEqual(['a', 'b']);
      expect(items.length).toBe(2);
    });

    it('should handle shift operations', () => {
      const items = arrayState<string>(['a', 'b', 'c']);
      const result = items.shift();

      expect(result).toBe('a');
      expect(items.value).toEqual(['b', 'c']);
      expect(items.length).toBe(2);
    });

    it('should handle unshift operations', () => {
      const items = arrayState<string>(['b', 'c']);
      const result = items.unshift('a');

      expect(result).toBe(3);
      expect(items.value).toEqual(['a', 'b', 'c']);
      expect(items.length).toBe(3);
    });

    it('should handle splice operations', () => {
      const items = arrayState<string>(['a', 'b', 'c', 'd']);
      const result = items.splice(1, 2, 'x', 'y');

      expect(result).toEqual(['b', 'c']);
      expect(items.value).toEqual(['a', 'x', 'y', 'd']);
      expect(items.length).toBe(4);
    });

    it('should handle sort operations', () => {
      const items = arrayState<number>([3, 1, 4, 2]);
      const result = items.sort((a, b) => a - b);

      expect(result).toEqual([1, 2, 3, 4]);
      expect(items.value).toEqual([1, 2, 3, 4]);
    });

    it('should handle reverse operations', () => {
      const items = arrayState<string>(['a', 'b', 'c']);
      const result = items.reverse();

      expect(result).toEqual(['c', 'b', 'a']);
      expect(items.value).toEqual(['c', 'b', 'a']);
    });

    it('should handle fill operations', () => {
      const items = arrayState<number>([1, 2, 3, 4]);
      const result = items.fill(0, 1, 3);

      expect(result).toEqual([1, 0, 0, 4]);
      expect(items.value).toEqual([1, 0, 0, 4]);
    });
  });

  describe('Non-mutating Methods', () => {
    it('should handle concat operations', () => {
      const items = arrayState<string>(['a', 'b']);
      const result = items.concat(['c', 'd']);

      expect(result).toEqual(['a', 'b', 'c', 'd']);
      expect(items.value).toEqual(['a', 'b']); // Original unchanged
    });

    it('should handle slice operations', () => {
      const items = arrayState<string>(['a', 'b', 'c', 'd']);
      const result = items.slice(1, 3);

      expect(result).toEqual(['b', 'c']);
      expect(items.value).toEqual(['a', 'b', 'c', 'd']); // Original unchanged
    });

    it('should handle join operations', () => {
      const items = arrayState<string>(['a', 'b', 'c']);
      const result = items.join('-');

      expect(result).toBe('a-b-c');
    });

    it('should handle at operations', () => {
      const items = arrayState<string>(['a', 'b', 'c', 'd']);

      // Positive indices
      expect(items.at(0)).toBe('a');
      expect(items.at(1)).toBe('b');
      expect(items.at(3)).toBe('d');
      expect(items.at(4)).toBeUndefined();

      // Negative indices
      expect(items.at(-1)).toBe('d');
      expect(items.at(-2)).toBe('c');
      expect(items.at(-4)).toBe('a');
      expect(items.at(-5)).toBeUndefined();
    });

    it('should handle indexOf operations', () => {
      const items = arrayState<string>(['a', 'b', 'c', 'b']);
      expect(items.indexOf('b')).toBe(1);
      expect(items.indexOf('b', 2)).toBe(3);
      expect(items.indexOf('x')).toBe(-1);
    });

    it('should handle includes operations', () => {
      const items = arrayState<string>(['a', 'b', 'c']);
      expect(items.includes('b')).toBe(true);
      expect(items.includes('x')).toBe(false);
    });

    it('should handle find operations', () => {
      const items = arrayState<number>([1, 2, 3, 4]);
      const result = items.find(x => x > 2);

      expect(result).toBe(3);
    });

    it('should handle filter operations', () => {
      const items = arrayState<number>([1, 2, 3, 4, 5]);
      const result = items.filter(x => x % 2 === 0);

      expect(result).toEqual([2, 4]);
      expect(items.value).toEqual([1, 2, 3, 4, 5]); // Original unchanged
    });

    it('should handle map operations', () => {
      const items = arrayState<number>([1, 2, 3]);
      const result = items.map(x => x * 2);

      expect(result).toEqual([2, 4, 6]);
      expect(items.value).toEqual([1, 2, 3]); // Original unchanged
    });

    it('should handle reduce operations', () => {
      const items = arrayState<number>([1, 2, 3, 4]);
      const result = items.reduce((sum, x) => sum + x, 0);

      expect(result).toBe(10);
    });

    it('should handle forEach operations', () => {
      const items = arrayState<string>(['a', 'b', 'c']);
      const results: string[] = [];

      items.forEach(item => results.push(item));

      expect(results).toEqual(['a', 'b', 'c']);
    });

    it('should handle some operations', () => {
      const items = arrayState<number>([1, 2, 3, 4]);
      expect(items.some(x => x > 3)).toBe(true);
      expect(items.some(x => x > 5)).toBe(false);
    });

    it('should handle every operations', () => {
      const items = arrayState<number>([1, 2, 3, 4]);
      expect(items.every(x => x > 0)).toBe(true);
      expect(items.every(x => x > 2)).toBe(false);
    });
  });

  describe('Utility Methods', () => {
    it('should handle clear operations', () => {
      const items = arrayState<string>(['a', 'b', 'c']);
      items.clear();

      expect(items.value).toEqual([]);
      expect(items.length).toBe(0);
    });

    it('should handle set operations', () => {
      const items = arrayState<string>(['a', 'b']);
      items.set(['x', 'y', 'z']);

      expect(items.value).toEqual(['x', 'y', 'z']);
      expect(items.length).toBe(3);
    });

    it('should handle batch operations', () => {
      const items = arrayState<number>([1, 2, 3]);
      items.batch(arr => {
        arr.push(4);
        arr.push(5);
        arr.splice(0, 1); // Remove first element
      });

      expect(items.value).toEqual([2, 3, 4, 5]);
    });
  });

  describe('Subscription Management', () => {
    it('should notify subscribers on mutating operations', () => {
      const items = arrayState<string>(['a', 'b']);
      let notificationCount = 0;

      const unsubscribe = items.subscribe(() => {
        notificationCount++;
      });

      // Initial subscription
      expect(notificationCount).toBe(0);

      // Mutating operations should trigger notifications
      items.push('c');
      expect(notificationCount).toBe(1);

      items.pop();
      expect(notificationCount).toBe(2);

      items.splice(0, 1, 'x');
      expect(notificationCount).toBe(3);

      unsubscribe();

      // After unsubscribe, no more notifications
      items.push('d');
      expect(notificationCount).toBe(3);
    });

    it('should not notify subscribers on non-mutating operations', () => {
      const items = arrayState<string>(['a', 'b', 'c']);
      let notificationCount = 0;

      const unsubscribe = items.subscribe(() => {
        notificationCount++;
      });

      // Non-mutating operations should not trigger notifications
      items.concat(['d']);
      items.slice(1);
      items.join('-');
      items.indexOf('b');
      items.includes('a');
      items.find(x => x === 'b');
      items.filter(x => x !== 'a');
      items.map(x => x.toUpperCase());
      items.reduce((acc, x) => acc + x, '');
      items.forEach(() => {});
      items.some(x => x === 'b');
      items.every(x => x.length === 1);

      expect(notificationCount).toBe(0);

      unsubscribe();
    });
  });

  describe('Iterator Support', () => {
    it('should support for...of loops', () => {
      const items = arrayState<string>(['a', 'b', 'c']);
      const results: string[] = [];

      for (const item of items) {
        results.push(item);
      }

      expect(results).toEqual(['a', 'b', 'c']);
    });

    it('should support spread operator', () => {
      const items = arrayState<string>(['a', 'b', 'c']);
      const spread = [...items];

      expect(spread).toEqual(['a', 'b', 'c']);
    });

    it('should support Array.from', () => {
      const items = arrayState<string>(['a', 'b', 'c']);
      const fromArray = Array.from(items);

      expect(fromArray).toEqual(['a', 'b', 'c']);
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety for different array types', () => {
      const numbers = arrayState<number>([1, 2, 3]);
      const strings = arrayState<string>(['a', 'b', 'c']);
      const objects = arrayState<{ id: number; name: string }>([
        { id: 1, name: 'test' },
      ]);

      // TypeScript should catch these at compile time
      expect(numbers.push(4)).toBe(4);
      expect(strings.push('d')).toBe(4);
      expect(objects.push({ id: 2, name: 'test2' })).toBe(2);

      expect(numbers.value).toEqual([1, 2, 3, 4]);
      expect(strings.value).toEqual(['a', 'b', 'c', 'd']);
      expect(objects.value).toEqual([
        { id: 1, name: 'test' },
        { id: 2, name: 'test2' },
      ]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty array operations', () => {
      const items = arrayState<string>([]);

      expect(items.pop()).toBeUndefined();
      expect(items.shift()).toBeUndefined();
      expect(items.splice(0, 0)).toEqual([]);
      expect(items.length).toBe(0);
    });

    it('should handle operations on single element arrays', () => {
      const items = arrayState<string>(['a']);

      expect(items.pop()).toBe('a');
      expect(items.value).toEqual([]);

      items.push('b');
      expect(items.shift()).toBe('b');
      expect(items.value).toEqual([]);
    });

    it('should handle out-of-bounds operations', () => {
      const items = arrayState<string>(['a', 'b']);

      // splice with out-of-bounds start
      const result = items.splice(10, 1, 'c');
      expect(result).toEqual([]);
      expect(items.value).toEqual(['a', 'b', 'c']);
    });
  });
});
