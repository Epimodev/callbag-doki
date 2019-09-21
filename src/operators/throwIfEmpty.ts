import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

function throwIfEmpty<I>(errorFactory: () => any): Operator<I, I> {
  return source => {
    return createSource((next, complete, error) => {
      let empty = true;

      const observer: Observer<I> = {
        next: value => {
          empty = false;
          next(value);
        },
        error,
        complete: () => {
          if (empty) {
            error(errorFactory());
          } else {
            complete();
          }
        },
      };

      return subscribe(source)(observer);
    });
  };
}

export default throwIfEmpty;
