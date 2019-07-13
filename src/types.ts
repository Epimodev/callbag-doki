/**
 * Most of this file comes from @staltz gist:
 * https://gist.github.com/staltz/65454821a68d60a83c86e13052c4d17e
 */

export const CALLBAG_START = 0;
export const CALLBAG_RECEIVE = 1;
export const CALLBAG_FINISHING = 2;

export type CallbagType = typeof CALLBAG_START | typeof CALLBAG_RECEIVE | typeof CALLBAG_FINISHING;

// A Callbag dynamically receives input of type I
// and dynamically delivers output of type O
export type Callbag<I, O> = {
  (type: typeof CALLBAG_START, cb: Callbag<O, I>): void;
  (type: typeof CALLBAG_RECEIVE, data: I): void;
  (type: typeof CALLBAG_FINISHING, error?: any): void;
};

// A source only delivers data
export type Source<T> = Callbag<void, T>;

// A sink only receives data
export type Sink<T> = Callbag<T, void>;

export type Operator<I, O> = (input: Source<I>) => Source<O>;
