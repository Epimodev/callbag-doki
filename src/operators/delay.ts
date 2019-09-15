import { Operator } from '../index';
import { createOperator } from './';

function delay<I>(duration: number): Operator<I, I> {
  return createOperator(observer => {
    const timeouts: number[] = [];

    const clearTimeouts = () => {
      for (let i = 0, l = timeouts.length; i < l; i += 1) {
        clearTimeout(timeouts[i]);
      }
    };

    return {
      next: value => {
        const timeout = setTimeout(() => {
          observer.next(value);
          const index = timeouts.indexOf(timeout);
          timeouts.splice(index, 1);
        }, duration);
        timeouts.push(timeout);
      },
      error: err => {
        clearTimeouts();
        observer.error(err);
      },
      complete: () => {
        const timeout = setTimeout(() => {
          observer.complete();
          const index = timeouts.indexOf(timeout);
          timeouts.splice(index, 1);
        }, duration);
        timeouts.push(timeout);
      },
      clear: clearTimeouts,
    };
  });
}

export default delay;
