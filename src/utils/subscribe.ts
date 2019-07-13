import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  CallbagType,
  Callbag,
  Source,
  Sink,
} from '../index';

type Listener<T> = (value: T) => void;

interface Observer<T> {
  next?: Listener<T>;
  error?: (error?: any) => void;
  complete?: () => void;
}

type Unsubscribe = () => void;

function subscribe<T>(source: Source<T>): (listener: Observer<T> | Listener<T>) => Unsubscribe {
  return (listener: Observer<T> | Listener<T>): Unsubscribe => {
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
