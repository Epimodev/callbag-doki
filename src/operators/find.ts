import { Operator } from '../index';
import { createOperator } from './';

function find<I>(predicate: (value: I) => boolean): Operator<I, I> {
  return createOperator((observer, unsubscribe) => {
    return {
      next: value => {
        if (predicate(value)) {
          unsubscribe();
          observer.next(value);
          observer.complete();
        }
      },
      error: observer.error,
      complete: observer.complete,
    };
  });
}

export default find;
