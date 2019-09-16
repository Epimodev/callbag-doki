import { Source, Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

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
