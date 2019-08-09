import subscribe from '../utils/subscribe';
import fromRequestFrame from './fromRequestFrame';

const global: any = window;
const nativeRaf = global.requestAnimationFrame;
const nativeCancelRaf = global.cancelAnimationFrame;

describe('sources/fromRequestFrame', () => {
  beforeEach(() => {
    global.requestAnimationFrame = jest.fn((callback: () => void) => {
      setTimeout(callback, 16);
    });
    global.cancelAnimationFrame = jest.fn((handler: number) => {
      clearTimeout(handler);
    });
  });

  afterEach(() => {
    global.requestAnimationFrame = nativeRaf;
    global.cancelAnimationFrame = nativeCancelRaf;
  });

  test('send several values', done => {
    const source = fromRequestFrame();
    const next = jest.fn();

    const unsubscribe = subscribe(source)({ next });

    setTimeout(() => {
      expect(next.mock.calls.length).toBeGreaterThan(2);

      unsubscribe();
      done();
    }, 100);
  });

  test('shoud clear animation frame on unsubscribe', done => {
    const source = fromRequestFrame();

    const unsubscribe = subscribe(source)({});

    setTimeout(() => {
      unsubscribe();
      expect(cancelAnimationFrame).toBeCalledTimes(1);
      done();
    }, 100);
  });

  test("shoudn't send values after unsubscribe", done => {
    const source = fromRequestFrame();

    const unsubscribe = subscribe(source)({});

    let nbCall = 0;

    setTimeout(() => {
      unsubscribe();

      nbCall = (cancelAnimationFrame as jest.Mock).mock.calls.length;
    }, 100);

    setTimeout(() => {
      expect(cancelAnimationFrame).toBeCalledTimes(nbCall);

      done();
    }, 200);
  });
});
