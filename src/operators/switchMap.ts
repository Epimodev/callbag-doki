import { Source, Operator, Unsubscribe, Observer } from '../index';
import subscribe from '../utils/subscribe';
import { createOperator } from './';

function switchMap<I, O>(mapper: (value: I) => Source<O>): Operator<I, O> {
  return createOperator((observer, unsubscribe) => {
    let hasCurrentSubscription = false;
    let completed = false;
    let finished = false;
    let unsubscribePrevious: Unsubscribe = () => {};

    const mappedObserver: Observer<O> = {
      next: observer.next,
      error: (err: any) => {
        hasCurrentSubscription = false;
        finished = true;
        observer.error(err);
        unsubscribe();
      },
      complete: () => {
        hasCurrentSubscription = false;
        if (completed && !finished) {
          finished = true;
          observer.complete();
        }
      },
    };

    return {
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
        observer.error(err);
      },
      complete: () => {
        completed = true;
        if (!hasCurrentSubscription && !finished) {
          finished = true;
          observer.complete();
        }
      },
      clear: () => {
        unsubscribePrevious();
      },
    };
  });
}

export default switchMap;
