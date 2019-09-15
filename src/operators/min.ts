import { Operator } from '../index';
import { createOperator } from './';

function min(): Operator<number, number> {
  return createOperator(observer => {
    let min = Infinity;

    return {
      next: value => {
        if (min === undefined || value < min) {
          min = value;
        }
      },
      error: observer.error,
      complete: () => {
        observer.next(min);
        observer.complete();
      },
    };
  });
}

export default min;
