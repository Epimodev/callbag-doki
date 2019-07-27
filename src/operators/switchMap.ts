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

function switchMapFunc<I, O>(mapper: (value: I) => Source<O>): CreateOperatorParam<I, O> {
  let hasCurrentSubscription = false;
  let completed = false;
  let finished = false;
  let sourceTalkback: Callbag<void, I>;
  let unsubscribePrevious: () => void = () => {};

  return (output: Sink<O>): Sink<I> => (type: CallbagType, payload: any) => {
    switch (type) {
      case CALLBAG_START:
        sourceTalkback = payload;
        const talkback: Callbag<void, I | O> = (t: CallbagType, p: any) => {
          if (t === CALLBAG_FINISHING) {
            unsubscribePrevious();
          }
          sourceTalkback(t as any, p);
        };

        output(type, talkback);
        break;
      case CALLBAG_RECEIVE:
        unsubscribePrevious();
        hasCurrentSubscription = true;

        const next = (value: O) => output(CALLBAG_RECEIVE, value);
        const error = (error: any) => {
          hasCurrentSubscription = false;
          finished = true;
          output(CALLBAG_FINISHING, error);
          sourceTalkback(CALLBAG_FINISHING, error);
        };
        const complete = () => {
          hasCurrentSubscription = false;
          if (completed && !finished) {
            finished = true;
            output(CALLBAG_FINISHING);
          }
        };

        const source = mapper(payload);
        unsubscribePrevious = subscribe(source)({ next, error, complete });
        break;
      case CALLBAG_FINISHING:
        completed = true;

        if (payload) {
          // if there is an error
          unsubscribePrevious();
          finished = true;
          output(CALLBAG_FINISHING, payload);
        } else {
          // if source complete without error
          if (!hasCurrentSubscription && !finished) {
            finished = true;
            output(CALLBAG_FINISHING);
          }
        }

        break;
    }
  };
}

function switchMap<I, O>(mapper: (value: I) => Source<O>) {
  return createOperator(switchMapFunc(mapper));
}

export default switchMap;
