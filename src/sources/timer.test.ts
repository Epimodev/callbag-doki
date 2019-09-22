import subscribe from '../utils/subscribe';
import timer from './timer';

describe('sources/timer', () => {
  beforeEach(() => {
    jest.useRealTimers();
  });

  test('should complete without sending values when timer is negative', () => {
    const source = timer(-100);
    const next = jest.fn();
    const complete = jest.fn();

    subscribe(source)({ next, complete });

    expect(next).toBeCalledTimes(0);
    expect(complete).toBeCalledTimes(1);
  });

  test('send 1 value and complete after 100ms', done => {
    const source = timer(100);
    const next = jest.fn();
    const complete = jest.fn();

    subscribe(source)({ next, complete });

    expect(next).toBeCalledTimes(0);
    expect(complete).toBeCalledTimes(0);

    setTimeout(() => {
      expect(next).toBeCalledTimes(1);
      expect(complete).toBeCalledTimes(1);

      done();
    }, 150);
  });

  test('schedule a timer with a Date', done => {
    const date = new Date(Date.now() + 100);
    const source = timer(date);
    const next = jest.fn();
    const complete = jest.fn();

    subscribe(source)({ next, complete });

    expect(next).toBeCalledTimes(0);
    expect(complete).toBeCalledTimes(0);

    setTimeout(() => {
      expect(next).toBeCalledTimes(1);
      expect(complete).toBeCalledTimes(1);

      done();
    }, 150);
  });

  test('send 1 value after 100ms and then 1 value each 50ms', done => {
    const source = timer(100, 50);
    const next = jest.fn();

    const unsubscribe = subscribe(source)({ next });

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

      unsubscribe();
      done();
    }, 275);
  });

  test('send 5 values in 500ms', done => {
    const source = timer(100, 100);
    const next = jest.fn();

    const unsubscribe = subscribe(source)({ next });

    setTimeout(() => {
      expect(next).toBeCalledTimes(5);

      unsubscribe();
      done();
    }, 550);
  });

  test('shoud clear timeout and interval on unsubscribe', done => {
    const source = timer(100, 50);

    const unsubscribe = subscribe(source)({});

    setTimeout(() => {
      jest.useFakeTimers();

      unsubscribe();
      expect(clearTimeout).toBeCalledTimes(1);
      expect(clearInterval).toBeCalledTimes(1);

      jest.useRealTimers();
      done();
    }, 200);
  });
});
