import subscribe from '../utils/subscribe';
import concat from './concat';
import { timeoutValue } from '../test/callbags';

describe('concat', () => {
  test('should call source 1 by 1', done => {
    const sources = [
      timeoutValue({ value: 0, delay: 100, willFail: false }),
      timeoutValue({ value: 0, delay: 50, willFail: false }),
      timeoutValue({ value: 0, delay: 150, willFail: false }),
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
      timeoutValue({ value: 0, delay: 100, willFail: false }),
      timeoutValue({ value: 0, delay: 50, willFail: false }),
      timeoutValue({ value: 0, delay: 150, willFail: false }),
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
      timeoutValue({ value: 0, delay: 100, willFail: false }),
      timeoutValue({ value: 0, delay: 50, willFail: false }),
      timeoutValue({ value: 0, delay: 150, willFail: false }),
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

  test.skip('should not start next sources on unsubscribe', done => {});

  test('should cancel started and non completed source on unsubscribe', done => {
    const cancelMock1 = jest.fn();
    const cancelMock2 = jest.fn();
    const cancelMock3 = jest.fn();
    const sources = [
      timeoutValue({ value: 0, delay: 100, willFail: false, cancelMock: cancelMock1 }),
      timeoutValue({ value: 0, delay: 50, willFail: false, cancelMock: cancelMock2 }),
      timeoutValue({ value: 0, delay: 150, willFail: false, cancelMock: cancelMock3 }),
    ];
    const source = concat(...sources);

    const unsubscribe = subscribe(source)({});

    setTimeout(() => {
      // only first source finished

      unsubscribe();
      // only second sources should be clear because third source isn't started
      expect(cancelMock1).toBeCalledTimes(0); // already finished
      expect(cancelMock2).toBeCalledTimes(1); // not finished
      expect(cancelMock3).toBeCalledTimes(0); // not started
    }, 125);

    setTimeout(() => {
      expect(cancelMock3).toBeCalledTimes(0); // not started

      done();
    }, 325);
  });

  test.skip('should fail when 1 source fail', done => {});

  test.skip('should not start next sources when 1 source fail', done => {});

  test.skip('should cancel no completed source when 1 source fail', done => {});
});
