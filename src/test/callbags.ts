import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  CallbagType,
  Source,
  Sink,
} from '../index';

interface IntervalValuesParams<T> {
  values: T[];
  duration: number;
  willFail?: boolean;
  failedindex?: number;
  startMock?: jest.Mock;
  nextMock?: jest.Mock;
  completeMock?: jest.Mock;
  errorMock?: jest.Mock;
  cancelMock?: jest.Mock;
}

function intervalValues<T>(params: IntervalValuesParams<T>): Source<T> {
  // @ts-ignore
  return (start: CallbagType, sink: Sink<T>) => {
    if (start === CALLBAG_START) {
      let interval = 0;
      let finished = false;
      let index = 0;
      const failedindex = params.failedindex || 0;
      const talkback = (type: CallbagType) => {
        if (type === CALLBAG_FINISHING && !finished) {
          params.cancelMock && params.cancelMock();
          clearInterval(interval);
        }
      };
      params.startMock && params.startMock();
      sink(CALLBAG_START, talkback);

      interval = setInterval(() => {
        if (params.willFail && failedindex === index) {
          clearInterval(interval);
          finished = true;
          params.errorMock && params.errorMock();
          sink(CALLBAG_FINISHING, 'Error');
        } else {
          params.nextMock && params.nextMock();
          sink(CALLBAG_RECEIVE, params.values[index]);

          index += 1;
          if (params.values[index] === undefined) {
            clearInterval(interval);
            finished = true;
            params.completeMock && params.completeMock();
            sink(CALLBAG_FINISHING);
          }
        }
      }, params.duration);
    }
  };
}

export { intervalValues };
