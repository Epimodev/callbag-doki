import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  CallbagType,
  Callbag,
  Source,
  Sink,
} from '../index';
import subscribe from '../utils/subscribe';
import { createOperator, CreateOperatorParam } from './';

interface FlattenSubscription {
  unsubscribe?: () => void;
}

function flatMapFunc<I, O>(mapper: (value: I) => Source<O>): CreateOperatorParam<I, O> {
  let finished = false;
  const subscriptionList: FlattenSubscription[] = [];

  const cancelSubscriptions = () => {
    for (let i = 0, l = subscriptionList.length; i < l; i += 1) {
      const subscription = subscriptionList[i];
      subscription.unsubscribe && subscription.unsubscribe();
    }
  };

  const removeSubscription = (subscription: FlattenSubscription) => {
    for (let i = 0, l = subscriptionList.length; i < l; i += 1) {
      if (subscriptionList[i] === subscription) {
        subscriptionList.splice(i, 1);
        return;
      }
    }
  };

  return (output: Sink<O>): Sink<I> => (type: CallbagType, payload: any) => {
    switch (type) {
      case CALLBAG_START:
        const talkback: Callbag<void, I | O> = (t: CallbagType, p: any) => {
          if (t === CALLBAG_FINISHING) {
            cancelSubscriptions();
          }
          payload(t, p);
        };

        output(type, talkback);
        break;
      case CALLBAG_RECEIVE:
        if (!finished) {
          // use mutable object which is mutate with `subscribe`
          // to make `unsubscribe` accessible in `error` and `complete` funcs
          const subscription: FlattenSubscription = {};
          subscriptionList.push(subscription);

          const next = (value: O) => output(CALLBAG_RECEIVE, value);
          const error = (error: any) => {
            removeSubscription(subscription);
            cancelSubscriptions();
            output(CALLBAG_FINISHING, error);
          };
          const complete = () => {
            removeSubscription(subscription);
            if (finished && subscriptionList.length === 0) {
              output(CALLBAG_FINISHING);
            }
          };

          const source = mapper(payload);
          subscription.unsubscribe = subscribe(source)({ next, error, complete });
        }
        break;
      case CALLBAG_FINISHING:
        finished = true;
        if (payload) {
          // if there is an error
          cancelSubscriptions();
          output(CALLBAG_FINISHING, payload);
        } else {
          // if source complete without error
          if (subscriptionList.length === 0) {
            output(CALLBAG_FINISHING);
          }
        }
        break;
    }
  };
}

function flatMap<I, O>(mapper: (value: I) => Source<O>) {
  return createOperator(flatMapFunc(mapper));
}

export default flatMap;
