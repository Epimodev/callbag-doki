import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  CallbagType,
  Source,
  Sink,
} from '../index';

function fromEvent<K extends keyof WindowEventMap>(
  target: Window,
  eventType: K,
  options?: boolean | AddEventListenerOptions,
): Source<WindowEventMap[K]>;

function fromEvent<K extends keyof HTMLElementEventMap>(
  target: HTMLElement,
  eventType: K,
  options?: boolean | AddEventListenerOptions,
): Source<HTMLElementEventMap[K]>;

function fromEvent(
  target: EventTarget,
  eventType: string,
  options?: boolean | AddEventListenerOptions,
): Source<Event>;

function fromEvent(
  target: EventTarget,
  eventType: string,
  options?: boolean | AddEventListenerOptions,
): Source<Event> {
  // @ts-ignore
  return (start: CallbagType, sink: Sink<Event>) => {
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

export default fromEvent;
