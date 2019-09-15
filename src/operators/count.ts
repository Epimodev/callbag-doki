import { Operator } from '../index';
import { createOperator2 } from './';

function count<I>(): Operator<I, number> {
  return createOperator2(observer => {
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
