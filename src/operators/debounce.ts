import { Operator } from '../index';
import { createOperator } from './';

function debounce<I>(duration: number): Operator<I, I> {
  return createOperator(observer => {
    let lastValue: I;
    let timeout = 0;

    return {
      next: value => {
        clearTimeout(timeout);
        lastValue = value;

        timeout = setTimeout(() => {
          observer.next(lastValue);
        }, duration);
      },
      error: err => {
        clearTimeout(timeout);
        observer.error(err);
      },
      complete: () => {
        clearTimeout(timeout);
        observer.complete();
      },
      clear: () => {
        clearTimeout(timeout);
      },
    };
  });
}

export default debounce;
