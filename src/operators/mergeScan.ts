import { Source, Operator, Observer, Unsubscribe } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

/**
 * Applies an accumulator function over the source where the accumulator function itself returns a source, then each intermediate source returned is merged into the output
 *
 * @param reducer - reducer function called on each source value
 * @param seed - initial accumulation value
 * @return callbag operator
 *
 * @public
 */
function mergeScan<I, O>(reducer: (acc: O, value: I) => Source<O>, seed: O): Operator<I, O> {
  return source => {
    return createSource((next, complete, error) => {
      let completed = false;
      let unsubscribe: Unsubscribe = () => {};
      // use this boolean to know if there is a current subscription
      // because with sync sources like `of`, `next` in scanObserver is called before `currentReducerSubscription` assignation
      let hasCurrentSubscription = false;
      let unsubscribeCurrent: Unsubscribe = () => {};
      const pendingValues: I[] = [];
      let acc = seed;

      const scanObserver: Observer<O> = {
        next: value => {
          acc = value;
          next(value);
        },
        error: (err: any) => {
          hasCurrentSubscription = false;
          error(err);
          unsubscribe();
        },
        complete: () => {
          hasCurrentSubscription = false;

          const nextValue = pendingValues.shift();
          if (nextValue !== undefined) {
            const nextSource = reducer(acc, nextValue);
            hasCurrentSubscription = true;
            unsubscribeCurrent = subscribe(nextSource)(scanObserver);
          } else if (completed) {
            complete();
          }
        },
      };

      const observer: Observer<I> = {
        next: value => {
          if (hasCurrentSubscription) {
            pendingValues.push(value);
          } else {
            const scanSource = reducer(acc, value);
            hasCurrentSubscription = true;
            unsubscribeCurrent = subscribe(scanSource)(scanObserver);
          }
        },
        error: err => {
          completed = true;
          unsubscribeCurrent();
          error(err);
        },
        complete: () => {
          completed = true;
          if (!hasCurrentSubscription) {
            complete();
          }
        },
      };

      unsubscribe = subscribe(source)(observer);

      return () => {
        unsubscribeCurrent();
        unsubscribe();
      };
    });
  };
}

export default mergeScan;
