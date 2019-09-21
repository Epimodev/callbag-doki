import subscribe from '../utils/subscribe';
import bufferTime from './bufferTime';
import { intervalValues } from '../test/callbags';

describe('operators/bufferTime', () => {
  test('should complete at the end of the source', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = bufferTime<number>(115)(source);
    const complete = jest.fn();

    subscribe(transformedSource)({ complete });

    setTimeout(() => {
      expect(complete).toBeCalledTimes(1);

      done();
    }, 300);
  });

  test('should failed if source fail', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50, willFail: true });
    const transformedSource = bufferTime<number>(115)(source);
    const error = jest.fn();

    subscribe(transformedSource)({ error });

    setTimeout(() => {
      expect(error).toBeCalledTimes(1);

      done();
    }, 100);
  });

  test('should cancel source on unsubscribe', () => {
    const cancelMock = jest.fn();
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50, cancelMock });
    const transformedSource = bufferTime<number>(115)(source);

    const unsubscribe = subscribe(transformedSource)({});
    unsubscribe();

    expect(cancelMock).toBeCalledTimes(1);
  });

  test('should send buffer of values', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = bufferTime<number>(115)(source);
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
