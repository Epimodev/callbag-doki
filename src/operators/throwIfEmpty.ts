import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

/**
 * Emit an error if the source completes without emitting a value
 *
 * @param errorFactory - factory function to produce the error to be thrown
 * @return callbag operator
 *
 * @public
 */
function throwIfEmpty<I>(errorFactory: () => any): Operator<I, I> {
  return source => {
    return createSource((next, complete, error) => {
      let empty = true;

      const observer: Observer<I> = {
        next: value => {
          empty = false;
          next(value);
        },
        error,
        complete: () => {
          if (empty) {
            error(errorFactory());
          } else {
            complete();
          }
        },
      };

      return subscribe(source)(observer);
    });
  };
}

export default throwIfEmpty;
