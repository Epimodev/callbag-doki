import { Source, Operator, Observer } from '../index';
import subscribe from '../utils/subscribe';
import { createOperator } from './';

interface MappedSubscription {
  unsubscribe?: () => void;
}

function flatMap<I, O>(mapper: (value: I) => Source<O>): Operator<I, O> {
  return createOperator((observer, unsubscribe) => {
    let finished = false;
    const subscriptionList: MappedSubscription[] = [];

    const cancelSubscriptions = () => {
      for (let i = 0, l = subscriptionList.length; i < l; i += 1) {
        const subscription = subscriptionList[i];
        subscription.unsubscribe && subscription.unsubscribe();
      }
    };

    const removeSubscription = (subscription: MappedSubscription) => {
      for (let i = 0, l = subscriptionList.length; i < l; i += 1) {
        if (subscriptionList[i] === subscription) {
          subscriptionList.splice(i, 1);
          return;
        }
      }
    };

    return {
      next: value => {
        if (!finished) {
          // use mutable object which is mutate with `subscribe`
          // to make `unsubscribe` accessible in `error` and `complete` funcs
          const subscription: MappedSubscription = {};
          subscriptionList.push(subscription);

          const mappedObserver: Observer<O> = {
            next: observer.next,
            error: err => {
              removeSubscription(subscription);
              cancelSubscriptions();
              observer.error(err);
              unsubscribe();
            },
            complete: () => {
              removeSubscription(subscription);
              if (finished && subscriptionList.length === 0) {
                observer.complete();
              }
            },
          };

          const source = mapper(value);
          subscription.unsubscribe = subscribe(source)(mappedObserver);
        }
      },
      error: err => {
        finished = true;

        cancelSubscriptions();
        observer.error(err);
      },
      complete: () => {
        finished = true;

        if (subscriptionList.length === 0) {
          observer.complete();
        }
      },
      clear: cancelSubscriptions,
    };
  });
}

export default flatMap;
