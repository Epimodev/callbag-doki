import subscribe from '../utils/subscribe';
import debounce from './debounce';
import { intervalValues } from '../test/callbags';

describe('operators/debounce', () => {
  test('should complete at the end of the source', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = debounce<number>(300)(source);
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
    const transformedSource = debounce<number>(300)(source);
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
    const transformedSource = debounce<number>(300)(source);

    const unsubscribe = subscribe(transformedSource)({});
    unsubscribe();

    expect(cancelMock).toBeCalledTimes(1);
  });

  test("shouldn't receive a value after input complete", done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = debounce<number>(100)(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).toBeCalledTimes(0);

      done();
    }, 500);
  });

  test('should receive a value for each value from source when debounce duration is lower than input interval', done => {
    const values = [5, 8, 3, 6, 2];
    const source = intervalValues({ values, duration: 100 });
    const transformedSource = debounce<number>(50)(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      // latest value shoudn't send because source is complete
      expect(next).toBeCalledTimes(values.length - 1);

      done();
    }, 700);
  });
});
