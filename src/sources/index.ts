import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  CallbagType,
  Source,
  Sink,
} from '../index';

export type CreateSourceParam<V> = (
  next: (value: V) => void,
  complete: () => void,
  error: (err: any) => void,
) => (() => void) | void;

export function createSource<O>(fn: CreateSourceParam<O>): Source<O> {
  // @ts-ignore
  return (start: CallbagType, sink: Sink<O>) => {
    if (start === CALLBAG_START) {
      const unsubscribe = fn(
        value => sink(CALLBAG_RECEIVE, value),
        () => sink(CALLBAG_FINISHING),
        err => sink(CALLBAG_FINISHING, err),
      );

      const talkback = (type: CallbagType) => {
        if (type === CALLBAG_FINISHING && unsubscribe) {
          unsubscribe();
        }
      };

      sink(CALLBAG_START, talkback);
    }
  };
}
