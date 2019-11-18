import { Operator, Observer, Unsubscribe } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

/**
 * Returns a source that will resubscribe to the initial source when it completes, at most count times
 *
 * @param count - number of times the source items are repeated
 * @return callbag operator
 *
 * @public
 */
function repeat<I>(count: number): Operator<I, I> {
  return source => {
    return createSource((next, complete, error) => {
      let remaining = count;
      let unsubscribe: Unsubscribe = () => {};

      const observer: Observer<I> = {
        next,
        error,
        complete: () => {
          remaining -= 1;
          if (remaining > 0) {
            unsubscribe = subscribe(source)(observer);
          } else {
            complete();
          }
        },
      };

      if (remaining > 0) {
        unsubscribe = subscribe(source)(observer);
      }

      return unsubscribe;
    });
  };
}

export default repeat;
