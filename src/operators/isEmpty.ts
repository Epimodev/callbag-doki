import { Operator, Observer, Unsubscribe } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

function isEmpty<I>(): Operator<I, boolean> {
  return source => {
    return createSource((next, complete, error) => {
      let unsubscribe: Unsubscribe = () => {};

      const observer: Observer<I> = {
        next: () => {
          next(false);
          unsubscribe();
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

export default isEmpty;
