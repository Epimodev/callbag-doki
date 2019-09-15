import { Operator } from '../index';
import { createOperator } from './';

function max(): Operator<number, number> {
  return createOperator(observer => {
    let max = -Infinity;

    return {
      next: value => {
        if (max === undefined || value > max) {
          max = value;
        }
      },
      error: observer.error,
      complete: () => {
        observer.next(max);
        observer.complete();
      },
    };
  });
}

export default max;
