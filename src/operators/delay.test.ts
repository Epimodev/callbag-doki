import subscribe from '../utils/subscribe';
import delay from './delay';
import { intervalValues } from '../test/callbags';

describe('operators/delay', () => {
  test('should receive a message for each value from source', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = delay<number>(50)(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).toBeCalledTimes(values.length);

      done();
    }, 350);
  });

  test('should complete at the end of the source', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = delay<number>(50)(source);
    const complete = jest.fn();

    subscribe(transformedSource)({ complete });

    setTimeout(() => {
      expect(complete).toBeCalledTimes(1);

      done();
    }, 350);
  });

  test('should failed if source fail', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50, willFail: true });
    const transformedSource = delay<number>(50)(source);
    const error = jest.fn();

    subscribe(transformedSource)({ error });

    setTimeout(() => {
      expect(error).toBeCalledTimes(1);

      done();
    }, 150);
  });

  test('should cancel source on unsubscribe', () => {
    const cancelMock = jest.fn();
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50, cancelMock });
    const transformedSource = delay<number>(50)(source);

    const unsubscribe = subscribe(transformedSource)({});
    unsubscribe();

    expect(cancelMock).toBeCalledTimes(1);
  });

  test('should delay each input', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = delay<number>(50)(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).toBeCalledTimes(0);
    }, 75);
    setTimeout(() => {
      expect(next).toBeCalledTimes(1);
    }, 125);
    setTimeout(() => {
      expect(next).toBeCalledTimes(2);
    }, 175);
    setTimeout(() => {
      expect(next).toBeCalledTimes(3);
    }, 225);
    setTimeout(() => {
      expect(next).toBeCalledTimes(4);
    }, 275);
    setTimeout(() => {
      expect(next).toBeCalledTimes(5);

      done();
    }, 325);
  });

  test('should delay complete', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = delay<number>(50)(source);
    const complete = jest.fn();

    subscribe(transformedSource)({ complete });

    setTimeout(() => {
      expect(complete).toBeCalledTimes(0);
    }, 275);

    setTimeout(() => {
      expect(complete).toBeCalledTimes(1);

      done();
    }, 325);
  });

  test('each output should be equals with input', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = delay<number>(50)(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).nthCalledWith(1, values[0]);
      expect(next).nthCalledWith(2, values[1]);
      expect(next).nthCalledWith(3, values[2]);
      expect(next).nthCalledWith(4, values[3]);
      expect(next).nthCalledWith(5, values[4]);

      done();
    }, 350);
  });
});
