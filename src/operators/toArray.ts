import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

/**
 * Collects all source emissions and emits them as an array when the source completes
 *
 * @return callbag operator
 *
 * @public
 */
function toArray<I>(): Operator<I, I[]> {
  return source => {
    return createSource((next, complete, error) => {
      const values: I[] = [];

      const observer: Observer<I> = {
        next: value => {
          values.push(value);
        },
        error,
        complete: () => {
          next(values);
          complete();
        },
      };

      return subscribe(source)(observer);
    });
  };
}

export default toArray;
