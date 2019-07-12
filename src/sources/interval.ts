import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  CallbagGreets,
  Callbag,
  CallbagType,
} from '../types';

const interval = (duration: number): CallbagGreets<number> => (
  start: CallbagType,
  sink: Callbag<number>,
) => {
  if (start === CALLBAG_START) {
    const talkback = (type: CallbagType) => {
      if (type === CALLBAG_FINISHING) {
        sink(CALLBAG_FINISHING);
        clearInterval(interval);
      }
    };
    sink(CALLBAG_START, talkback);

    let nbInterval = 0;
    const interval = setInterval(() => {
      nbInterval += 1;
      sink(CALLBAG_RECEIVE, nbInterval);
    }, duration);
  }
};

export { interval };
