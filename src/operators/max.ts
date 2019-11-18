import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

/**
 * Emits only the highest value of source when it completes
 *
 * @return callbag operator
 *
 * @public
 */
function max(): Operator<number, number> {
  return source => {
    return createSource((next, complete, error) => {
      let max = -Infinity;

      const observer: Observer<number> = {
        next: value => {
          if (max === undefined || value > max) {
            max = value;
          }
        },
        error,
        complete: () => {
          next(max);
          complete();
        },
      };

      return subscribe(source)(observer);
    });
  };
}

export default max;
