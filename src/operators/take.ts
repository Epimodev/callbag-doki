import { Operator } from '../index';
import { createOperator } from './';

function take<I>(max: number): Operator<I, I> {
  return createOperator((observer, unsubscribe) => {
    let taken = 0;

    return {
      next: value => {
        observer.next(value);

        taken += 1;
        if (taken >= max) {
          unsubscribe();
          observer.complete();
        }
      },
      error: observer.error,
      complete: observer.complete,
    };
  });
}

export default take;
