import { CALLBAG_START, CALLBAG_RECEIVE, CALLBAG_FINISHING, CallbagType, Callbag } from '../types';
import { createOperator, CreateOperatorParam } from './';

function delayFunc<T>(duration: number): CreateOperatorParam<T, T> {
  const timeouts: number[] = [];

  return (output: Callbag<T>): Callbag<T> => (type: CallbagType, payload: any) => {
    switch (type) {
      case CALLBAG_START: {
        const talkback = (t: CallbagType, p: any) => {
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
        output(type, payload);
        break;
    }
  };
}

function delay<T>(duration: number) {
  return createOperator(delayFunc<T>(duration));
}

export { delay };
