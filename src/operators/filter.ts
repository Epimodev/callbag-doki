import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

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
