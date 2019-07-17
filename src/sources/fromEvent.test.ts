import subscribe from '../utils/subscribe';
import fromEvent from './fromEvent';

describe('fromEvent', () => {
  test('should add event listener', () => {
    const fakeHtmlElement = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    const source = fromEvent(fakeHtmlElement as any, 'click');

    subscribe(source)({});

    expect(fakeHtmlElement.addEventListener).toBeCalledTimes(1);
  });

  test('should remove event listener after unsubscribe', () => {
    const fakeHtmlElement = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    const source = fromEvent(fakeHtmlElement as any, 'click');
    const unsubscribe = subscribe(source)({});

    expect(fakeHtmlElement.removeEventListener).toBeCalledTimes(0);
    unsubscribe();
    expect(fakeHtmlElement.removeEventListener).toBeCalledTimes(1);
  });
});
