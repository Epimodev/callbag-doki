import { CALLBAG_START, CALLBAG_RECEIVE, CALLBAG_FINISHING, CallbagType, Callbag } from '../types';
import { createOperator, CreateOperatorParam } from './';

function maxFunc(): CreateOperatorParam<number, number | undefined> {
  let max: number;

  return (output: Callbag<number | undefined>): Callbag<number> => (
    type: CallbagType,
    payload: any,
  ) => {
    switch (type) {
      case CALLBAG_START:
        output(type, payload);
        break;
      case CALLBAG_RECEIVE:
        if (max === undefined || payload > max) {
          max = payload;
        }
        break;
      case CALLBAG_FINISHING:
        output(CALLBAG_RECEIVE, max);
        output(type, payload);
        break;
    }
  };
}

function max() {
  return createOperator(maxFunc());
}

export { max };
