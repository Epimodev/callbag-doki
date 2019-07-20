import subscribe from '../utils/subscribe';
import interval from './interval';

describe('sources/interval', () => {
  beforeEach(() => {
    jest.useRealTimers();
  });

  test('send 5 values in 500ms', done => {
    const source = interval(100);
    const next = jest.fn();

    const unsubscribe = subscribe(source)({ next });

    setTimeout(() => {
      expect(next.mock.calls.length).toBe(5);

      unsubscribe();
      done();
    }, 550);
  });

  test('shoud clear timeout on unsubscribe', done => {
    const source = interval(100);

    const unsubscribe = subscribe(source)({});

    setTimeout(() => {
      jest.useFakeTimers();

      unsubscribe();
      expect(clearInterval).toBeCalledTimes(1);

      jest.useRealTimers();
      done();
    }, 200);
  });
});
