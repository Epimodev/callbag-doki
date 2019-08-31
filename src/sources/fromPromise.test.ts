import subscribe from '../utils/subscribe';
import fromPromise from './fromPromise';

function delayedValue<T>(value: T): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(value);
    }, 100);
  });
}

function failPromise<T>(error: T): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(error);
    }, 100);
  });
}

describe('sources/fromPromise', () => {
  test('should send value when promise is resolved', done => {
    const value = 'TEST';
    const source = fromPromise(delayedValue(value));
    const next = jest.fn();

    subscribe(source)({ next });

    expect(next).toHaveBeenCalledTimes(0);
    setTimeout(() => {
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenLastCalledWith(value);

      done();
    }, 200);
  });

  test('should complete when promise is resolved', done => {
    const value = 'TEST';
    const source = fromPromise(delayedValue(value));
    const complete = jest.fn();

    subscribe(source)({ complete });

    expect(complete).toHaveBeenCalledTimes(0);
    setTimeout(() => {
      expect(complete).toHaveBeenCalledTimes(1);

      done();
    }, 200);
  });

  test('should fail when promise is failed', done => {
    const value = 'TEST';
    const source = fromPromise(failPromise(value));
    const error = jest.fn();

    subscribe(source)({ error });

    expect(error).toHaveBeenCalledTimes(0);
    setTimeout(() => {
      expect(error).toHaveBeenCalledTimes(1);
      expect(error).toHaveBeenLastCalledWith(value);

      done();
    }, 200);
  });

  test('should not send value when source is canceled', done => {
    const value = 'TEST';
    const source = fromPromise(delayedValue(value));
    const next = jest.fn();

    const unsubscribe = subscribe(source)({ next });

    unsubscribe();

    setTimeout(() => {
      expect(next).toHaveBeenCalledTimes(0);

      done();
    }, 200);
  });

  test('should not send error when source is canceled', done => {
    const value = 'TEST';
    const source = fromPromise(failPromise(value));
    const error = jest.fn();

    const unsubscribe = subscribe(source)({ error });

    unsubscribe();

    setTimeout(() => {
      expect(error).toHaveBeenCalledTimes(0);

      done();
    }, 200);
  });
});
