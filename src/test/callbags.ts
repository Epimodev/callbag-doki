import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  CallbagType,
  Source,
  Sink,
} from '../index';

interface TimeoutValueParams<T> {
  value: T;
  delay: number;
  willFail: boolean;
  startMock?: jest.Mock;
  nextMock?: jest.Mock;
  completeMock?: jest.Mock;
  errorMock?: jest.Mock;
  cancelMock?: jest.Mock;
}

function timeoutValue<T>(params: TimeoutValueParams<T>): Source<T> {
  // @ts-ignore
  return (start: CallbagType, sink: Sink<T>) => {
    if (start === CALLBAG_START) {
      let finished = false;
      let timeout = 0;
      const talkback = (type: CallbagType) => {
        if (type === CALLBAG_FINISHING && !finished) {
          params.cancelMock && params.cancelMock();
          clearTimeout(timeout);
        }
      };
      params.startMock && params.startMock();
      sink(CALLBAG_START, talkback);

      timeout = setTimeout(() => {
        finished = true;

        if (params.willFail) {
          params.errorMock && params.errorMock();
          sink(CALLBAG_FINISHING, 'Error');
        } else {
          params.nextMock && params.nextMock();
          sink(CALLBAG_RECEIVE, params.value);
          params.completeMock && params.completeMock();
          sink(CALLBAG_FINISHING);
        }
      }, params.delay);
    }
  };
}

interface IntervalValueParams<T> {
  value: T;
  duration: number;
  startMock?: jest.Mock;
  nextMock?: jest.Mock;
  cancelMock?: jest.Mock;
}

function intervalValue<T>(params: IntervalValueParams<T>): Source<T> {
  // @ts-ignore
  return (start: CallbagType, sink: Sink<T>) => {
    if (start === CALLBAG_START) {
      let interval = 0;
      const talkback = (type: CallbagType) => {
        if (type === CALLBAG_FINISHING) {
          params.cancelMock && params.cancelMock();
          clearInterval(interval);
        }
      };
      params.startMock && params.startMock();
      sink(CALLBAG_START, talkback);

      interval = setInterval(() => {
        params.nextMock && params.nextMock();
        sink(CALLBAG_RECEIVE, params.value);
      }, params.duration);
    }
  };
}

export { timeoutValue, intervalValue };
