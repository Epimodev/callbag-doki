import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  CallbagType,
  Callbag,
  Source,
  Sink,
  Listener,
  Observer,
  Unsubscribe,
} from '../index';

/**
 * Subscribe to a source
 *
 * @param source - source to subscribe
 * @return function which take an observer as param and return the function to unsubscribe
 *
 * ## Example
 * ```ts
 * import pipeSource from 'callbag-doki/utils/pipe';
 * import interval from 'callbag-doki/sources/interval';
 * import subscribe from 'callbag-doki/utils/subscribe';
 *
 * const unsubscribe = subscribe(interval(1000))(value => console.log(value));
 *
 * // or subscribe with an observer
 * const unsubscribeObserver = subscribe(interval(1000))({
 *   next: value => console.log('Receive value: ', value),
 *   complete: () => console.log('Source completed'),
 *   error: err => console.log('Source failed', error),
 * });
 * ```
 *
 * @public
 */
function subscribe<T>(source: Source<T>): (listener: Observer<T> | Listener<T>) => Unsubscribe {
  return listener => {
    const observer: Observer<T> = typeof listener === 'function' ? { next: listener } : listener;
    let sourceTalkback: Callbag<void, T>;

    const sink: Sink<T> = (type: CallbagType, payload: any) => {
      switch (type) {
        case CALLBAG_START:
          sourceTalkback = payload;
          break;
        case CALLBAG_RECEIVE:
          observer.next && observer.next(payload);
          break;
        case CALLBAG_FINISHING:
          if (payload === undefined) {
            observer.complete && observer.complete();
          } else {
            observer.error && observer.error(payload);
          }
          break;
      }
    };

    source(CALLBAG_START, sink);

    return () => {
      sourceTalkback(CALLBAG_FINISHING);
    };
  };
}

export default subscribe;
