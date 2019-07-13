import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  CallbagType,
  Callbag,
  Sink,
} from '../index';
import { createOperator, CreateOperatorParam } from './';

function debounceFunc<I>(duration: number): CreateOperatorParam<I, I> {
  let value: I;
  let timeout = 0;

  return (output: Sink<I>): Sink<I> => (type: CallbagType, payload: any) => {
    switch (type) {
      case CALLBAG_START:
        const talkback: Callbag<void, I> = (t: CallbagType, p: any) => {
          if (t === CALLBAG_FINISHING) {
            clearTimeout(timeout);
          }
          payload(t, p);
        };

        output(type, talkback);
        break;
      case CALLBAG_RECEIVE:
        value = payload;
        clearTimeout(timeout);

        timeout = setTimeout(() => {
          output(CALLBAG_RECEIVE, value);
        }, duration);
        break;
      case CALLBAG_FINISHING:
        output(type, payload);
        break;
    }
  };
}

function debounce<I>(duration: number) {
  return createOperator(debounceFunc<I>(duration));
}

export default debounce;
