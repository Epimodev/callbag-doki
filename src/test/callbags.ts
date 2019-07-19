import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  CallbagType,
  Source,
  Sink,
} from '../index';

function delayedValue<T>({
  value,
  duration,
  failed,
}: {
  value: T;
  duration: number;
  failed: boolean;
}): Source<T> {
  // @ts-ignore
  return (start: CallbagType, sink: Sink<T>) => {
    if (start === CALLBAG_START) {
      let finished = false;
      let timeout = 0;
      const talkback = (type: CallbagType) => {
        if (type === CALLBAG_FINISHING && !finished) {
          clearTimeout(timeout);
        }
      };
      sink(CALLBAG_START, talkback);

      timeout = setTimeout(() => {
        finished = true;

        if (failed) {
          sink(CALLBAG_FINISHING, 'Error');
        } else {
          sink(CALLBAG_RECEIVE, value);
          sink(CALLBAG_FINISHING);
        }
      }, duration);
    }
  };
}

export { delayedValue };
