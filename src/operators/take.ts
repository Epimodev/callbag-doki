import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  CallbagType,
  Callbag,
  Sink,
} from '../types';
import { createOperator, CreateOperatorParam } from './';

function takeFunc<T>(max: number): CreateOperatorParam<T, T> {
  let taken = 0;
  let sourceTalkback: Callbag<void, T>;
  let finished = false;
  let outputCalled = false;

  const talkback: Callbag<void, T> = (type: CallbagType, payload: any) => {
    if (type === CALLBAG_FINISHING) {
      finished = true;
    }
    sourceTalkback(type as any, payload);
  };

  return (output: Sink<T>): Sink<T> => (type: CallbagType, payload: any) => {
    switch (type) {
      case CALLBAG_START:
        sourceTalkback = payload;
        output(type, talkback);
        break;
      case CALLBAG_RECEIVE:
        taken += 1;
        output(CALLBAG_RECEIVE, payload);

        if (taken === max && !finished) {
          outputCalled = true;
          output(CALLBAG_FINISHING);
          sourceTalkback(CALLBAG_FINISHING);
        }
        break;
      case CALLBAG_FINISHING:
        if (!outputCalled) {
          output(type, payload);
        }
        break;
    }
  };
}

function take<T>(max: number) {
  return createOperator(takeFunc<T>(max));
}

export { take };
