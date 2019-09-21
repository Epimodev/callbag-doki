import subscribe from '../utils/subscribe';
import every from './every';
import { intervalValues } from '../test/callbags';

describe('operators/every', () => {
  test('should complete at the end of the source', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = every<number>(() => true)(source);
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
    const transformedSource = every<number>(() => true)(source);
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
    const transformedSource = every<number>(() => true)(source);

    const unsubscribe = subscribe(transformedSource)({});
    unsubscribe();

    expect(cancelMock).toBeCalledTimes(1);
  });

  test('should call predicate for each value received', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const predicate = jest.fn(() => true);
    const transformedSource = every<number>(predicate)(source);

    subscribe(transformedSource)({});

    setTimeout(() => {
      expect(predicate).toBeCalledTimes(values.length);
      expect(predicate).nthCalledWith(1, values[0]);
      expect(predicate).nthCalledWith(2, values[1]);
      expect(predicate).nthCalledWith(3, values[2]);
      expect(predicate).nthCalledWith(4, values[3]);
      expect(predicate).nthCalledWith(5, values[4]);

      done();
    }, 300);
  });

  test("should receive false and cancel source when a value isn't valid with the predicate", done => {
    const values = [5, 8, 3, 6, 2];
    const cancelMock = jest.fn();
    const source = intervalValues({ values, duration: 50, cancelMock });
    const transformedSource = every<number>(() => false)(source);
    const next = jest.fn();
    const complete = jest.fn();

    subscribe(transformedSource)({ next, complete });

    setTimeout(() => {
      expect(cancelMock).toBeCalledTimes(1);
      expect(next).toBeCalledTimes(1);
      expect(next).lastCalledWith(false);
      expect(complete).toBeCalledTimes(1);

      done();
    }, 100);
  });

  test('should receive true when all values are valid with the predicate', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = every<number>(() => true)(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).toBeCalledTimes(1);
      expect(next).lastCalledWith(true);

      done();
    }, 300);
  });
});
