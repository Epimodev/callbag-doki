import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  CallbagType,
  Callbag,
  Sink,
} from '../index';
import { createOperator, CreateOperatorParam } from './';

function delayFunc<T>(duration: number): CreateOperatorParam<T, T> {
  const timeouts: number[] = [];

  return (output: Sink<T>): Sink<T> => (type: CallbagType, payload: any) => {
    switch (type) {
      case CALLBAG_START: {
        const talkback: Callbag<void, T> = (t: CallbagType, p: any) => {
          if (t === CALLBAG_FINISHING) {
            for (let i = 0, l = timeouts.length; i < l; i += 1) {
              clearTimeout(timeouts[i]);
            }
          }
          payload(t, p);
        };

        output(type, talkback);
        break;
      }
      case CALLBAG_RECEIVE:
        const timeout = setTimeout(() => {
          output(CALLBAG_RECEIVE, payload);
          const index = timeouts.indexOf(timeout);
          timeouts.splice(index, 1);
        }, duration);
        timeouts.push(timeout);
        break;
      case CALLBAG_FINISHING:
        if (payload) {
          // if there is an error, we clear all timeout
          for (let i = 0, l = timeouts.length; i < l; i += 1) {
            clearTimeout(timeouts[i]);
          }
          output(CALLBAG_FINISHING, payload);
        } else {
          const timeout = setTimeout(() => {
            output(CALLBAG_FINISHING);
            const index = timeouts.indexOf(timeout);
            timeouts.splice(index, 1);
          }, duration);
          timeouts.push(timeout);
        }
        break;
    }
  };
}

function delay<T>(duration: number) {
  return createOperator(delayFunc<T>(duration));
}

export default delay;
