import subscribe from '../utils/subscribe';
import concat from './concat';
import { intervalValues } from '../test/callbags';

describe('sources/concat', () => {
  test('should call source 1 by 1', done => {
    const sources = [
      intervalValues({ values: [0], duration: 100, willFail: false }),
      intervalValues({ values: [0], duration: 50, willFail: false }),
      intervalValues({ values: [0], duration: 150, willFail: false }),
    ];
    const source = concat(...sources);
    const next = jest.fn();

    subscribe(source)({ next });

    expect(next).toBeCalledTimes(0);

    setTimeout(() => {
      // first source not finished yet
      expect(next).toBeCalledTimes(0);
    }, 75);
    setTimeout(() => {
      // only first source finished
      expect(next).toBeCalledTimes(1);
    }, 125);
    setTimeout(() => {
      // only first and second sources finished
      expect(next).toBeCalledTimes(2);
    }, 175);
    setTimeout(() => {
      // all sources finished
      expect(next).toBeCalledTimes(3);

      done();
    }, 325);
  });

  test('should receive message from all sources', done => {
    const sources = [
      intervalValues({ values: [0], duration: 100, willFail: false }),
      intervalValues({ values: [0], duration: 50, willFail: false }),
      intervalValues({ values: [0], duration: 150, willFail: false }),
    ];
    const source = concat(...sources);
    const next = jest.fn();

    subscribe(source)({ next });

    expect(next).toBeCalledTimes(0);

    setTimeout(() => {
      // all sources finished
      expect(next).toBeCalledTimes(3);

      done();
    }, 325);
  });

  test('should complete when all sources are completed', done => {
    const sources = [
      intervalValues({ values: [0], duration: 100, willFail: false }),
      intervalValues({ values: [0], duration: 50, willFail: false }),
      intervalValues({ values: [0], duration: 150, willFail: false }),
    ];
    const source = concat(...sources);
    const complete = jest.fn();

    subscribe(source)({ complete });

    expect(complete).toBeCalledTimes(0);

    setTimeout(() => {
      // first source not finished yet
      expect(complete).toBeCalledTimes(0);
    }, 75);
    setTimeout(() => {
      // only first source finished
      expect(complete).toBeCalledTimes(0);
    }, 125);
    setTimeout(() => {
      // only first and second sources finished
      expect(complete).toBeCalledTimes(0);
    }, 175);
    setTimeout(() => {
      // all sources finished
      expect(complete).toBeCalledTimes(1);

      done();
    }, 325);
  });

  test('should not start next sources on unsubscribe', done => {
    const startMock1 = jest.fn();
    const startMock2 = jest.fn();
    const startMock3 = jest.fn();
    const sources = [
      intervalValues({ values: [0], duration: 100, willFail: false, startMock: startMock1 }),
      intervalValues({ values: [0], duration: 50, willFail: false, startMock: startMock2 }),
      intervalValues({ values: [0], duration: 150, willFail: false, startMock: startMock3 }),
    ];
    const source = concat(...sources);

    const unsubscribe = subscribe(source)({});

    unsubscribe();

    setTimeout(() => {
      expect(startMock1).toBeCalledTimes(1);
      expect(startMock2).toBeCalledTimes(0);
      expect(startMock3).toBeCalledTimes(0);

      done();
    }, 325);
  });

  test('should cancel started and non completed source on unsubscribe', done => {
    const cancelMock1 = jest.fn();
    const cancelMock2 = jest.fn();
    const cancelMock3 = jest.fn();
    const sources = [
      intervalValues({ values: [0], duration: 100, willFail: false, cancelMock: cancelMock1 }),
      intervalValues({ values: [0], duration: 50, willFail: false, cancelMock: cancelMock2 }),
      intervalValues({ values: [0], duration: 150, willFail: false, cancelMock: cancelMock3 }),
    ];
    const source = concat(...sources);

    const unsubscribe = subscribe(source)({});

    setTimeout(() => {
      // unsubscribe after first source finish and before second finish
      unsubscribe();
    }, 125);

    setTimeout(() => {
      // only second sources should be cancel because third source isn't started
      expect(cancelMock1).toBeCalledTimes(0); // already finished
      expect(cancelMock2).toBeCalledTimes(1); // not finished
      expect(cancelMock3).toBeCalledTimes(0); // not started

      done();
    }, 325);
  });

  test('should fail when 1 source fail', done => {
    const sources = [
      intervalValues({ values: [0], duration: 100, willFail: true }),
      intervalValues({ values: [0], duration: 50, willFail: false }),
      intervalValues({ values: [0], duration: 150, willFail: false }),
    ];
    const source = concat(...sources);
    const error = jest.fn();

    subscribe(source)({ error });

    setTimeout(() => {
      expect(error).toBeCalledTimes(1);

      done();
    }, 125);
  });

  test('should not start next sources when 1 source fail', done => {
    const startMock1 = jest.fn();
    const startMock2 = jest.fn();
    const startMock3 = jest.fn();
    const sources = [
      intervalValues({ values: [0], duration: 100, willFail: true, startMock: startMock1 }),
      intervalValues({ values: [0], duration: 50, willFail: false, startMock: startMock2 }),
      intervalValues({ values: [0], duration: 150, willFail: false, startMock: startMock3 }),
    ];
    const source = concat(...sources);

    subscribe(source)({});

    setTimeout(() => {
      // second and third source should'nt start because first source fail
      expect(startMock1).toBeCalledTimes(1);
      expect(startMock2).toBeCalledTimes(0);
      expect(startMock3).toBeCalledTimes(0);

      done();
    }, 325);
  });
});
