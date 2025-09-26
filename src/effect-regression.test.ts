import { batch, state } from './core';
import { effect } from './effects';

describe('Manual effect and batching scripts', () => {
  it('test-batch-in-effects.ts scenario – batch inside effect executes without infinite loops and cooperates with external batches', () => {
    const count = state(0, 'count');
    const name = state('John', 'name');
    const seen: Array<{ count: number; name: string }> = [];

    const dispose = effect(() => {
      seen.push({ count: count.value, name: name.value });
      batch(() => {
        count.value = count.value + 1;
        name.value = name.value + '!';
      }, 'updateInEffect');
    }, 'testEffect');

    expect(count.value).toBe(1);
    expect(name.value).toBe('John!');
    expect(seen).toEqual([{ count: 0, name: 'John' }]);

    batch(() => {
      count.value = 5;
      name.value = 'Jane';
    }, 'updateOutsideEffect');

    expect(count.value).toBe(5);
    expect(name.value).toBe('Jane');
    expect(seen).toEqual([{ count: 0, name: 'John' }]);

    const updateBoth = () => {
      batch(() => {
        count.value = count.value + 1;
        name.value = name.value + '!';
      }, 'updateInAction');
    };

    updateBoth();

    expect(count.value).toBe(6);
    expect(name.value).toBe('Jane!');
    expect(seen).toEqual([{ count: 0, name: 'John' }]);

    dispose();
  });

  it('test-simple-rule.ts scenario – effect mutating state directly runs once', () => {
    const count = state(0, { name: 'count' });
    let runs = 0;

    const dispose = effect(
      () => {
        runs += 1;
        count.value = 42;
      },
      { name: 'badEffect' },
    );

    expect(runs).toBe(1);
    expect(count.value).toBe(42);

    dispose();
  });
});
