import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

function find<I>(predicate: (value: I) => boolean): Operator<I, I> {
  return source => {
    return createSource((next, complete, error) => {
      let unsubscribe = () => {};

      const observer: Observer<I> = {
        next: value => {
          if (predicate(value)) {
            unsubscribe();
            next(value);
            complete();
          }
        },
        error,
        complete,
      };

      unsubscribe = subscribe(source)(observer);

      return unsubscribe;
    });
  };
}

export default find;
