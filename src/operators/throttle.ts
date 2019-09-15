import { Operator } from '../index';
import { createOperator } from './';

interface ThrottleConfig {
  leading: boolean;
  trailing: boolean;
}

const defaultThrottleConfig: ThrottleConfig = {
  leading: true,
  trailing: false,
};

function throttle<I>(
  duration: number,
  { leading, trailing } = defaultThrottleConfig,
): Operator<I, I> {
  return createOperator(observer => {
    let lastValue: I;
    let timeout = 0;

    return {
      next: value => {
        lastValue = value;

        if (!timeout) {
          if (leading) {
            observer.next(lastValue);
          }

          timeout = setTimeout(() => {
            timeout = 0;
            if (trailing) {
              observer.next(lastValue);
            }
          }, duration);
        }
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

export default throttle;
