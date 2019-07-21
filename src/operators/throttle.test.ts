import subscribe from '../utils/subscribe';
import throttle from './throttle';
import { intervalValues } from '../test/callbags';

describe('operators/throttle', () => {
  test('should complete at the end of the source', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = throttle<number>(300)(source);
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
    const transformedSource = throttle<number>(300)(source);
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
    const transformedSource = throttle<number>(300)(source);

    const unsubscribe = subscribe(transformedSource)({});
    unsubscribe();

    expect(cancelMock).toBeCalledTimes(1);
  });

  test('should receive first source value when leading is true', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = throttle<number>(150, { leading: true, trailing: false })(source);
    const next = jest.fn();

    const unsubscribe = subscribe(transformedSource)({ next });

    setTimeout(() => {
      unsubscribe();
      expect(next).toBeCalled();
      expect(next).nthCalledWith(1, values[0]);

      done();
    }, 500);
  });

  test("shouldn't receive first source value when leading is false", done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = throttle<number>(150, { leading: false, trailing: true })(source);
    const next = jest.fn();

    const unsubscribe = subscribe(transformedSource)({ next });

    setTimeout(() => {
      unsubscribe();
      expect(next).toBeCalled();
      expect(next).not.nthCalledWith(1, values[0]);

      done();
    }, 500);
  });

  test('should receive last source value when trailing is true', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = throttle<number>(85, { leading: false, trailing: true })(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).toBeCalled();
      // last call with second to last because next isn't called after complete
      expect(next).lastCalledWith(values[3]);

      done();
    }, 500);
  });

  test("shouldn't receive last source value when trailing is false", done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = throttle<number>(85, { leading: true, trailing: false })(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).toBeCalled();
      expect(next).not.lastCalledWith(values[3]);

      done();
    }, 500);
  });

  test("shouldn't receive a value after input complete", done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = throttle<number>(85, { leading: false, trailing: true })(source);
    const next = jest.fn();
    const complete = jest.fn();

    subscribe(transformedSource)({ next, complete });

    setTimeout(() => {
      expect(complete).toBeCalled();
      expect(next).toBeCalledTimes(2);
      expect(next).nthCalledWith(1, 8);
      expect(next).nthCalledWith(2, 6);
    }, 350);

    setTimeout(() => {
      expect(next).toBeCalledTimes(2);

      done();
    }, 500);
  });
});
