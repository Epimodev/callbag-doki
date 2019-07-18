import subscribe from '../utils/subscribe';
import httpRequest, { HttpCache } from './httpRequest';
import createXhrMock from '../test/xhr';

const global: any = window;
const nativeXhr = global.XMLHttpRequest;

describe('httpRequest', () => {
  afterEach(() => {
    global.XMLHttpRequest = nativeXhr;
  });

  test('should send request', () => {
    const requestDuration = 50;

    const xhrMock = createXhrMock({ duration: requestDuration, responseStatus: 200 });
    const xhrInstance = new xhrMock();
    global.XMLHttpRequest = jest.fn(() => xhrInstance) as any;

    expect(xhrInstance.open).toBeCalledTimes(0);
    expect(xhrInstance.send).toBeCalledTimes(0);

    const source = httpRequest({ url: '' });
    const unsubscribe = subscribe(source)({});
    unsubscribe();

    expect(xhrInstance.open).toBeCalledTimes(1);
    expect(xhrInstance.send).toBeCalledTimes(1);
  });

  test('should call next and complete once when request is finished', done => {
    const requestDuration = 50;
    const unsubscribeDuration = 100;

    const xhrMock = createXhrMock({ duration: requestDuration, responseStatus: 200 });
    const xhrInstance = new xhrMock();
    global.XMLHttpRequest = jest.fn(() => xhrInstance) as any;
    const next = jest.fn();
    const complete = jest.fn();
    const error = jest.fn();

    const source = httpRequest({ url: '' });
    const unsubscribe = subscribe(source)({ next, complete, error });

    setTimeout(() => {
      unsubscribe();

      expect(next).toBeCalledTimes(1);
      expect(complete).toBeCalledTimes(1);
      expect(error).toBeCalledTimes(0);

      done();
    }, unsubscribeDuration);
  });

  test('should call error when status is upper than 400', done => {
    const requestDuration = 50;
    const unsubscribeDuration = 100;

    const xhrMock = createXhrMock({ duration: requestDuration, responseStatus: 400 });
    const xhrInstance = new xhrMock();
    global.XMLHttpRequest = jest.fn(() => xhrInstance) as any;
    const next = jest.fn();
    const complete = jest.fn();
    const error = jest.fn();

    const source = httpRequest({ url: '' });
    const unsubscribe = subscribe(source)({ next, complete, error });

    setTimeout(() => {
      unsubscribe();

      expect(next).toBeCalledTimes(0);
      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(1);

      done();
    }, unsubscribeDuration);
  });

  test('should call error when request fail', done => {
    const requestDuration = 50;
    const unsubscribeDuration = 100;

    const xhrMock = createXhrMock({ duration: requestDuration, willFail: true });
    const xhrInstance = new xhrMock();
    global.XMLHttpRequest = jest.fn(() => xhrInstance) as any;
    const next = jest.fn();
    const complete = jest.fn();
    const error = jest.fn();

    const source = httpRequest({ url: '' });
    const unsubscribe = subscribe(source)({ next, complete, error });

    setTimeout(() => {
      unsubscribe();

      expect(next).toBeCalledTimes(0);
      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(1);

      done();
    }, unsubscribeDuration);
  });

  test('should abort request when unsubscribe before finished', done => {
    const requestDuration = 100;
    const unsubscribeDuration = 50;

    const xhrMock = createXhrMock({ duration: requestDuration, willFail: true });
    const xhrInstance = new xhrMock();
    global.XMLHttpRequest = jest.fn(() => xhrInstance) as any;
    const next = jest.fn();
    const complete = jest.fn();
    const error = jest.fn();

    const source = httpRequest({ url: '' });
    const unsubscribe = subscribe(source)({ next, complete, error });

    setTimeout(() => {
      unsubscribe();

      expect(xhrInstance.abort).toBeCalledTimes(1);

      expect(next).toBeCalledTimes(0);
      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(0);

      done();
    }, unsubscribeDuration);
  });

  test('should push response in cache when request is succeed', done => {
    const requestDuration = 50;
    const unsubscribeDuration = 100;

    const cache: HttpCache = { getResponse: () => undefined, pushResponse: jest.fn() };
    const xhrMock = createXhrMock({ duration: requestDuration, responseStatus: 200 });
    const xhrInstance = new xhrMock();
    global.XMLHttpRequest = jest.fn(() => xhrInstance) as any;

    const source = httpRequest({ url: '', cache });
    const unsubscribe = subscribe(source)({});

    setTimeout(() => {
      unsubscribe();

      expect(cache.pushResponse).toBeCalledTimes(1);

      done();
    }, unsubscribeDuration);
  });

  test("should'nt push response in cache when status is upper than 400", done => {
    const requestDuration = 50;
    const unsubscribeDuration = 100;

    const cache: HttpCache = { getResponse: () => undefined, pushResponse: jest.fn() };
    const xhrMock = createXhrMock({ duration: requestDuration, responseStatus: 400 });
    const xhrInstance = new xhrMock();
    global.XMLHttpRequest = jest.fn(() => xhrInstance) as any;

    const source = httpRequest({ url: '', cache });
    const unsubscribe = subscribe(source)({});

    setTimeout(() => {
      unsubscribe();

      expect(cache.pushResponse).toBeCalledTimes(0);

      done();
    }, unsubscribeDuration);
  });

  test("should'nt push response in cache when request fail", done => {
    const requestDuration = 50;
    const unsubscribeDuration = 100;

    const cache: HttpCache = { getResponse: () => undefined, pushResponse: jest.fn() };
    const xhrMock = createXhrMock({ duration: requestDuration, willFail: true });
    const xhrInstance = new xhrMock();
    global.XMLHttpRequest = jest.fn(() => xhrInstance) as any;

    const source = httpRequest({ url: '', cache });
    const unsubscribe = subscribe(source)({});

    setTimeout(() => {
      unsubscribe();

      expect(cache.pushResponse).toBeCalledTimes(0);

      done();
    }, unsubscribeDuration);
  });

  test("should'nt send request when response is cached", () => {
    const requestDuration = 50;

    const cache: HttpCache = {
      getResponse: () => ({ status: 200, headers: {}, data: 'Hello' }),
      pushResponse: jest.fn(),
    };
    const xhrMock = createXhrMock({ duration: requestDuration, willFail: true });
    const xhrInstance = new xhrMock();
    global.XMLHttpRequest = jest.fn(() => xhrInstance) as any;

    const source = httpRequest({ url: '', cache });
    const unsubscribe = subscribe(source)({});
    unsubscribe();

    expect(cache.pushResponse).toBeCalledTimes(0);
    expect(xhrInstance.send).toBeCalledTimes(0);
    expect(xhrInstance.open).toBeCalledTimes(0);
  });

  test('should send cached value', () => {
    const requestDuration = 50;

    const cachedResponse = { status: 200, headers: {}, data: 'Hello' };
    const cache: HttpCache = {
      getResponse: () => cachedResponse,
      pushResponse: jest.fn(),
    };
    const xhrMock = createXhrMock({ duration: requestDuration, willFail: true });
    const xhrInstance = new xhrMock();
    global.XMLHttpRequest = jest.fn(() => xhrInstance) as any;
    const next = jest.fn();
    const complete = jest.fn();
    const error = jest.fn();

    const source = httpRequest({ url: '', cache });
    const unsubscribe = subscribe(source)({ next, complete, error });
    unsubscribe();

    expect(next).lastCalledWith(cachedResponse);
    expect(next).toBeCalledTimes(1);
    expect(complete).toBeCalledTimes(1);
    expect(error).toBeCalledTimes(0);
  });
});
