import subscribe from '../utils/subscribe';
import flatMap from './flatMap';
import of from '../sources/of';
import { intervalValues } from '../test/callbags';

describe('operators/flatMap', () => {
  test('should complete at the end of the source', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = flatMap<number, number>(() => of(1))(source);
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
    const transformedSource = flatMap<number, number>(() => of(1))(source);
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
    const transformedSource = flatMap<number, number>(() => of(1))(source);

    const unsubscribe = subscribe(transformedSource)({});
    unsubscribe();

    expect(cancelMock).toBeCalledTimes(1);
  });

  test('should call mapper function for each value received', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const mapFunc = jest.fn(() => of(1));
    const transformedSource = flatMap<number, number>(mapFunc)(source);

    subscribe(transformedSource)({});

    setTimeout(() => {
      expect(mapFunc).toBeCalledTimes(values.length);

      done();
    }, 300);
  });

  test('should complete at the end of the source', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = flatMap<number, number>(() => of(1))(source);
    const complete = jest.fn();

    subscribe(transformedSource)({ complete });

    setTimeout(() => {
      expect(complete).toBeCalledTimes(1);

      done();
    }, 300);
  });

  test('should complete when source from map function are completed', done => {
    const initialSourceComplete = jest.fn();
    const values = [5, 8, 3];
    const source = intervalValues({ values, duration: 50, completeMock: initialSourceComplete });
    const transformedSource = flatMap<number, number>(() =>
      intervalValues({ values, duration: 50 }),
    )(source);
    const complete = jest.fn();

    subscribe(transformedSource)({ complete });

    setTimeout(() => {
      // only initial source is complete
      expect(initialSourceComplete).toBeCalledTimes(1);
      expect(complete).toBeCalledTimes(0);
    }, 200);

    setTimeout(() => {
      expect(initialSourceComplete).toBeCalledTimes(1);
      expect(complete).toBeCalledTimes(1);

      done();
    }, 400);
  });

  test('should cancel source from map function on unsubscribe', done => {
    const initialSourceCancel = jest.fn();
    const mapSourceCancel = jest.fn();
    const values = [5, 8, 3];
    const source = intervalValues({ values, duration: 50, cancelMock: initialSourceCancel });
    const transformedSource = flatMap<number, number>(() =>
      intervalValues({ values, duration: 50, cancelMock: mapSourceCancel }),
    )(source);

    const unsubscribe = subscribe(transformedSource)({});

    setTimeout(() => {
      unsubscribe();

      expect(initialSourceCancel).toBeCalledTimes(1);
      expect(mapSourceCancel).toBeCalledTimes(2);

      done();
    }, 125);
  });

  test('should cancel sources from map function when initial source fail', done => {
    const mapSourceStart = jest.fn();
    const mapSourceCancel = jest.fn();
    const values = [5, 8, 3];
    const source = intervalValues({ values, duration: 50, willFail: true, failedindex: 1 });
    const transformedSource = flatMap<number, number>(() =>
      intervalValues({
        values,
        duration: 50,
        startMock: mapSourceStart,
        cancelMock: mapSourceCancel,
      }),
    )(source);
    const error = jest.fn();

    subscribe(transformedSource)({ error });

    setTimeout(() => {
      expect(mapSourceStart).toBeCalledTimes(1);
      expect(mapSourceCancel).toBeCalledTimes(1);
      expect(error).toBeCalledTimes(1);

      done();
    }, 400);
  });

  test('should cancel other sources from map function when one source from map fail', done => {
    const mapSourceCancel = jest.fn();
    const values = [5, 8, 3];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = flatMap<number, number>(v =>
      intervalValues({
        values,
        duration: 50,
        willFail: v === 8, // only second mapped source will fail
        cancelMock: mapSourceCancel,
      }),
    )(source);
    const error = jest.fn();

    subscribe(transformedSource)({ error });

    setTimeout(() => {
      expect(error).toBeCalledTimes(1);
      expect(mapSourceCancel).toBeCalled();

      done();
    }, 400);
  });
});
