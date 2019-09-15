import { createSubject, createMulticastedSource } from './subject';
import { intervalValues } from '../test/callbags';

describe('utils/subject', () => {
  describe('create subject', () => {
    test('should receive values', () => {
      const next1 = jest.fn();
      const next2 = jest.fn();

      const subject = createSubject<number>();
      subject.subscribe({ next: next1 });
      subject.subscribe({ next: next2 });

      subject.next(1);
      subject.next(2);
      subject.next(3);

      expect(next1).toHaveBeenCalledTimes(3);
      expect(next1).toHaveBeenNthCalledWith(1, 1);
      expect(next1).toHaveBeenNthCalledWith(2, 2);
      expect(next1).toHaveBeenNthCalledWith(3, 3);

      expect(next2).toHaveBeenCalledTimes(3);
      expect(next2).toHaveBeenNthCalledWith(1, 1);
      expect(next2).toHaveBeenNthCalledWith(2, 2);
      expect(next2).toHaveBeenNthCalledWith(3, 3);
    });

    test('should receive error', () => {
      const error1 = jest.fn();
      const error2 = jest.fn();

      const subject = createSubject<number>();
      subject.subscribe({ error: error1 });
      subject.subscribe({ error: error2 });

      subject.error('Error message');

      expect(error1).toHaveBeenCalledTimes(1);
      expect(error2).toHaveBeenCalledTimes(1);
    });

    test('should complete', () => {
      const complete1 = jest.fn();
      const complete2 = jest.fn();

      const subject = createSubject<number>();
      subject.subscribe({ complete: complete1 });
      subject.subscribe({ complete: complete2 });

      subject.complete();

      expect(complete1).toHaveBeenCalledTimes(1);
      expect(complete2).toHaveBeenCalledTimes(1);
    });

    test("shouldn't receive value before and after unsubscribe", () => {
      const next1 = jest.fn();
      const next2 = jest.fn();

      const subject = createSubject<number>();
      subject.subscribe({ next: next1 });

      subject.next(1);
      const unsubscribe = subject.subscribe({ next: next2 });
      subject.next(2);
      unsubscribe();
      subject.next(3);

      expect(next1).toHaveBeenCalledTimes(3);
      expect(next1).toHaveBeenNthCalledWith(1, 1);
      expect(next1).toHaveBeenNthCalledWith(2, 2);
      expect(next1).toHaveBeenNthCalledWith(3, 3);

      expect(next2).toHaveBeenCalledTimes(1);
      expect(next2).toHaveBeenNthCalledWith(1, 2);
    });

    test("shouldn't receive error before and after unsubscribe", () => {
      const error1 = jest.fn();
      const error2 = jest.fn();

      const subject = createSubject<number>();
      subject.subscribe({ error: error1 });

      subject.error('Error message 1');
      const unsubscribe = subject.subscribe({ error: error2 });
      subject.error('Error message 2');
      unsubscribe();
      subject.error('Error message 3');

      expect(error1).toHaveBeenCalledTimes(3);
      expect(error2).toHaveBeenCalledTimes(1);
    });

    test("shouldn't complete before and after unsubscribe", () => {
      const complete1 = jest.fn();
      const complete2 = jest.fn();

      const subject = createSubject<number>();
      subject.subscribe({ complete: complete1 });

      subject.complete();
      const unsubscribe = subject.subscribe({ complete: complete2 });
      subject.complete();
      unsubscribe();
      subject.complete();

      expect(complete1).toHaveBeenCalledTimes(3);
      expect(complete2).toHaveBeenCalledTimes(1);
    });
  });

  describe('multi casted source', () => {
    test('should receive values', done => {
      const values = [1, 2, 3];
      const source = intervalValues({ values, duration: 100 });
      const next = jest.fn();

      const subject = createMulticastedSource(source);

      subject.subscribe({ next });

      setTimeout(() => {
        expect(next).toBeCalledTimes(values.length);
        expect(next).toHaveBeenNthCalledWith(1, values[0]);
        expect(next).toHaveBeenNthCalledWith(2, values[1]);
        expect(next).toHaveBeenNthCalledWith(3, values[2]);

        done();
      }, 350);
    });

    test('should receive error', done => {
      const values = [1, 2, 3];
      const source = intervalValues({ values, duration: 100, willFail: true });
      const error = jest.fn();

      const subject = createMulticastedSource(source);

      subject.subscribe({ error });

      setTimeout(() => {
        expect(error).toBeCalledTimes(1);

        done();
      }, 150);
    });

    test('should complete', done => {
      const values = [1, 2, 3];
      const source = intervalValues({ values, duration: 100 });
      const complete = jest.fn();

      const subject = createMulticastedSource(source);

      subject.subscribe({ complete });

      setTimeout(() => {
        expect(complete).toBeCalledTimes(1);

        done();
      }, 350);
    });

    test("shouldn't receive any value after unsubscribe", done => {
      const values = [1, 2, 3];
      const source = intervalValues({ values, duration: 100 });
      const next = jest.fn();

      const subject = createMulticastedSource(source);

      const unsubscribe = subject.subscribe({ next });

      setTimeout(() => {
        unsubscribe();
        expect(next).toBeCalledTimes(1);
      }, 150);

      setTimeout(() => {
        expect(next).toBeCalledTimes(1);

        done();
      }, 350);
    });

    test('both subscriptions shoud receive values', done => {
      const values = [1, 2, 3];
      const source = intervalValues({ values, duration: 100 });
      const next1 = jest.fn();
      const next2 = jest.fn();

      const subject = createMulticastedSource(source);

      subject.subscribe({ next: next1 });
      subject.subscribe({ next: next2 });

      setTimeout(() => {
        expect(next1).toBeCalledTimes(values.length);
        expect(next1).toHaveBeenNthCalledWith(1, values[0]);
        expect(next1).toHaveBeenNthCalledWith(2, values[1]);
        expect(next1).toHaveBeenNthCalledWith(3, values[2]);

        expect(next2).toBeCalledTimes(values.length);
        expect(next2).toHaveBeenNthCalledWith(1, values[0]);
        expect(next2).toHaveBeenNthCalledWith(2, values[1]);
        expect(next2).toHaveBeenNthCalledWith(3, values[2]);

        done();
      }, 350);
    });

    test('both subscriptions shoud receive error', done => {
      const values = [1, 2, 3];
      const source = intervalValues({ values, duration: 100, willFail: true });
      const error1 = jest.fn();
      const error2 = jest.fn();

      const subject = createMulticastedSource(source);

      subject.subscribe({ error: error1 });
      subject.subscribe({ error: error2 });

      setTimeout(() => {
        expect(error1).toBeCalledTimes(1);
        expect(error2).toBeCalledTimes(1);

        done();
      }, 150);
    });

    test('both subscriptions shoud complete', done => {
      const values = [1, 2, 3];
      const source = intervalValues({ values, duration: 100 });
      const complete1 = jest.fn();
      const complete2 = jest.fn();

      const subject = createMulticastedSource(source);

      subject.subscribe({ complete: complete1 });
      subject.subscribe({ complete: complete2 });

      setTimeout(() => {
        expect(complete1).toBeCalledTimes(1);
        expect(complete2).toBeCalledTimes(1);

        done();
      }, 350);
    });

    test('second subscription should receive value on subscription', done => {
      const values = [1, 2, 3];
      const source = intervalValues({ values, duration: 100 });
      const next1 = jest.fn();
      const next2 = jest.fn();

      const subject = createMulticastedSource(source);

      const unsubscribe1 = subject.subscribe({ next: next1 });

      setTimeout(() => {
        const unsubscribe2 = subject.subscribe({ next: next2 });

        expect(next1).toBeCalledTimes(2);
        expect(next1).toHaveBeenNthCalledWith(1, values[0]);
        expect(next1).toHaveBeenNthCalledWith(2, values[1]);

        expect(next2).toBeCalledTimes(1);
        expect(next2).toHaveBeenNthCalledWith(1, values[1]);

        unsubscribe1();
        unsubscribe2();

        done();
      }, 250);
    });

    test('should cancel source only when all subscription are canceled', done => {
      const values = [1, 2, 3];
      const cancelMock = jest.fn();
      const source = intervalValues({ values, duration: 100, cancelMock });

      const subject = createMulticastedSource(source);

      const unsubscribe1 = subject.subscribe({});
      const unsubscribe2 = subject.subscribe({});

      setTimeout(() => {
        unsubscribe1();

        expect(cancelMock).toHaveBeenCalledTimes(0);
      }, 150);

      setTimeout(() => {
        unsubscribe2();

        expect(cancelMock).toHaveBeenCalledTimes(1);

        done();
      }, 250);
    });
  });
});
