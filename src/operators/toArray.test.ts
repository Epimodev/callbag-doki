import subscribe from '../utils/subscribe';
import toArray from './toArray';
import { intervalValues } from '../test/callbags';

describe('operators/toArray', () => {
  test('should complete at the end of the source', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = toArray<number>()(source);
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
    const transformedSource = toArray<number>()(source);
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
    const transformedSource = toArray<number>()(source);

    const unsubscribe = subscribe(transformedSource)({});
    unsubscribe();

    expect(cancelMock).toBeCalledTimes(1);
  });

  test('should receive a message with all values on complete', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = toArray<number>()(source);
    const next = jest.fn();
    const complete = jest.fn();

    subscribe(transformedSource)({ next, complete });

    setTimeout(() => {
      expect(complete).toBeCalledTimes(1);
      expect(next).toBeCalledTimes(1);
      expect(next).lastCalledWith(values);

      done();
    }, 300);
  });
});
