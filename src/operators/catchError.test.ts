import subscribe from '../utils/subscribe';
import catchError from './catchError';
import of from '../sources/of';
import { intervalValues } from '../test/callbags';

describe('operators/catchError', () => {
  test('should receive a message for each value from source', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = catchError<number, string>(() => of('Error'))(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).toBeCalledTimes(values.length);

      done();
    }, 300);
  });

  test('should complete at the end of the source', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = catchError<number, string>(() => of('Error'))(source);
    const complete = jest.fn();

    subscribe(transformedSource)({ complete });

    setTimeout(() => {
      expect(complete).toBeCalledTimes(1);

      done();
    }, 300);
  });

  test('should cancel source on unsubscribe', () => {
    const cancelMock = jest.fn();
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50, cancelMock });
    const transformedSource = catchError<number, string>(() => of('Error'))(source);

    const unsubscribe = subscribe(transformedSource)({});
    unsubscribe();

    expect(cancelMock).toBeCalledTimes(1);
  });

  test('should call handler when source fail', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50, willFail: true });
    const handler = jest.fn(() => of('Error'));
    const transformedSource = catchError<number, any>(handler)(source);

    subscribe(transformedSource)({});

    setTimeout(() => {
      expect(handler).toBeCalledTimes(1);

      done();
    }, 100);
  });

  test("each output should be equals with input when source does'nt fail", done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = catchError<number, string>(() => of('Error'))(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).nthCalledWith(1, values[0]);
      expect(next).nthCalledWith(2, values[1]);
      expect(next).nthCalledWith(3, values[2]);
      expect(next).nthCalledWith(4, values[3]);
      expect(next).nthCalledWith(5, values[4]);

      done();
    }, 300);
  });

  test('output should be equals with value returned by handler when source fail', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50, willFail: true });
    const transformedSource = catchError<number, string>(() => of('Error'))(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).nthCalledWith(1, 'Error');

      done();
    }, 100);
  });

  test('should be complete when error handler is complete', done => {
    const values = [5, 8, 3, 6, 2];
    const handlerSource = intervalValues({ values: ['Error'], duration: 50 });
    const source = intervalValues({ values, duration: 50, willFail: true });
    const transformedSource = catchError<number, string>(() => handlerSource)(source);
    const complete = jest.fn();

    subscribe(transformedSource)({ complete });

    setTimeout(() => {
      expect(complete).toBeCalledTimes(1);

      done();
    }, 120);
  });

  test('should unsubscribe error handler when we unsubscribe from source', done => {
    const cancelErrorMock = jest.fn();
    const values = [5, 8, 3, 6, 2];
    const handlerSource = intervalValues({
      values: ['Error1', 'Error2', 'Error3'],
      duration: 50,
      cancelMock: cancelErrorMock,
    });
    const source = intervalValues({ values, duration: 50, willFail: true });
    const transformedSource = catchError<number, string>(() => handlerSource)(source);
    const complete = jest.fn();

    const unsubscribe = subscribe(transformedSource)({ complete });

    setTimeout(() => {
      unsubscribe();

      expect(cancelErrorMock).toBeCalledTimes(1);

      done();
    }, 120);
  });
});
