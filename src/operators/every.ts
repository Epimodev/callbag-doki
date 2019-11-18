import { Operator, Observer, Unsubscribe } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

/**
 * Returns a source that emits whether or not every item of the source satisfies the condition specified
 *
 * @param predicate - function for determining if an item meets a specified condition
 * @return callbag operator
 *
 * @public
 */
function every<I>(predicate: (value: I) => boolean): Operator<I, boolean> {
  return source => {
    return createSource((next, complete, error) => {
      let unsubscribe: Unsubscribe = () => {};

      const observer: Observer<I> = {
        next: value => {
          if (!predicate(value)) {
            unsubscribe();
            next(false);
            complete();
          }
        },
        error,
        complete: () => {
          next(true);
          complete();
        },
      };

      unsubscribe = subscribe(source)(observer);

      return unsubscribe;
    });
  };
}

export default every;
