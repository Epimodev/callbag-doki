import subscribe from '../utils/subscribe';
import concat from './concat';
import { delayedValue } from '../test/callbags';

describe('concat', () => {
  beforeEach(() => {
    jest.useRealTimers();
  });

  test('should call source 1 by 1', done => {
    const sources = [
      delayedValue({ value: 0, duration: 100, failed: false }),
      delayedValue({ value: 0, duration: 50, failed: false }),
      delayedValue({ value: 0, duration: 150, failed: false }),
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
      delayedValue({ value: 0, duration: 100, failed: false }),
      delayedValue({ value: 0, duration: 50, failed: false }),
      delayedValue({ value: 0, duration: 150, failed: false }),
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
      delayedValue({ value: 0, duration: 100, failed: false }),
      delayedValue({ value: 0, duration: 50, failed: false }),
      delayedValue({ value: 0, duration: 150, failed: false }),
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

  test('should clear started and non completed source on unsubscribe', done => {
    const sources = [
      delayedValue({ value: 0, duration: 100, failed: false }),
      delayedValue({ value: 0, duration: 50, failed: false }),
      delayedValue({ value: 0, duration: 150, failed: false }),
    ];
    const source = concat(...sources);

    const unsubscribe = subscribe(source)({});

    setTimeout(() => {
      // only first source finished
      jest.useFakeTimers();

      unsubscribe();
      // only second sources should be clear because third source isn't started
      expect(clearTimeout).toBeCalledTimes(1);
    }, 125);

    setTimeout(() => {
      expect(clearTimeout).toBeCalledTimes(1);

      done();
    }, 325);
  });

  test.skip('should fail when 1 source fail', done => {});

  test.skip('should cancel no completed source when 1 source fail', done => {});
});
