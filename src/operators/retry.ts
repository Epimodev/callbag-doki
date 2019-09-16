import { Operator, Observer, Unsubscribe } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

function retry<I>(count: number): Operator<I, I> {
  return source => {
    return createSource((next, complete, error) => {
      let remaining = count;
      let unsubscribe: Unsubscribe;

      const observer: Observer<I> = {
        next,
        complete,
        error: err => {
          remaining -= 1;

          if (remaining >= 0) {
            unsubscribe = subscribe(source)(observer);
          } else {
            error(err);
          }
        },
      };

      unsubscribe = subscribe(source)(observer);

      return unsubscribe;
    });
  };
}

export default retry;
