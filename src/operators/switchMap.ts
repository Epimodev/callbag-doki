import { Source, Operator, Observer, Unsubscribe } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

/**
 * Projects each source value to a source which is merged in the output source, emitting values only from the most recently projected source
 *
 * @param mapper - function which transform item emitted by the source to a new source
 * @return callbag operator
 *
 * @public
 */
function switchMap<I, O>(mapper: (value: I) => Source<O>): Operator<I, O> {
  return source => {
    return createSource((next, complete, error) => {
      let hasCurrentSubscription = false;
      let completed = false;
      let finished = false;
      let unsubscribe: Unsubscribe = () => {};
      let unsubscribePrevious: Unsubscribe = () => {};

      const mappedObserver: Observer<O> = {
        next,
        error: (err: any) => {
          hasCurrentSubscription = false;
          finished = true;
          error(err);
          unsubscribe();
        },
        complete: () => {
          hasCurrentSubscription = false;
          if (completed && !finished) {
            finished = true;
            complete();
          }
        },
      };

      const observer: Observer<I> = {
        next: value => {
          unsubscribePrevious();
          hasCurrentSubscription = true;

          const source = mapper(value);
          unsubscribePrevious = subscribe(source)(mappedObserver);
        },
        error: err => {
          completed = true;
          finished = true;
          unsubscribePrevious();
          error(err);
        },
        complete: () => {
          completed = true;
          if (!hasCurrentSubscription && !finished) {
            finished = true;
            complete();
          }
        },
      };

      unsubscribe = subscribe(source)(observer);

      return () => {
        unsubscribePrevious();
        unsubscribe();
      };
    });
  };
}

export default switchMap;
