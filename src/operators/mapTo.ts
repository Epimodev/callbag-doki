import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

function mapTo<I, O>(value: O): Operator<I, O> {
  return source => {
    return createSource((next, complete, error) => {
      const observer: Observer<I> = {
        next: () => {
          next(value);
        },
        error,
        complete,
      };

      return subscribe(source)(observer);
    });
  };
}

export default mapTo;
