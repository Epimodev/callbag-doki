import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  CallbagGreets,
  CallbagType,
  Callbag,
} from '../types';

const of = <T>(...values: T[]): CallbagGreets<T> => (start: CallbagType, sink: Callbag<T>) => {
  if (start === CALLBAG_START) {
    let finished = false;
    const talkback = (type: CallbagType) => {
      if (type === CALLBAG_FINISHING) {
        finished = true;
      }
    };
    sink(CALLBAG_START, talkback);

    for (let i = 0, l = values.length; i < l && !finished; i += 1) {
      sink(CALLBAG_RECEIVE, values[i]);
    }

    sink(CALLBAG_FINISHING);
  }
};

export { of };
