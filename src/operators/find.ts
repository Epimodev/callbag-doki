import { CALLBAG_START, CALLBAG_RECEIVE, CALLBAG_FINISHING, CallbagType, Sink } from '../types';
import { createOperator, CreateOperatorParam } from './';

function findFunc<I>(func: (value: I) => boolean): CreateOperatorParam<I, I> {
  let finded = false;

  return (output: Sink<I>): Sink<I> => (type: CallbagType, payload: any) => {
    switch (type) {
      case CALLBAG_START:
        output(type, payload);
        break;
      case CALLBAG_RECEIVE:
        if (!finded && func(payload)) {
          finded = true;
          output(CALLBAG_RECEIVE, payload);
        }
        break;
      case CALLBAG_FINISHING:
        output(type, payload);
        break;
    }
  };
}

function find<I>(func: (value: I) => boolean) {
  return createOperator(findFunc(func));
}

export default find;
