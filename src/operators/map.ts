import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

function map<I, O>(mapper: (value: I) => O): Operator<I, O> {
  return source => {
    return createSource((next, complete, error) => {
      const observer: Observer<I> = {
        next: value => {
          next(mapper(value));
        },
        error,
        complete,
      };

      return subscribe(source)(observer);
    });
  };
}

export default map;
