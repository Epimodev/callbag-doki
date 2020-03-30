import subscribe from '../utils/subscribe';
import mergeScan from './mergeScan';
import of from '../sources/of';
import { intervalValues } from '../test/callbags';

describe('operators/mergeScan', () => {
  test('should receive a message for each value from source', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = mergeScan<number, number>(() => of(1), 0)(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).toBeCalledTimes(values.length);

      done();
    }, 300);
  });

  test('should complete at the end of the source from reduce', done => {
    const values = [5, 8];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = mergeScan<number, number>(
      () => intervalValues({ values, duration: 50 }),
      0,
    )(source);
    const complete = jest.fn();

    subscribe(transformedSource)({ complete });

    setTimeout(() => {
      expect(complete).toBeCalledTimes(0);
    }, 200);

    setTimeout(() => {
      expect(complete).toBeCalledTimes(1);

      done();
    }, 300);
  });

  test('should failed if source fail', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50, willFail: true });
    const transformedSource = mergeScan<number, number>(() => of(1), 0)(source);
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
    const transformedSource = mergeScan<number, number>(() => of(1), 0)(source);

    const unsubscribe = subscribe(transformedSource)({});
    unsubscribe();

    expect(cancelMock).toBeCalledTimes(1);
  });

  test('should call reducer function for each value received', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const reduceFunc = jest.fn(() => of(1));
    const transformedSource = mergeScan<number, number>(reduceFunc, 0)(source);

    subscribe(transformedSource)({});

    setTimeout(() => {
      expect(reduceFunc).toBeCalledTimes(values.length);

      done();
    }, 300);
  });

  test('should subscribe to only 1 source from reduce at a time', done => {
    const startMocks = [jest.fn(), jest.fn(), jest.fn()];
    const completeMocks = [jest.fn(), jest.fn(), jest.fn()];
    const values = [0, 1, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = mergeScan<number, number>(
      (acc, value) =>
        intervalValues({
          values,
          duration: 50,
          startMock: startMocks[value],
          completeMock: completeMocks[value],
        }),
      0,
    )(source);

    const unsubscribe = subscribe(transformedSource)({});

    expect(startMocks[0]).toBeCalledTimes(0);
    expect(startMocks[1]).toBeCalledTimes(0);
    expect(startMocks[2]).toBeCalledTimes(0);
    expect(completeMocks[0]).toBeCalledTimes(0);
    expect(completeMocks[1]).toBeCalledTimes(0);
    expect(completeMocks[2]).toBeCalledTimes(0);

    setTimeout(() => {
      // first source from reducer not finished
      expect(startMocks[0]).toBeCalledTimes(1);
      expect(startMocks[1]).toBeCalledTimes(0);
      expect(startMocks[2]).toBeCalledTimes(0);

      expect(completeMocks[0]).toBeCalledTimes(0);
    }, 175);
    setTimeout(() => {
      // first source from reducer finished
      expect(startMocks[0]).toBeCalledTimes(1);
      expect(startMocks[1]).toBeCalledTimes(1);
      expect(startMocks[2]).toBeCalledTimes(0);

      expect(completeMocks[0]).toBeCalledTimes(1);
    }, 225);
    setTimeout(() => {
      // second source from reducer not finished
      expect(startMocks[0]).toBeCalledTimes(1);
      expect(startMocks[1]).toBeCalledTimes(1);
      expect(startMocks[2]).toBeCalledTimes(0);

      expect(completeMocks[1]).toBeCalledTimes(0);
    }, 325);
    setTimeout(() => {
      // second source from reducer finished
      expect(startMocks[0]).toBeCalledTimes(1);
      expect(startMocks[1]).toBeCalledTimes(1);
      expect(startMocks[2]).toBeCalledTimes(1);

      expect(completeMocks[1]).toBeCalledTimes(1);

      unsubscribe();
      done();
    }, 375);
  });

  test('each input should be the sum of previous inputs', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = mergeScan<number, number>((a, v) => of(a + v), 0)(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).nthCalledWith(1, 5);
      expect(next).nthCalledWith(2, 13);
      expect(next).nthCalledWith(3, 16);
      expect(next).nthCalledWith(4, 22);
      expect(next).nthCalledWith(5, 24);

      done();
    }, 300);
  });

  test('should cancel source from reduce function on unsubscribe', done => {
    const initialSourceCancel = jest.fn();
    const reduceSourceCancel = jest.fn();
    const values = [5, 8, 3];
    const source = intervalValues({ values, duration: 50, cancelMock: initialSourceCancel });
    const transformedSource = mergeScan<number, number>(
      () => intervalValues({ values, duration: 50, cancelMock: reduceSourceCancel }),
      0,
    )(source);

    const unsubscribe = subscribe(transformedSource)({});

    setTimeout(() => {
      unsubscribe();

      expect(initialSourceCancel).toBeCalledTimes(1);
      expect(reduceSourceCancel).toBeCalledTimes(1);

      done();
    }, 75);
  });

  test('should cancel source from reduce function when initial source fail', done => {
    const reduceSourceStart = jest.fn();
    const reduceSourceCancel = jest.fn();
    const values = [5, 8, 3];
    const source = intervalValues({ values, duration: 50, willFail: true, failedindex: 1 });
    const transformedSource = mergeScan<number, number>(
      () =>
        intervalValues({
          values,
          duration: 50,
          startMock: reduceSourceStart,
          cancelMock: reduceSourceCancel,
        }),
      0,
    )(source);
    const error = jest.fn();

    subscribe(transformedSource)({ error });

    setTimeout(() => {
      expect(reduceSourceStart).toBeCalledTimes(1);
      expect(reduceSourceCancel).toBeCalledTimes(1);
      expect(error).toBeCalledTimes(1);

      done();
    }, 125);
  });

  test('should fail when source from reduce fail', done => {
    const values = [5, 8, 3];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = mergeScan<number, number>(
      () => intervalValues({ values, duration: 50, willFail: true }),
      0,
    )(source);
    const error = jest.fn();

    subscribe(transformedSource)({ error });

    setTimeout(() => {
      expect(error).toBeCalledTimes(1);

      done();
    }, 125);
  });

  test('should cancel source when source from reduce fail', done => {
    const cancelMock = jest.fn();
    const values = [5, 8, 3];
    const source = intervalValues({ values, duration: 50, cancelMock });
    const transformedSource = mergeScan<number, number>(
      () => intervalValues({ values, duration: 50, willFail: true }),
      0,
    )(source);

    subscribe(transformedSource)({});

    setTimeout(() => {
      expect(cancelMock).toBeCalledTimes(1);

      done();
    }, 125);
  });
});
