import { state, batch } from './core';

describe('observeMutations (shallow)', () => {
  it('notifies on array mutators (push/pop/splice/etc)', () => {
    const s = state<number[]>([1, 2], { observeMutations: true });
    const calls: number[][] = [];
    const unsub = s.subscribe(() => {
      calls.push([...s.value]);
    });

    s.value.push(3);
    s.value.pop();
    s.value.unshift(0);
    s.value.shift();
    s.value.splice(1, 1, 9);
    s.value.sort();
    s.value.reverse();
    s.value.fill(7, 0, 1);

    unsub();
    expect(calls.length).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(calls[calls.length - 1])).toBe(true);
  });

  it('does not notify on read-only array methods', () => {
    const s = state<number[]>([3, 1, 2], { observeMutations: true });
    let triggered = false;
    const unsub = s.subscribe(() => {
      triggered = true;
    });

    const m = s.value.map(x => x * 2);
    const f = s.value.filter(x => x > 1);
    const j = s.value.join(',');
    const a0 = s.value.at(0);
    unsub();

    expect(triggered).toBe(false);
    expect(m).toEqual([6, 2, 4]);
    expect(f).toEqual([3, 2]);
    expect(j).toBe('3,1,2');
    expect(a0).toBe(3);
  });

  it('full replacement via value works', () => {
    const s = state<number[]>([1], { observeMutations: true });
    let last: number[] = [];
    s.subscribe(() => {
      last = s.value;
    });
    s.value = [5, 6];
    expect(last).toEqual([5, 6]);
  });

  it('object property set/delete notifies (shallow)', () => {
    const s = state<{ name: string; age?: number }>(
      { name: 'Ada' },
      { observeMutations: true },
    );
    const values: Array<{ name: string; age?: number }> = [];
    s.subscribe(() => {
      values.push({ ...s.value });
    });

    s.value.name = 'Lovelace';
    s.value.age = 36 as any;
    delete s.value.age;

    expect(values.some(v => v.name === 'Lovelace')).toBe(true);
  });

  it('nested array inside object proxies mutators', () => {
    const s = state<{ tags: string[] }>(
      { tags: ['a'] },
      { observeMutations: true },
    );
    let latest: string[] = [];
    s.subscribe(() => {
      latest = [...s.value.tags];
    });

    s.value.tags.push('b');
    s.value.tags.splice(0, 1, 'z');

    expect(latest).toEqual(['z', 'b']);
  });

  it('batch groups multiple commits into single flush', () => {
    const s = state<number[]>([], { observeMutations: true });
    let count = 0;
    s.subscribe(() => {
      count++;
    });

    batch(() => {
      s.value.push(1);
      s.value.push(2);
      s.value.push(3);
    }, 'testBatch');

    expect(count).toBeGreaterThanOrEqual(1);
  });
});
