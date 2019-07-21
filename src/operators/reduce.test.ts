import subscribe from '../utils/subscribe';
import reduce from './reduce';
import { intervalValues } from '../test/callbags';

describe('operators/reduce', () => {
  test('should receive only 1 value', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = reduce<number, number>(() => 0, 0)(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).toBeCalledTimes(1);

      done();
    }, 300);
  });

  test('should complete at the end of the source', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = reduce<number, number>(() => 0, 0)(source);
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
    const transformedSource = reduce<number, number>(() => 0, 0)(source);
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
    const transformedSource = reduce<number, number>(() => 0, 0)(source);

    const unsubscribe = subscribe(transformedSource)({});
    unsubscribe();

    expect(cancelMock).toBeCalledTimes(1);
  });

  test('should call map function for each value received', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const reduceFunc = jest.fn();
    const transformedSource = reduce<number, any>(reduceFunc, 0)(source);

    subscribe(transformedSource)({});

    setTimeout(() => {
      expect(reduceFunc).toBeCalledTimes(values.length);

      done();
    }, 300);
  });

  test('should receive the sum of inputs', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = reduce<number, number>((a, v) => a + v, 0)(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).lastCalledWith(24);

      done();
    }, 300);
  });
});
