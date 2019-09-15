import { Operator } from '../index';
import { createOperator } from './';

type Reduce<I, O> = (acc: O, value: I) => O;

function reduce<I, O>(reducer: Reduce<I, O>, seed: O): Operator<I, O> {
  return createOperator(observer => {
    let acc = seed;

    return {
      next: value => {
        acc = reducer(acc, value);
      },
      error: observer.error,
      complete: () => {
        observer.next(acc);
        observer.complete();
      },
    };
  });
}

export default reduce;
