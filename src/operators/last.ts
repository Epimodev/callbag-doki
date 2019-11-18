import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

/**
 * Emits only the last value (or the last value that meets some condition) emitted by the source
 *
 * @param predicate - function for determining if an item meets a specified condition
 * @param defaultValue - default value to emit if source is empty
 * @return callbag operator
 *
 * @public
 */
function last<I, D>(
  predicate?: ((value: I) => boolean) | null,
  defaultValue?: D,
): Operator<I, I | D> {
  return source => {
    return createSource((next, complete, error) => {
      let last: I;
      let unsubscribe = () => {};

      const observer: Observer<I> = {
        next: value => {
          if (!predicate || predicate(value)) {
            last = value;
          }
        },
        error,
        complete: () => {
          if (last !== undefined) {
            next(last);
            complete();
          } else if (defaultValue !== undefined) {
            next(defaultValue);
            complete();
          } else {
            error(new Error('operator/last: source complete without any value'));
          }
        },
      };

      unsubscribe = subscribe(source)(observer);

      return unsubscribe;
    });
  };
}

export default last;
