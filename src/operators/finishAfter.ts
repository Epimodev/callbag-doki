import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  CallbagType,
  Callbag,
  Sink,
} from '../types';
import { createOperator, CreateOperatorParam } from './';

function finishAfterFunc<T>(duration: number): CreateOperatorParam<T, T> {
  let timeout = 0;
  let finished = false;

  return (output: Sink<T>): Sink<T> => (type: CallbagType, payload: any) => {
    switch (type) {
      case CALLBAG_START:
        const talkback: Callbag<void, T> = (t: CallbagType, p: any) => {
          if (t === CALLBAG_FINISHING) {
            clearTimeout(timeout);
          }
          payload(t, p);
        };

        timeout = setTimeout(() => {
          finished = true;
          output(CALLBAG_FINISHING);
          payload(CALLBAG_FINISHING);
        }, duration);

        output(type, talkback);
        break;
      case CALLBAG_RECEIVE:
        output(type, payload);
        break;
      case CALLBAG_FINISHING:
        if (!finished) {
          finished = true;
          output(type, payload);
        }
        break;
    }
  };
}

function finishAfter<T>(duration: number) {
  return createOperator(finishAfterFunc<T>(duration));
}

export { finishAfter };
