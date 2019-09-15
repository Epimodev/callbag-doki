import { Operator } from '../index';
import { createOperator } from './';

function takeLast<I>(count = 1): Operator<I, I> {
  return createOperator(observer => {
    const lastValues: I[] = [];

    return {
      next: value => {
        lastValues.push(value);

        if (lastValues.length > count) {
          lastValues.shift();
        }
      },
      error: observer.error,
      complete: () => {
        for (let i = 0, l = lastValues.length; i < l; i += 1) {
          observer.next(lastValues[i]);
        }

        observer.complete();
      },
    };
  });
}

export default takeLast;
