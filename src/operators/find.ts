import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  CallbagType,
  Callbag,
  Sink,
} from '../index';
import { createOperator, CreateOperatorParam } from './';

function findFunc<I>(func: (value: I) => boolean): CreateOperatorParam<I, I> {
  let finded = false;
  let sourceTalkback: Callbag<void, I>;

  return (output: Sink<I>): Sink<I> => (type: CallbagType, payload: any) => {
    switch (type) {
      case CALLBAG_START:
        sourceTalkback = payload;
        output(type, payload);
        break;
      case CALLBAG_RECEIVE:
        if (!finded && func(payload)) {
          finded = true;
          output(CALLBAG_RECEIVE, payload);
          output(CALLBAG_FINISHING);
          sourceTalkback(CALLBAG_FINISHING);
        }
        break;
      case CALLBAG_FINISHING:
        if (!finded) {
          output(type, payload);
        }
        break;
    }
  };
}

function find<I>(func: (value: I) => boolean) {
  return createOperator(findFunc(func));
}

export default find;
