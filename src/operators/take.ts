import { Operator, Observer, Unsubscribe } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

function take<I>(max: number): Operator<I, I> {
  return source => {
    return createSource((next, complete, error) => {
      let taken = 0;
      let unsubscribe: Unsubscribe = () => {};

      const observer: Observer<I> = {
        next: value => {
          next(value);

          taken += 1;
          if (taken >= max) {
            unsubscribe();
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

export default take;
