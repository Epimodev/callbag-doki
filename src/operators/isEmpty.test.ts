import subscribe from '../utils/subscribe';
import isEmpty from './isEmpty';
import { intervalValues, emptySource } from '../test/callbags';

describe('operators/isEmpty', () => {
  test('should complete at the end of the source', done => {
    const source = emptySource(50);
    const transformedSource = isEmpty<number>()(source);
    const complete = jest.fn();

    subscribe(transformedSource)({ complete });

    setTimeout(() => {
      expect(complete).toBeCalledTimes(1);

      done();
    }, 100);
  });

  test('should failed if source fail', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50, willFail: true });
    const transformedSource = isEmpty<number>()(source);
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
    const transformedSource = isEmpty<number>()(source);

    const unsubscribe = subscribe(transformedSource)({});
    unsubscribe();

    expect(cancelMock).toBeCalledTimes(1);
  });

  test('should unsubscribe source and send false after receive first value', done => {
    const cancelMock = jest.fn();
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50, cancelMock });
    const transformedSource = isEmpty<number>()(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).toBeCalledTimes(1);
      expect(next).lastCalledWith(false);
      expect(cancelMock).toBeCalledTimes(1);

      done();
    }, 100);
  });

  test('should send true when source complete without value', done => {
    const source = emptySource(50);
    const transformedSource = isEmpty<number>()(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).toBeCalledTimes(1);
      expect(next).lastCalledWith(true);

      done();
    }, 100);
  });
});
