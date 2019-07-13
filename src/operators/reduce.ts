import { CALLBAG_START, CALLBAG_RECEIVE, CALLBAG_FINISHING, CallbagType, Sink } from '../index';
import { createOperator, CreateOperatorParam } from './';

type Reduce<I, O> = (acc: O, value: I) => O;

function reduceFunc<I, O>(reduce: Reduce<I, O>, seed: O): CreateOperatorParam<I, O> {
  let acc = seed;

  return (output: Sink<O>): Sink<I> => (type: CallbagType, payload: any) => {
    switch (type) {
      case CALLBAG_START:
        output(type, payload);
        break;
      case CALLBAG_RECEIVE:
        acc = reduce(acc, payload);
        break;
      case CALLBAG_FINISHING:
        output(CALLBAG_RECEIVE, acc);
        output(type, payload);
        break;
    }
  };
}

function reduce<I, O>(reduce: Reduce<I, O>, seed: O) {
  return createOperator(reduceFunc(reduce, seed));
}

export default reduce;
