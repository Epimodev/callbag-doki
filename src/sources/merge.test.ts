import subscribe from '../utils/subscribe';
import merge from './merge';
import { intervalValues } from '../test/callbags';

const sourceValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

describe('sources/merge', () => {
  test('should start all subscriptions', () => {
    const startMock1 = jest.fn();
    const startMock2 = jest.fn();
    const startMock3 = jest.fn();
    const sources = [
      intervalValues({ values: sourceValues, duration: 50, startMock: startMock1 }),
      intervalValues({ values: sourceValues, duration: 100, startMock: startMock2 }),
      intervalValues({ values: sourceValues, duration: 150, startMock: startMock3 }),
    ];
    const source = merge(...sources);

    expect(startMock1).toBeCalledTimes(0);
    expect(startMock2).toBeCalledTimes(0);
    expect(startMock3).toBeCalledTimes(0);

    const unsubscribe = subscribe(source)({});

    expect(startMock1).toBeCalledTimes(1);
    expect(startMock2).toBeCalledTimes(1);
    expect(startMock3).toBeCalledTimes(1);

    unsubscribe();
  });

  test('should receive messages from all sources', done => {
    const sources = [
      intervalValues({ values: sourceValues, duration: 50 }),
      intervalValues({ values: sourceValues, duration: 100 }),
      intervalValues({ values: sourceValues, duration: 150 }),
    ];
    const source = merge(...sources);
    // 6 for interval(50), 3 for interval(100), 2 for interval(150)
    const nbMessagesExpected = 6 + 3 + 2;
    const next = jest.fn();

    const unsubscribe = subscribe(source)({ next });

    setTimeout(() => {
      unsubscribe();

      expect(next).toBeCalledTimes(nbMessagesExpected);
      done();
    }, 350);
  });

  test('should clear all subscriptions on unsubscribe', () => {
    const cancelMock1 = jest.fn();
    const cancelMock2 = jest.fn();
    const cancelMock3 = jest.fn();
    const sources = [
      intervalValues({ values: sourceValues, duration: 50, cancelMock: cancelMock1 }),
      intervalValues({ values: sourceValues, duration: 100, cancelMock: cancelMock2 }),
      intervalValues({ values: sourceValues, duration: 150, cancelMock: cancelMock3 }),
    ];
    const source = merge(...sources);

    const unsubscribe = subscribe(source)({});

    unsubscribe();

    expect(cancelMock1).toBeCalledTimes(1);
    expect(cancelMock2).toBeCalledTimes(1);
    expect(cancelMock3).toBeCalledTimes(1);
  });

  test('become complete when all source are complete', done => {
    const sources = [
      intervalValues({ values: [0], duration: 100, willFail: false }),
      intervalValues({ values: [0], duration: 50, willFail: false }),
      intervalValues({ values: [0], duration: 150, willFail: false }),
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
      intervalValues({ values: [0], duration: 100, willFail: true }),
      intervalValues({ values: [0], duration: 50, willFail: false }),
      intervalValues({ values: [0], duration: 150, willFail: false }),
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

  test('cancel non complete sources on unsubscribe', done => {
    const cancelMock1 = jest.fn();
    const cancelMock2 = jest.fn();
    const cancelMock3 = jest.fn();
    const sources = [
      intervalValues({ values: [0], duration: 100, willFail: false, cancelMock: cancelMock1 }),
      intervalValues({ values: [0], duration: 50, willFail: false, cancelMock: cancelMock2 }),
      intervalValues({ values: [0], duration: 150, willFail: false, cancelMock: cancelMock3 }),
    ];
    const source = merge(...sources);

    const unsubscribe = subscribe(source)({});

    setTimeout(() => {
      unsubscribe();

      // first and third source should be cancelled
      expect(cancelMock1).toBeCalledTimes(1);
      expect(cancelMock2).toBeCalledTimes(0);
      expect(cancelMock3).toBeCalledTimes(1);

      done();
    }, 75);
  });

  test('cancel non complete sources when one source fail', done => {
    const cancelMock1 = jest.fn();
    const cancelMock2 = jest.fn();
    const cancelMock3 = jest.fn();
    const sources = [
      intervalValues({ values: [0], duration: 100, willFail: false, cancelMock: cancelMock1 }),
      intervalValues({ values: [0], duration: 50, willFail: true, cancelMock: cancelMock2 }),
      intervalValues({ values: [0], duration: 150, willFail: false, cancelMock: cancelMock3 }),
    ];
    const source = merge(...sources);

    subscribe(source)({});

    setTimeout(() => {
      // first and third source should be cancelled
      expect(cancelMock1).toBeCalledTimes(1);
      expect(cancelMock2).toBeCalledTimes(0);
      expect(cancelMock3).toBeCalledTimes(1);

      done();
    }, 175);
  });
});
