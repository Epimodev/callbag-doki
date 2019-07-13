import { CALLBAG_START, CALLBAG_RECEIVE, CALLBAG_FINISHING, CallbagType, Sink } from '../index';
import { createOperator, CreateOperatorParam } from './';

function tapFunc<I>(func: (value: I) => void): CreateOperatorParam<I, I> {
  return (output: Sink<I>): Sink<I> => (type: CallbagType, payload: any) => {
    switch (type) {
      case CALLBAG_START:
        output(type, payload);
        break;
      case CALLBAG_RECEIVE:
        func(payload);
        output(CALLBAG_RECEIVE, payload);
        break;
      case CALLBAG_FINISHING:
        output(type, payload);
        break;
    }
  };
}

function tap<I>(func: (value: I) => void) {
  return createOperator(tapFunc(func));
}

export default tap;
