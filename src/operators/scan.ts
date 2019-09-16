import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

type Reduce<I, O> = (acc: O, value: I) => O;

function scan<I, O>(reducer: Reduce<I, O>, seed: O): Operator<I, O> {
  return source => {
    return createSource((next, complete, error) => {
      let acc = seed;

      const observer: Observer<I> = {
        next: value => {
          acc = reducer(acc, value);
          next(acc);
        },
        error,
        complete,
      };

      return subscribe(source)(observer);
    });
  };
}

export default scan;
