import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

/**
 * Emits only the lowest value of source when it completes
 *
 * @return callbag operator
 *
 * @public
 */
function min(): Operator<number, number> {
  return source => {
    return createSource((next, complete, error) => {
      let min = Infinity;

      const observer: Observer<number> = {
        next: value => {
          if (min === undefined || value < min) {
            min = value;
          }
        },
        error,
        complete: () => {
          next(min);
          complete();
        },
      };

      return subscribe(source)(observer);
    });
  };
}

export default min;
