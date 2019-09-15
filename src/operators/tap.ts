import { Operator } from '../index';
import { createOperator } from './';

function tap<I>(func: (value: I) => void): Operator<I, I> {
  return createOperator(observer => {
    return {
      next: value => {
        func(value);
        observer.next(value);
      },
      error: observer.error,
      complete: observer.complete,
    };
  });
}

export default tap;
