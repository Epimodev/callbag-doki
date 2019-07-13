import { CALLBAG_START, CALLBAG_RECEIVE, CALLBAG_FINISHING, CallbagType, Sink } from '../types';
import { createOperator, CreateOperatorParam } from './';

function mapFunc<I, O>(mapper: (value: I) => O): CreateOperatorParam<I, O> {
  return (output: Sink<O>): Sink<I> => (type: CallbagType, payload: any) => {
    switch (type) {
      case CALLBAG_START:
        output(type, payload);
        break;
      case CALLBAG_RECEIVE:
        output(CALLBAG_RECEIVE, mapper(payload));
        break;
      case CALLBAG_FINISHING:
        output(type, payload);
        break;
    }
  };
}

function map<I, O>(mapper: (value: I) => O) {
  return createOperator(mapFunc(mapper));
}

export default map;
