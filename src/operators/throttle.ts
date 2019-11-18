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

/**
 * Emits a value from the source, then ignores subsequent source values for duration milliseconds, then repeats this process
 *
 * @param duration - time in milliseconds to wait before emitting another value after emitting the last value
 * @param config - a configuration object to define leading and trailing behavior. Defaults to `{ leading: true, trailing: false }`
 * @return callbag operator
 *
 * @public
 */
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
