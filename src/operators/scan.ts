import { Operator } from '../index';
import { createOperator } from './';

type Reduce<I, O> = (acc: O, value: I) => O;

function scan<I, O>(reducer: Reduce<I, O>, seed: O): Operator<I, O> {
  return createOperator(observer => {
    let acc = seed;

    return {
      next: value => {
        acc = reducer(acc, value);
        observer.next(acc);
      },
      error: observer.error,
      complete: observer.complete,
    };
  });
}

export default scan;
