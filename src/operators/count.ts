import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

/**
 * Emits the number of emitted values at each source emission
 *
 * @return callbag operator
 *
 * @public
 */
function count<I>(): Operator<I, number> {
  return source => {
    return createSource((next, complete, error) => {
      let count = 0;

      const observer: Observer<I> = {
        next: () => {
          count += 1;
          next(count);
        },
        error,
        complete,
      };

      return subscribe(source)(observer);
    });
  };
}

export default count;
