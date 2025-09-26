import { state } from './core';
import { derived } from './derived';

describe('Manual derived optimization scripts', () => {
  const createScenario = () => {
    const a = state(1, 'a');
    const b = state(2, 'b');
    const sum = derived(() => a.value + b.value, 'sum');

    let subscriberCalls = 0;
    const unsubscribe = sum.subscribe(() => {
      subscriberCalls++;
    });

    return {
      a,
      b,
      sum,
      getSubscriberCalls: () => subscriberCalls,
      unsubscribe,
    };
  };

  it('test-derived-optimization.ts scenario – derived recomputes and notifies when result returns to original value', () => {
    const { a, b, sum, getSubscriberCalls, unsubscribe } = createScenario();
    try {
      expect(sum.value).toBe(3);
      expect(getSubscriberCalls()).toBe(0);

      a.value = 2;
      expect(sum.value).toBe(4);
      expect(getSubscriberCalls()).toBe(1);

      b.value = 1;
      expect(sum.value).toBe(3);
      expect(getSubscriberCalls()).toBe(2);
    } finally {
      unsubscribe();
    }
  });

  it('test-derived-optimization-docs/simple/correct/working scenarios – repeated changes trigger notifications for each dirty recompute', () => {
    const { a, b, sum, getSubscriberCalls, unsubscribe } = createScenario();
    try {
      expect(sum.value).toBe(3);
      expect(getSubscriberCalls()).toBe(0);

      const aValues = [2, 3, 4, 5, 6, 7];
      const bValues = [1, 0, -1, -2, -3, -4];

      let expectedCalls = 0;
      for (let index = 0; index < aValues.length; index++) {
        a.value = aValues[index];
        expect(sum.value).toBe(a.value + b.value);
        expectedCalls += 1;
        expect(getSubscriberCalls()).toBe(expectedCalls);

        b.value = bValues[index];
        expect(sum.value).toBe(a.value + b.value);
        expectedCalls += 1;
        expect(getSubscriberCalls()).toBe(expectedCalls);
      }
    } finally {
      unsubscribe();
    }
  });

  it('test-derived-optimization-real.ts scenario – current implementation still notifies when the value returns to its prior result', () => {
    const { a, b, sum, getSubscriberCalls, unsubscribe } = createScenario();
    try {
      expect(sum.value).toBe(3);
      expect(getSubscriberCalls()).toBe(0);

      a.value = 2;
      expect(sum.value).toBe(4);
      expect(getSubscriberCalls()).toBe(1);

      b.value = 1;
      expect(sum.value).toBe(3);
      expect(getSubscriberCalls()).toBe(2);
    } finally {
      unsubscribe();
    }
  });

  it('test-derived-optimization-user-request.ts scenario – current implementation notifies even when the computed value is unchanged', () => {
    const { a, b, sum, getSubscriberCalls, unsubscribe } = createScenario();
    try {
      expect(sum.value).toBe(3);
      expect(getSubscriberCalls()).toBe(0);

      a.value = 2;
      expect(sum.value).toBe(4);
      expect(getSubscriberCalls()).toBe(1);

      b.value = 1;
      expect(sum.value).toBe(3);
      expect(getSubscriberCalls()).toBe(2);
    } finally {
      unsubscribe();
    }
  });
});
