import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

/**
 * Delays the emission of items from the source by a given timeout
 *
 * @param duration - delay duration in milliseconds
 * @return callbag operator
 *
 * @public
 */
function delay<I>(duration: number): Operator<I, I> {
  return source => {
    return createSource((next, complete, error) => {
      const timeouts: number[] = [];

      const clearTimeouts = () => {
        for (let i = 0, l = timeouts.length; i < l; i += 1) {
          clearTimeout(timeouts[i]);
        }
      };

      const observer: Observer<I> = {
        next: value => {
          const timeout = setTimeout(() => {
            next(value);
            const index = timeouts.indexOf(timeout);
            timeouts.splice(index, 1);
          }, duration);
          timeouts.push(timeout);
        },
        error: err => {
          clearTimeouts();
          error(err);
        },
        complete: () => {
          const timeout = setTimeout(() => {
            complete();
            const index = timeouts.indexOf(timeout);
            timeouts.splice(index, 1);
          }, duration);
          timeouts.push(timeout);
        },
      };

      const unsubscribe = subscribe(source)(observer);

      return () => {
        clearTimeouts();
        unsubscribe();
      };
    });
  };
}

export default delay;
