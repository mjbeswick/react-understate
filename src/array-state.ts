/**
 * @fileoverview Array State - Reactive array state with convenient array methods
 *
 * Provides a state-like object that wraps arrays and provides reactive array methods.
 * All array methods automatically trigger subscriptions and maintain immutability.
 */

import { state, type State } from './core';

/**
 * Array state options
 */
export type ArrayStateOptions = {
  name?: string;
};

/**
 * Reactive array state that provides array methods with automatic reactivity
 *
 * @example
 * ```typescript
 * const items = arrayState<string>(['a', 'b', 'c']);
 *
 * // All these methods trigger subscriptions automatically
 * items.push('d');
 * items.pop();
 * items.splice(1, 1, 'x');
 * items.sort();
 *
 * // Subscribe to changes
 * items.subscribe(() => console.log('Array changed:', items.value));
 * ```
 */
export function arrayState<T>(
  initialValue: T[] = [],
  options?: ArrayStateOptions | string,
): ArrayState<T> {
  // Handle both string name and options object
  const name = typeof options === 'string' ? options : options?.name;
  // eslint-disable-next-line react-understate/no-direct-state-assignment
  const baseState = state(initialValue, name);

  // Create reactive array methods that automatically trigger subscriptions
  const createReactiveMethod = <K extends keyof T[]>(
    _methodName: K,
    method: T[][K],
  ) => {
    return ((...args: any[]) => {
      const result = (method as any).apply(baseState.value, args);

      // Trigger subscription by updating the state
      baseState.value = [...baseState.value];

      return result;
    }) as T[][K];
  };

  // Create the array state object
  const arrayStateObj = {
    // Core state properties
    get value() {
      return baseState.value;
    },

    set value(newValue: T[]) {
      baseState.value = newValue;
    },

    subscribe: baseState.subscribe,

    // Array methods that trigger reactivity
    push: createReactiveMethod('push', Array.prototype.push),
    pop: createReactiveMethod('pop', Array.prototype.pop),
    shift: createReactiveMethod('shift', Array.prototype.shift),
    unshift: createReactiveMethod('unshift', Array.prototype.unshift),
    splice: createReactiveMethod('splice', Array.prototype.splice),
    sort: createReactiveMethod('sort', Array.prototype.sort),
    reverse: createReactiveMethod('reverse', Array.prototype.reverse),
    fill: createReactiveMethod('fill', Array.prototype.fill),

    // Non-mutating methods (these don't need to trigger subscriptions)
    concat: (...args: (T | ConcatArray<T>)[]) =>
      baseState.value.concat(...args),
    slice: (start?: number, end?: number) => baseState.value.slice(start, end),
    join: (separator?: string) => baseState.value.join(separator),
    at: (index: number) => {
      // Fallback for environments that don't support Array.prototype.at
      if ('at' in Array.prototype) {
        return (baseState.value as any).at(index);
      }
      // Manual implementation for older environments
      const len = baseState.value.length;
      const i = index < 0 ? len + index : index;
      return i >= 0 && i < len ? baseState.value[i] : undefined;
    },
    indexOf: (searchElement: T, fromIndex?: number) =>
      baseState.value.indexOf(searchElement, fromIndex),
    lastIndexOf: (searchElement: T, fromIndex?: number) =>
      baseState.value.lastIndexOf(searchElement, fromIndex),
    includes: (searchElement: T, fromIndex?: number) =>
      baseState.value.includes(searchElement, fromIndex),
    find: (
      predicate: (value: T, index: number, array: T[]) => boolean,
      thisArg?: any,
    ) => baseState.value.find(predicate, thisArg),
    findIndex: (
      predicate: (value: T, index: number, array: T[]) => boolean,
      thisArg?: any,
    ) => baseState.value.findIndex(predicate, thisArg),
    filter: (
      predicate: (value: T, index: number, array: T[]) => boolean,
      thisArg?: any,
    ) => baseState.value.filter(predicate, thisArg),
    map: <U>(
      callbackfn: (value: T, index: number, array: T[]) => U,
      thisArg?: any,
    ) => baseState.value.map(callbackfn, thisArg),
    reduce: <U>(
      callbackfn: (
        previousValue: U,
        currentValue: T,
        currentIndex: number,
        array: T[],
      ) => U,
      initialValue: U,
    ) => baseState.value.reduce(callbackfn, initialValue),
    reduceRight: <U>(
      callbackfn: (
        previousValue: U,
        currentValue: T,
        currentIndex: number,
        array: T[],
      ) => U,
      initialValue: U,
    ) => baseState.value.reduceRight(callbackfn, initialValue),
    forEach: (
      callbackfn: (value: T, index: number, array: T[]) => void,
      thisArg?: any,
    ) => baseState.value.forEach(callbackfn, thisArg),
    some: (
      predicate: (value: T, index: number, array: T[]) => boolean,
      thisArg?: any,
    ) => baseState.value.some(predicate, thisArg),
    every: (
      predicate: (value: T, index: number, array: T[]) => boolean,
      thisArg?: any,
    ) => baseState.value.every(predicate, thisArg),
    flat: (depth?: number) => baseState.value.flat(depth),
    flatMap: <U, This = undefined>(
      callback: (this: This, value: T, index: number, array: T[]) => U | U[],
      thisArg?: This,
    ) => baseState.value.flatMap(callback, thisArg),

    // Array properties
    get length() {
      return baseState.value.length;
    },

    // Iterator support
    *[Symbol.iterator]() {
      for (const item of baseState.value) {
        yield item;
      }
    },

    // Array-like access
    [Symbol.toPrimitive]: () => baseState.value.length,

    // Utility methods
    clear: () => {
      baseState.value = [];
    },

    set: (newArray: T[]) => {
      baseState.value = newArray;
    },

    // Batch operations
    batch: (fn: (arr: T[]) => void) => {
      const newArray = [...baseState.value];
      fn(newArray);
      baseState.value = newArray;
    },
  };

  return arrayStateObj as unknown as ArrayState<T>;
}

/**
 * Array state type that extends State with array methods
 */
export type ArrayState<T> = State<T[]> & {
  // Mutating methods that trigger subscriptions
  push: (...items: T[]) => number;
  pop: () => T | undefined;
  shift: () => T | undefined;
  unshift: (...items: T[]) => number;
  splice: (start: number, deleteCount?: number, ...items: T[]) => T[];
  sort: (compareFn?: (a: T, b: T) => number) => T[];
  reverse: () => T[];
  fill: (value: T, start?: number, end?: number) => T[];

  // Non-mutating methods (read-only)
  concat: (...items: (T | ConcatArray<T>)[]) => T[];
  slice: (start?: number, end?: number) => T[];
  join: (separator?: string) => string;
  at: (index: number) => T | undefined;
  indexOf: (searchElement: T, fromIndex?: number) => number;
  lastIndexOf: (searchElement: T, fromIndex?: number) => number;
  includes: (searchElement: T, fromIndex?: number) => boolean;
  find: (
    predicate: (value: T, index: number, array: T[]) => boolean,
    thisArg?: any,
  ) => T | undefined;
  findIndex: (
    predicate: (value: T, index: number, array: T[]) => boolean,
    thisArg?: any,
  ) => number;
  filter: (
    predicate: (value: T, index: number, array: T[]) => boolean,
    thisArg?: any,
  ) => T[];
  map: <U>(
    callbackfn: (value: T, index: number, array: T[]) => U,
    thisArg?: any,
  ) => U[];
  reduce: <U>(
    callbackfn: (
      previousValue: U,
      currentValue: T,
      currentIndex: number,
      array: T[],
    ) => U,
    initialValue: U,
  ) => U;
  reduceRight: <U>(
    callbackfn: (
      previousValue: U,
      currentValue: T,
      currentIndex: number,
      array: T[],
    ) => U,
    initialValue: U,
  ) => U;
  forEach: (
    callbackfn: (value: T, index: number, array: T[]) => void,
    thisArg?: any,
  ) => void;
  some: (
    predicate: (value: T, index: number, array: T[]) => boolean,
    thisArg?: any,
  ) => boolean;
  every: (
    predicate: (value: T, index: number, array: T[]) => boolean,
    thisArg?: any,
  ) => boolean;
  flat: (depth?: number) => T[];
  flatMap: <U, This = undefined>(
    callback: (this: This, value: T, index: number, array: T[]) => U | U[],
    thisArg?: This,
  ) => U[];

  // Properties
  readonly length: number;

  // Iterator support
  [Symbol.iterator]: () => IterableIterator<T>;
  [Symbol.toPrimitive]: () => number;

  // Utility methods
  clear: () => void;
  set: (newArray: T[]) => void;
  batch: (fn: (arr: T[]) => void) => void;
};
