/**
 * @fileoverview Tests to verify subscription callbacks receive the value parameter
 */

import { state, derived } from './index';

describe('Subscription Value Parameter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should pass value to state subscription callback', () => {
    const testState = state(0, 'testState');
    let receivedValue: number | undefined;

    testState.subscribe(value => {
      receivedValue = value;
    });

    expect(receivedValue).toBeUndefined(); // No initial call

    testState.value = 42;
    expect(receivedValue).toBe(42);

    testState.value = 100;
    expect(receivedValue).toBe(100);
  });

  it('should pass value to derived subscription callback', () => {
    const base = state(10, 'base');
    const doubled = derived(() => base.value * 2, 'doubled');
    let receivedValue: number | undefined;
    let callCount = 0;

    doubled.subscribe(value => {
      receivedValue = value;
      callCount++;
    });

    expect(receivedValue).toBeUndefined(); // No initial call
    expect(callCount).toBe(0);

    base.value = 15;
    // Access the derived value to trigger recomputation and subscription notification
    doubled.value;
    expect(receivedValue).toBe(30);
    expect(callCount).toBe(1);

    base.value = 20;
    // Access the derived value to trigger recomputation and subscription notification
    doubled.value;
    expect(receivedValue).toBe(40);
    expect(callCount).toBe(2);
  });

  it('should pass value to multiple subscribers', () => {
    const testState = state(0, 'testState');
    let value1: number | undefined;
    let value2: number | undefined;

    testState.subscribe(value => {
      value1 = value;
    });

    testState.subscribe(value => {
      value2 = value;
    });

    testState.value = 42;
    expect(value1).toBe(42);
    expect(value2).toBe(42);

    testState.value = 100;
    expect(value1).toBe(100);
    expect(value2).toBe(100);
  });

  it('should pass object values correctly', () => {
    const testState = state({ count: 0 }, 'testState');
    let receivedValue: { count: number } | undefined;

    testState.subscribe(value => {
      receivedValue = value;
    });

    testState.value = { count: 42 };
    expect(receivedValue).toEqual({ count: 42 });

    testState.value = { count: 100 };
    expect(receivedValue).toEqual({ count: 100 });
  });

  it('should pass null values correctly', () => {
    const testState = state<number | null>(null, 'testState');
    let receivedValue: number | null | undefined;

    testState.subscribe(value => {
      receivedValue = value;
    });

    testState.value = 42;
    expect(receivedValue).toBe(42);

    testState.value = null;
    expect(receivedValue).toBe(null);
  });
});
