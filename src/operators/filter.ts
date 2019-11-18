import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

/**
 * Filter items emitted by the source by only emitting those that satisfy a specified predicate
 *
 * @param predicate - function for determining if an item meets a specified condition
 * @return callbag operator
 *
 * @public
 */
function filter<I>(predicate: (value: I) => boolean): Operator<I, I> {
  return source => {
    return createSource((next, complete, error) => {
      const observer: Observer<I> = {
        next: value => {
          if (predicate(value)) {
            next(value);
          }
        },
        error,
        complete,
      };

      return subscribe(source)(observer);
    });
  };
}

export default filter;
