import subscribe from '../utils/subscribe';
import httpRequest from './httpRequest';
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

    expect(xhrInstance.open).toBeCalledTimes(1);
    expect(xhrInstance.send).toBeCalledTimes(1);

    unsubscribe();
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
});
