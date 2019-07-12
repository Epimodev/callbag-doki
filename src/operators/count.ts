import { CALLBAG_START, CALLBAG_RECEIVE, CALLBAG_FINISHING, CallbagType, Callbag } from '../types';
import { createOperator, CreateOperatorParam } from './';

function countFunc<I>(): CreateOperatorParam<I, number> {
  let count = 0;

  return (output: Callbag<number>): Callbag<I> => (type: CallbagType, payload: any) => {
    switch (type) {
      case CALLBAG_START:
        output(type, payload);
        break;
      case CALLBAG_RECEIVE:
        count += 1;
        output(CALLBAG_RECEIVE, count);
        break;
      case CALLBAG_FINISHING:
        output(type, payload);
        break;
    }
  };
}

function count<I>() {
  return createOperator(countFunc<I>());
}

export { count };
