import subscribe from '../utils/subscribe';
import first from './first';
import { intervalValues, emptySource } from '../test/callbags';

describe('operators/first', () => {
  test('should failed if source fail', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50, willFail: true });
    const transformedSource = first<number, number>(() => false)(source);
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
    const transformedSource = first<number, number>(() => false)(source);

    const unsubscribe = subscribe(transformedSource)({});
    unsubscribe();

    expect(cancelMock).toBeCalledTimes(1);
  });

  test('should failed if source complete without sending any value', done => {
    const source = emptySource(50);
    const transformedSource = first<number, number>()(source);
    const error = jest.fn();

    subscribe(transformedSource)({ error });

    setTimeout(() => {
      expect(error).toBeCalledTimes(1);

      done();
    }, 100);
  });

  test('should failed if source complete without any input matching with predicate', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = first<number, number>(() => false)(source);
    const error = jest.fn();

    subscribe(transformedSource)({ error });

    setTimeout(() => {
      expect(error).toBeCalledTimes(1);

      done();
    }, 300);
  });

  test('should send default value if source complete without sending any value', done => {
    const defaultValue = 10;
    const source = emptySource(50);
    const transformedSource = first<number, number>(null, defaultValue)(source);
    const next = jest.fn();
    const complete = jest.fn();

    subscribe(transformedSource)({ next, complete });

    setTimeout(() => {
      expect(next).toBeCalledTimes(1);
      expect(next).lastCalledWith(defaultValue);
      expect(complete).toBeCalledTimes(1);

      done();
    }, 100);
  });

  test('should send default value if source complete without any input matching with predicate', done => {
    const defaultValue = 10;
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = first<number, number>(() => false, defaultValue)(source);
    const next = jest.fn();
    const complete = jest.fn();

    subscribe(transformedSource)({ next, complete });

    setTimeout(() => {
      expect(next).toBeCalledTimes(1);
      expect(next).lastCalledWith(defaultValue);
      expect(complete).toBeCalledTimes(1);

      done();
    }, 300);
  });

  test('should send first value', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = first<number, number>()(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).toBeCalledTimes(1);
      expect(next).lastCalledWith(5);

      done();
    }, 300);
  });

  test('should send first matching value', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = first<number, number>(v => v % 2 === 0)(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).toBeCalledTimes(1);
      expect(next).lastCalledWith(8);

      done();
    }, 300);
  });

  test('should complete after first value', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = first<number, number>()(source);
    const complete = jest.fn();

    subscribe(transformedSource)({ complete });

    setTimeout(() => {
      expect(complete).toBeCalledTimes(1);

      done();
    }, 100);
  });

  test('should complete when value is finded', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = first<number, number>(v => v % 2 === 0)(source);
    const complete = jest.fn();

    subscribe(transformedSource)({ complete });

    setTimeout(() => {
      expect(complete).toBeCalledTimes(1);

      done();
    }, 140);
  });

  test('should cancel source after first value', done => {
    const cancelMock = jest.fn();
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50, cancelMock });
    const transformedSource = first<number, number>()(source);

    subscribe(transformedSource)({});

    setTimeout(() => {
      expect(cancelMock).toBeCalledTimes(1);

      done();
    }, 100);
  });

  test('should cancel source when value is finded', done => {
    const cancelMock = jest.fn();
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50, cancelMock });
    const transformedSource = first<number, number>(v => v % 2 === 0)(source);

    subscribe(transformedSource)({});

    setTimeout(() => {
      expect(cancelMock).toBeCalledTimes(1);

      done();
    }, 140);
  });
});
