import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

/**
 * Emits only the first value (or the first value that meets some condition) emitted by the source
 *
 * @param predicate - function for determining if an item meets a specified condition
 * @param defaultValue - default value to emit if source is empty
 * @return callbag operator
 *
 * @public
 */
function first<I, D>(
  predicate?: ((value: I) => boolean) | null,
  defaultValue?: D,
): Operator<I, I | D> {
  return source => {
    return createSource((next, complete, error) => {
      let unsubscribe = () => {};

      const observer: Observer<I> = {
        next: value => {
          if (!predicate || predicate(value)) {
            unsubscribe();
            next(value);
            complete();
          }
        },
        error,
        complete: () => {
          if (defaultValue !== undefined) {
            next(defaultValue);
            complete();
          } else {
            error(new Error('operator/first: source complete without any value'));
          }
        },
      };

      unsubscribe = subscribe(source)(observer);

      return unsubscribe;
    });
  };
}

export default first;
