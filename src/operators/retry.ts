import { Operator, Observer, Unsubscribe } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

/**
 * Returns a source that will resubscribe to the initial source each time it emits an error for a maximum of count
 *
 * @param count - maximum of reties to make
 * @return callbag operator
 *
 * @public
 */
function retry<I>(count: number): Operator<I, I> {
  return source => {
    return createSource((next, complete, error) => {
      let remaining = count;
      let unsubscribe: Unsubscribe;

      const observer: Observer<I> = {
        next,
        complete,
        error: err => {
          remaining -= 1;

          if (remaining >= 0) {
            unsubscribe = subscribe(source)(observer);
          } else {
            error(err);
          }
        },
      };

      unsubscribe = subscribe(source)(observer);

      return unsubscribe;
    });
  };
}

export default retry;
