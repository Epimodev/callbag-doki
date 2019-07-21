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

function catchErrorFunc<I, O>(handler: (error: any) => Source<O>): CreateOperatorParam<I, I | O> {
  let unsubscribe: () => void;

  return (output: Sink<I | O>): Sink<I> => (type: CallbagType, payload: any) => {
    switch (type) {
      case CALLBAG_START:
        const talkback: Callbag<void, I | O> = (t: CallbagType, p: any) => {
          if (t === CALLBAG_FINISHING && unsubscribe) {
            unsubscribe();
          }
          payload(t, p);
        };

        output(type, talkback);
        break;
      case CALLBAG_RECEIVE:
        output(type, payload);
        break;
      case CALLBAG_FINISHING:
        if (payload) {
          // if there is an error
          const next = (value: O) => output(CALLBAG_RECEIVE, value);
          const error = (error: any) => output(CALLBAG_FINISHING, error);
          const complete = () => output(CALLBAG_FINISHING);

          const source = handler(payload);
          unsubscribe = subscribe(source)({ next, error, complete });
        } else {
          output(type, payload);
        }
        break;
    }
  };
}

function catchError<I, O>(handler: (error: any) => Source<O>) {
  return createOperator(catchErrorFunc<I, O>(handler));
}

export default catchError;
