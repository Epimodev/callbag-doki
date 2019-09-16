import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

function debounce<I>(duration: number): Operator<I, I> {
  return source => {
    return createSource((next, complete, error) => {
      let lastValue: I;
      let timeout = 0;

      const observer: Observer<I> = {
        next: value => {
          clearTimeout(timeout);
          lastValue = value;

          timeout = setTimeout(() => {
            next(lastValue);
          }, duration);
        },
        error: err => {
          clearTimeout(timeout);
          error(err);
        },
        complete: () => {
          clearTimeout(timeout);
          complete();
        },
      };

      const unsubscribe = subscribe(source)(observer);

      return () => {
        clearTimeout(timeout);
        unsubscribe();
      };
    });
  };
}

export default debounce;
