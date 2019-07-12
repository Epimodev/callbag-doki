import { CALLBAG_START, CALLBAG_RECEIVE, CALLBAG_FINISHING, CallbagType, Callbag } from '../types';
import { createOperator, CreateOperatorParam } from './';

type Reduce<I, O> = (acc: O, value: I) => O;

function scanFunc<I, O>(reduce: Reduce<I, O>, seed: O): CreateOperatorParam<I, O> {
  let acc = seed;

  return (output: Callbag<O>): Callbag<I> => (type: CallbagType, payload: any) => {
    switch (type) {
      case CALLBAG_START:
        output(type, payload);
        break;
      case CALLBAG_RECEIVE:
        acc = reduce(acc, payload);
        output(CALLBAG_RECEIVE, acc);
        break;
      case CALLBAG_FINISHING:
        output(type, payload);
        break;
    }
  };
}

function scan<I, O>(reduce: Reduce<I, O>, seed: O) {
  return createOperator(scanFunc(reduce, seed));
}

export { scan };
