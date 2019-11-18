import { Source, Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

/**
 * Catches errors on the source to be handled by returning a new source
 *
 * @param handler - error handler
 * @return callbag operator
 *
 * @public
 */
function catchError<I, O>(handler: (error: any) => Source<O>): Operator<I, I | O> {
  return source => {
    return createSource((next, complete, error) => {
      let unsubscribeHandler = () => {};

      const observer: Observer<I> = {
        next,
        complete,
        error: err => {
          unsubscribeHandler = subscribe(handler(err))({ next, error, complete });
        },
      };

      const unsubscribe = subscribe(source)(observer);

      return () => {
        unsubscribeHandler();
        unsubscribe();
      };
    });
  };
}

export default catchError;
