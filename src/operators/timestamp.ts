import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

interface TimestampValue<T> {
  value: T;
  timestamp: number;
}

function timestamp<I>(): Operator<I, TimestampValue<I>> {
  return source => {
    return createSource((next, complete, error) => {
      const observer: Observer<I> = {
        next: value => {
          next({
            value,
            timestamp: Date.now(),
          });
        },
        error,
        complete,
      };

      return subscribe(source)(observer);
    });
  };
}

export default timestamp;
