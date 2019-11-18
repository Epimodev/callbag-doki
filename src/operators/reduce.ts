import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

type Reduce<I, O> = (acc: O, value: I) => O;

/**
 * Applies an accumulator function over the source, and returns the accumulated result when the source completes
 *
 * @param reducer - reducer function called on each source value
 * @param seed - initial accumulation value
 * @return callbag operator
 *
 * @public
 */
function reduce<I, O>(reducer: Reduce<I, O>, seed: O): Operator<I, O> {
  return source => {
    return createSource((next, complete, error) => {
      let acc = seed;

      const observer: Observer<I> = {
        next: value => {
          acc = reducer(acc, value);
        },
        error,
        complete: () => {
          next(acc);
          complete();
        },
      };

      return subscribe(source)(observer);
    });
  };
}

export default reduce;
