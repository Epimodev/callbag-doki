import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

/**
 * Perform a side effect for every emission on the source without change it
 *
 * @param func - function called for each source emission
 * @return callbag operator
 *
 * @public
 */
function tap<I>(func: (value: I) => void): Operator<I, I> {
  return source => {
    return createSource((next, complete, error) => {
      const observer: Observer<I> = {
        next: value => {
          func(value);
          next(value);
        },
        error,
        complete,
      };

      return subscribe(source)(observer);
    });
  };
}

export default tap;
