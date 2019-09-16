import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

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
  return source => {
    return createSource((next, complete, error) => {
      let lastValue: I;
      let timeout = 0;

      const observer: Observer<I> = {
        next: value => {
          lastValue = value;

          if (!timeout) {
            if (leading) {
              next(lastValue);
            }

            timeout = setTimeout(() => {
              timeout = 0;
              if (trailing) {
                next(lastValue);
              }
            }, duration);
          }
        },
        error: err => {
          clearTimeout(timeout);
          error(err);
        },
        complete: () => {
          clearTimeout(timeout);
          complete();
        },
      };

      const unsubscribe = subscribe(source)(observer);

      return () => {
        clearTimeout(timeout);
        unsubscribe();
      };
    });
  };
}

export default throttle;
