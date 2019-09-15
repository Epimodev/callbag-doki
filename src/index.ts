import { START, DATA, END, Callbag, Source, Sink } from 'callbag/types';

export const CALLBAG_START: START = 0;
export const CALLBAG_RECEIVE: DATA = 1;
export const CALLBAG_FINISHING: END = 2;

export type CallbagType = START | DATA | END;

export type Operator<I, O> = (input: Source<I>) => Source<O>;

export type Listener<T> = (value: T) => void;

export interface Observer<T> {
  next?: Listener<T>;
  error?: (error?: any) => void;
  complete?: () => void;
}

export type Unsubscribe = () => void;

export { Callbag, Source, Sink };
