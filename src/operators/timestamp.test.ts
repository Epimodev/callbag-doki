import subscribe from '../utils/subscribe';
import timestamp from './timestamp';
import { intervalValues } from '../test/callbags';

const global: any = window;
const nativeDateNow = global.Date.now;

describe('operators/timestamp', () => {
  test('should receive a message for each value from source', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = timestamp<number>()(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).toBeCalledTimes(values.length);

      done();
    }, 300);
  });

  test('should complete at the end of the source', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = timestamp<number>()(source);
    const complete = jest.fn();

    subscribe(transformedSource)({ complete });

    setTimeout(() => {
      expect(complete).toBeCalledTimes(1);

      done();
    }, 300);
  });

  test('should failed if source fail', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50, willFail: true });
    const transformedSource = timestamp<number>()(source);
    const error = jest.fn();

    subscribe(transformedSource)({ error });

    setTimeout(() => {
      expect(error).toBeCalledTimes(1);

      done();
    }, 100);
  });

  test('should cancel source on unsubscribe', () => {
    const cancelMock = jest.fn();
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50, cancelMock });
    const transformedSource = timestamp<number>()(source);

    const unsubscribe = subscribe(transformedSource)({});
    unsubscribe();

    expect(cancelMock).toBeCalledTimes(1);
  });

  test('each output should contains input with a timestamp', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = timestamp<number>()(source);
    const next = jest.fn();

    Date.now = () => 100;

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).nthCalledWith(1, { value: values[0], timestamp: 100 });
      expect(next).nthCalledWith(2, { value: values[1], timestamp: 100 });
      expect(next).nthCalledWith(3, { value: values[2], timestamp: 100 });
      expect(next).nthCalledWith(4, { value: values[3], timestamp: 100 });
      expect(next).nthCalledWith(5, { value: values[4], timestamp: 100 });

      Date.now = nativeDateNow;

      done();
    }, 300);
  });
});
