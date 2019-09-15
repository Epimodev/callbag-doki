import subscribe from '../utils/subscribe';
import repeat from './repeat';
import { intervalValues } from '../test/callbags';

describe('operators/tap', () => {
  test('should receive a message for each value from source', done => {
    const values = [5, 8, 3];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = repeat<number>(1)(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).toBeCalledTimes(values.length);

      done();
    }, 175);
  });

  test('should failed if source fail', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50, willFail: true });
    const transformedSource = repeat<number>(1)(source);
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
    const transformedSource = repeat<number>(1)(source);

    const unsubscribe = subscribe(transformedSource)({});
    unsubscribe();

    expect(cancelMock).toBeCalledTimes(1);
  });

  test('each output should be equals with input', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = repeat<number>(1)(source);
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

  test('should repeat source 3 times', done => {
    const values = [5, 8];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = repeat<number>(3)(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).nthCalledWith(1, values[0]);
      expect(next).nthCalledWith(2, values[1]);
      expect(next).nthCalledWith(3, values[0]);
      expect(next).nthCalledWith(4, values[1]);
      expect(next).nthCalledWith(5, values[0]);
      expect(next).nthCalledWith(6, values[1]);

      done();
    }, 325);
  });

  test('should complete after 3 repeats', done => {
    const values = [5, 8];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = repeat<number>(3)(source);
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
});
