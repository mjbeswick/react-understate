declare module '../../dist/react-understate.esm.js' {
  export type State<T> = {
    readonly rawValue: T;
    get value(): T;
    set value(newValue: T | ((prev: T) => T | Promise<T>));
    subscribe(fn: () => void): () => void;
  };
  export function state<T>(initial: T, name?: string): State<T>;
  export function action<T extends (...args: any[]) => any>(
    fn: T,
    name?: string,
  ): T;
  export function batch(fn: () => void, name?: string): void;
}
