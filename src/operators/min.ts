import { CALLBAG_START, CALLBAG_RECEIVE, CALLBAG_FINISHING, CallbagType, Callbag } from '../types';
import { createOperator, CreateOperatorParam } from './';

function minFunc(): CreateOperatorParam<number, number | undefined> {
  let min: number;

  return (output: Callbag<number | undefined>): Callbag<number> => (
    type: CallbagType,
    payload: any,
  ) => {
    switch (type) {
      case CALLBAG_START:
        output(type, payload);
        break;
      case CALLBAG_RECEIVE:
        if (min === undefined || payload < min) {
          min = payload;
        }
        break;
      case CALLBAG_FINISHING:
        output(CALLBAG_RECEIVE, min);
        output(type, payload);
        break;
    }
  };
}

function min() {
  return createOperator(minFunc());
}

export { min };
