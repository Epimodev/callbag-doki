import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  CallbagType,
  Source,
  Sink,
} from '../index';

function interval(duration: number): Source<number> {
  // @ts-ignore
  return (start: CallbagType, sink: Sink<number>) => {
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
}

export default interval;
