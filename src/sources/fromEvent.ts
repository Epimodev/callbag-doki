import { Source } from '../index';
import { createSource } from './';

function fromEventFunc(
  target: EventTarget,
  eventType: string,
  options?: boolean | AddEventListenerOptions,
) {
  return (next: (event: Event) => void) => {
    const handler = (event: Event) => {
      next(event);
    };

    target.addEventListener(eventType, handler, options);

    return () => {
      target.removeEventListener(eventType, handler);
    };
  };
}

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
  return createSource(fromEventFunc(target, eventType, options));
}

export default fromEvent;
