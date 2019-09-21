import subscribe from '../utils/subscribe';
import throwIfEmpty from './throwIfEmpty';
import { intervalValues, emptySource } from '../test/callbags';

describe('operators/throwIfEmpty', () => {
  test('should receive a message for each value from source', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = throwIfEmpty<number>(() => 'Empty Error')(source);
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
    const transformedSource = throwIfEmpty<number>(() => 'Empty Error')(source);
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
    const transformedSource = throwIfEmpty<number>(() => 'Empty Error')(source);
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
    const transformedSource = throwIfEmpty<number>(() => 'Empty Error')(source);

    const unsubscribe = subscribe(transformedSource)({});
    unsubscribe();

    expect(cancelMock).toBeCalledTimes(1);
  });

  test('each output should be equals with input', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = throwIfEmpty<number>(() => 'Empty Error')(source);
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

  test('should call error factory and failed if source complete without value', done => {
    const source = emptySource(50);
    const errorFactory = jest.fn(() => 'Empty Error');
    const transformedSource = throwIfEmpty<number>(errorFactory)(source);
    const next = jest.fn();
    const error = jest.fn();

    subscribe(transformedSource)({ next, error });

    setTimeout(() => {
      expect(next).toBeCalledTimes(0);
      expect(errorFactory).toBeCalledTimes(1);
      expect(error).toBeCalledTimes(1);
      expect(error).lastCalledWith('Empty Error');

      done();
    }, 100);
  });
});
