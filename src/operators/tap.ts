import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

function tap<I>(func: (value: I) => void): Operator<I, I> {
  return source => {
    return createSource((next, complete, error) => {
      const observer: Observer<I> = {
        next: value => {
          func(value);
          next(value);
        },
        error,
        complete,
      };

      return subscribe(source)(observer);
    });
  };
}

export default tap;
