import subscribe from '../utils/subscribe';
import buffer from './buffer';
import { intervalValues } from '../test/callbags';

const notifValues = [1, 2, 3, 4, 5, 6, 7, 8, 9];

describe('operators/buffer', () => {
  test('should complete and stop notifier at the end of the source', done => {
    const cancelNotifier = jest.fn();
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const closeNofifier = intervalValues({
      values: notifValues,
      duration: 125,
      cancelMock: cancelNotifier,
    });
    const transformedSource = buffer<number>(closeNofifier)(source);
    const complete = jest.fn();

    subscribe(transformedSource)({ complete });

    setTimeout(() => {
      expect(complete).toBeCalledTimes(1);
      expect(cancelNotifier).toBeCalledTimes(1);

      done();
    }, 300);
  });

  test('should failed and stop notifier if source fail', done => {
    const cancelNotifier = jest.fn();
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50, willFail: true });
    const closeNofifier = intervalValues({
      values: notifValues,
      duration: 125,
      cancelMock: cancelNotifier,
    });
    const transformedSource = buffer<number>(closeNofifier)(source);
    const error = jest.fn();

    subscribe(transformedSource)({ error });

    setTimeout(() => {
      expect(error).toBeCalledTimes(1);
      expect(cancelNotifier).toBeCalledTimes(1);

      done();
    }, 100);
  });

  test('should cancel source and stop notifier on unsubscribe', () => {
    const cancelNotifier = jest.fn();
    const cancelMock = jest.fn();
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50, cancelMock });
    const closeNofifier = intervalValues({
      values: notifValues,
      duration: 125,
      cancelMock: cancelNotifier,
    });
    const transformedSource = buffer<number>(closeNofifier)(source);

    const unsubscribe = subscribe(transformedSource)({});
    unsubscribe();

    expect(cancelMock).toBeCalledTimes(1);
    expect(cancelNotifier).toBeCalledTimes(1);
  });

  test('should send buffer of values', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const closeNofifier = intervalValues({
      values: notifValues,
      duration: 115,
    });
    const transformedSource = buffer<number>(closeNofifier)(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).toBeCalledTimes(3);
      expect(next).nthCalledWith(1, [5, 8]);
      expect(next).nthCalledWith(2, [3, 6]);
      expect(next).nthCalledWith(3, [2]);

      done();
    }, 300);
  });
});
