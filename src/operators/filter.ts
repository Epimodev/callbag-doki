import { CALLBAG_START, CALLBAG_RECEIVE, CALLBAG_FINISHING, CallbagType, Sink } from '../index';
import { createOperator, CreateOperatorParam } from './';

function filterFunc<T>(predicate: (value: T) => boolean): CreateOperatorParam<T, T> {
  return (output: Sink<T>): Sink<T> => (type: CallbagType, payload: any) => {
    switch (type) {
      case CALLBAG_START:
        output(type, payload);
        break;
      case CALLBAG_RECEIVE:
        if (predicate(payload)) {
          output(CALLBAG_RECEIVE, payload);
        }
        break;
      case CALLBAG_FINISHING:
        output(type, payload);
        break;
    }
  };
}

function filter<T>(predicate: (value: T) => boolean) {
  return createOperator(filterFunc(predicate));
}

export default filter;
