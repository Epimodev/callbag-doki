import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

function last<I, D>(
  predicate?: ((value: I) => boolean) | null,
  defaultValue?: D,
): Operator<I, I | D> {
  return source => {
    return createSource((next, complete, error) => {
      let last: I;
      let unsubscribe = () => {};

      const observer: Observer<I> = {
        next: value => {
          if (!predicate || predicate(value)) {
            last = value;
          }
        },
        error,
        complete: () => {
          if (last !== undefined) {
            next(last);
            complete();
          } else if (defaultValue !== undefined) {
            next(defaultValue);
            complete();
          } else {
            error(new Error('operator/last: source complete without any value'));
          }
        },
      };

      unsubscribe = subscribe(source)(observer);

      return unsubscribe;
    });
  };
}

export default last;
