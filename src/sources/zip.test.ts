import subscribe from '../utils/subscribe';
import zip from './zip';
import { intervalValues } from '../test/callbags';

const sourceValues = [0, 1, 2];

describe('sources/zip', () => {
  test('should start only 2 first subscriptions', () => {
    const startMock1 = jest.fn();
    const startMock2 = jest.fn();
    const startMock3 = jest.fn();
    const sources = [
      intervalValues({ values: sourceValues, duration: 50, startMock: startMock1 }),
      intervalValues({ values: sourceValues, duration: 100, startMock: startMock2 }),
      intervalValues({ values: sourceValues, duration: 150, startMock: startMock3 }),
    ];
    const source = zip(sources, 2);

    expect(startMock1).toBeCalledTimes(0);
    expect(startMock2).toBeCalledTimes(0);
    expect(startMock3).toBeCalledTimes(0);

    const unsubscribe = subscribe(source)({});

    expect(startMock1).toBeCalledTimes(1);
    expect(startMock2).toBeCalledTimes(1);
    expect(startMock3).toBeCalledTimes(0);

    unsubscribe();
  });

  test('should clear subscriptions of started sources on unsubscribe', () => {
    const cancelMock1 = jest.fn();
    const cancelMock2 = jest.fn();
    const cancelMock3 = jest.fn();
    const sources = [
      intervalValues({ values: sourceValues, duration: 50, cancelMock: cancelMock1 }),
      intervalValues({ values: sourceValues, duration: 100, cancelMock: cancelMock2 }),
      intervalValues({ values: sourceValues, duration: 150, cancelMock: cancelMock3 }),
    ];
    const source = zip(sources, 2);

    const unsubscribe = subscribe(source)({});

    unsubscribe();

    expect(cancelMock1).toBeCalledTimes(1);
    expect(cancelMock2).toBeCalledTimes(1);
    expect(cancelMock3).toBeCalledTimes(0); // not started source
  });

  test('become complete when all source are complete', done => {
    const sources = [
      intervalValues({ values: [0], duration: 100, willFail: false }),
      intervalValues({ values: [0], duration: 50, willFail: false }),
      intervalValues({ values: [0], duration: 150, willFail: false }),
    ];
    const source = zip(sources, 2);
    const complete = jest.fn();

    subscribe(source)({ complete });

    setTimeout(() => {
      // not already called because last source complete after 200ms
      expect(complete).toBeCalledTimes(0);
    }, 125);
    setTimeout(() => {
      expect(complete).toBeCalledTimes(1);

      done();
    }, 225);
  });

  test('send error if one of source fail', done => {
    const sources = [
      intervalValues({ values: [0], duration: 100, willFail: true }),
      intervalValues({ values: [0], duration: 50, willFail: false }),
      intervalValues({ values: [0], duration: 150, willFail: false }),
    ];
    const source = zip(sources, 2);
    const error = jest.fn();
    const complete = jest.fn();

    subscribe(source)({ complete, error });

    setTimeout(() => {
      expect(error).toBeCalledTimes(1);
      expect(complete).toBeCalledTimes(0);

      done();
    }, 225);
  });

  test('cancel non complete sources on unsubscribe', done => {
    const cancelMock1 = jest.fn();
    const cancelMock2 = jest.fn();
    const cancelMock3 = jest.fn();
    const cancelMock4 = jest.fn();
    const sources = [
      intervalValues({ values: [0], duration: 100, willFail: false, cancelMock: cancelMock1 }),
      intervalValues({ values: [0], duration: 50, willFail: false, cancelMock: cancelMock2 }),
      intervalValues({ values: [0], duration: 150, willFail: false, cancelMock: cancelMock3 }),
      intervalValues({ values: [0], duration: 150, willFail: false, cancelMock: cancelMock4 }),
    ];
    const source = zip(sources, 2);

    const unsubscribe = subscribe(source)({});

    setTimeout(() => {
      unsubscribe();

      // first and third source should be cancelled
      expect(cancelMock1).toBeCalledTimes(1);
      expect(cancelMock2).toBeCalledTimes(0); // finished
      expect(cancelMock3).toBeCalledTimes(1);
      expect(cancelMock4).toBeCalledTimes(0); // not started

      done();
    }, 75);
  });

  test('cancel non complete sources when one source fail', done => {
    const cancelMock1 = jest.fn();
    const cancelMock2 = jest.fn();
    const cancelMock3 = jest.fn();
    const cancelMock4 = jest.fn();
    const sources = [
      intervalValues({ values: [0], duration: 100, willFail: false, cancelMock: cancelMock1 }),
      intervalValues({ values: [0], duration: 50, willFail: true, cancelMock: cancelMock2 }),
      intervalValues({ values: [0], duration: 150, willFail: false, cancelMock: cancelMock3 }),
      intervalValues({ values: [0], duration: 150, willFail: false, cancelMock: cancelMock4 }),
    ];
    const source = zip(sources, 2);

    subscribe(source)({});

    setTimeout(() => {
      // first and third source should be cancelled
      expect(cancelMock1).toBeCalledTimes(1);
      expect(cancelMock2).toBeCalledTimes(0); // failed
      expect(cancelMock3).toBeCalledTimes(0); // not started
      expect(cancelMock4).toBeCalledTimes(0); // not started

      done();
    }, 100);
  });

  test('should group values from each ressource', done => {
    const sources = [
      intervalValues({ values: [0, 1, 2], duration: 50 }),
      intervalValues({ values: [3, 4, 5], duration: 100 }),
      intervalValues({ values: [6, 7, 8], duration: 150 }),
    ];
    const source = zip(sources);
    const next = jest.fn();

    subscribe(source)({ next });

    setTimeout(() => {
      // not called yet because first value of third source comes at 150ms
      expect(next).toBeCalledTimes(0);
    }, 125);
    setTimeout(() => {
      expect(next).toBeCalledTimes(1);
      expect(next).lastCalledWith([0, 3, 6]);
    }, 175);
    setTimeout(() => {
      expect(next).toBeCalledTimes(2);
      expect(next).lastCalledWith([1, 4, 7]);
    }, 325);
    setTimeout(() => {
      expect(next).toBeCalledTimes(3);
      expect(next).lastCalledWith([2, 5, 8]);

      done();
    }, 475);
  });
});
