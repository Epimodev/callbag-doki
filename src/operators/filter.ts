import { Operator } from '../index';
import { createOperator } from './';

function filter<I>(predicate: (value: I) => boolean): Operator<I, I> {
  return createOperator(observer => {
    return {
      next: value => {
        if (predicate(value)) {
          observer.next(value);
        }
      },
      error: observer.error,
      complete: observer.complete,
    };
  });
}

export default filter;
