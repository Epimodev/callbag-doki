import subscribe from '../utils/subscribe';
import merge from './merge';
import interval from './interval';
import { delayedValue } from '../test/callbags';

describe('merge', () => {
  beforeEach(() => {
    jest.useRealTimers();
  });

  test('should start all subscriptions', () => {
    jest.useFakeTimers();
    const sources = [interval(50), interval(100), interval(150)];
    const source = merge(...sources);

    expect(setInterval).toBeCalledTimes(0);

    const unsubscribe = subscribe(source)({});

    expect(setInterval).toBeCalledTimes(sources.length);

    unsubscribe();
  });

  test('should receive messages from all sources', done => {
    const sources = [interval(50), interval(100), interval(150)];
    const source = merge(...sources);
    // 6 for interval(50), 3 for interval(100), 2 for interval(150)
    const nbMessagesExpected = 6 + 3 + 2;
    const next = jest.fn();

    const unsubscribe = subscribe(source)({ next });

    setTimeout(() => {
      unsubscribe();

      expect(next).toBeCalledTimes(nbMessagesExpected);
      done();
    }, 320);
  });

  test('should clear all subscriptions on unsubscribe', () => {
    jest.useFakeTimers();
    const sources = [interval(50), interval(100), interval(150)];
    const source = merge(...sources);

    expect(setInterval).toBeCalledTimes(0);

    const unsubscribe = subscribe(source)({});

    unsubscribe();

    expect(clearInterval).toBeCalledTimes(sources.length);
  });

  test('become complete when all source are complete', done => {
    const sources = [
      delayedValue({ value: 0, duration: 100, failed: false }),
      delayedValue({ value: 0, duration: 50, failed: false }),
      delayedValue({ value: 0, duration: 150, failed: false }),
    ];
    const source = merge(...sources);
    const complete = jest.fn();

    subscribe(source)({ complete });

    setTimeout(() => {
      // not already called because last source complete after 150ms
      expect(complete).toBeCalledTimes(0);
    }, 75);
    setTimeout(() => {
      // not already called because last source complete after 150ms
      expect(complete).toBeCalledTimes(0);
    }, 125);
    setTimeout(() => {
      expect(complete).toBeCalledTimes(1);

      done();
    }, 175);
  });

  test('send error if one of source fail', done => {
    const sources = [
      delayedValue({ value: 0, duration: 100, failed: true }),
      delayedValue({ value: 0, duration: 50, failed: false }),
      delayedValue({ value: 0, duration: 150, failed: false }),
    ];
    const source = merge(...sources);
    const error = jest.fn();
    const complete = jest.fn();

    subscribe(source)({ complete, error });

    setTimeout(() => {
      expect(error).toBeCalledTimes(1);
      expect(complete).toBeCalledTimes(0);

      done();
    }, 175);
  });

  test('cancel non complete sources when one source fail', done => {
    const sources = [
      delayedValue({ value: 0, duration: 100, failed: false }),
      delayedValue({ value: 0, duration: 50, failed: true }),
      delayedValue({ value: 0, duration: 150, failed: false }),
    ];
    const source = merge(...sources);

    subscribe(source)({});

    setTimeout(() => {
      // mock timers after below timeout and before source fail
      jest.useFakeTimers();
    }, 30);

    setTimeout(() => {
      // first and third source should be cancelled
      expect(clearTimeout).toBeCalledTimes(2);

      done();
    }, 175);
  });
});
