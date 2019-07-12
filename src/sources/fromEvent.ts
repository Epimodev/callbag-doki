import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  CallbagGreets,
  Callbag,
  CallbagType,
} from '../types';

function fromEvent<K extends keyof WindowEventMap>(
  target: Window,
  eventType: K,
  options?: boolean | AddEventListenerOptions,
): CallbagGreets<WindowEventMap[K]>;

function fromEvent<K extends keyof HTMLElementEventMap>(
  target: HTMLElement,
  eventType: K,
  options?: boolean | AddEventListenerOptions,
): CallbagGreets<HTMLElementEventMap[K]>;

function fromEvent(
  target: EventTarget,
  eventType: string,
  options?: boolean | AddEventListenerOptions,
): CallbagGreets<Event> {
  return (start: CallbagType, sink: Callbag<Event>) => {
    if (start === CALLBAG_START) {
      const handler = (event: Event) => {
        sink(CALLBAG_RECEIVE, event);
      };
      const talkback = (type: CallbagType) => {
        if (type === CALLBAG_FINISHING) {
          sink(CALLBAG_FINISHING);
          target.removeEventListener(eventType, handler);
        }
      };
      sink(CALLBAG_START, talkback);

      target.addEventListener(eventType, handler, options);
    }
  };
}

export { fromEvent };
