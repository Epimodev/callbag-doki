import { CALLBAG_START, CALLBAG_RECEIVE, CALLBAG_FINISHING, CallbagType, Sink } from '../types';
import { createOperator, CreateOperatorParam } from './';

function takeLastFunc<I>(count = 1): CreateOperatorParam<I, I> {
  const lastValues: I[] = [];

  return (output: Sink<I>): Sink<I> => (type: CallbagType, payload: any) => {
    switch (type) {
      case CALLBAG_START:
        output(type, payload);
        break;
      case CALLBAG_RECEIVE:
        lastValues.push(payload);

        if (lastValues.length > count) {
          lastValues.shift();
        }

        break;
      case CALLBAG_FINISHING:
        for (let i = 0, l = lastValues.length; i < l; i += 1) {
          output(CALLBAG_RECEIVE, lastValues[i]);
        }

        output(type, payload);
        break;
    }
  };
}

function takeLast<I>(count?: number) {
  return createOperator(takeLastFunc<I>(count));
}

export default takeLast;
