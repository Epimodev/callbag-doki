import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

/**
 * Transform each value emitted by a source
 *
 * @param mapper - function which transform each emitted item
 * @return callbag operator
 *
 * @public
 */
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
