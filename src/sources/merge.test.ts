import subscribe from '../utils/subscribe';
import merge from './merge';
import interval from './interval';

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
});
