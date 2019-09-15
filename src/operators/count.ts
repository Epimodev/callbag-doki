import { Operator } from '../index';
import { createOperator } from './';

function count<I>(): Operator<I, number> {
  return createOperator(observer => {
    let count = 0;

    return {
      next: () => {
        count += 1;
        observer.next(count);
      },
      error: observer.error,
      complete: observer.complete,
    };
  });
}

export default count;
