import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  CallbagType,
  Source,
  Sink,
  Unsubscribe,
} from '../index';

export type CreateSourceParam<V> = (
  next: (value: V) => void,
  complete: () => void,
  error: (err: any) => void,
) => Unsubscribe | void;

/**
 * Create a source with an api similar to rxjs observable creation
 *
 * @param fn - source creator function
 * @return callbag source
 *
 * ## Example
 * ```ts
 * import { createSource } from 'callbag-doki/sources';
 *
 * function interval(duration) {
 *   // Create a source which send a value every `duration` param
 *   return createSource((next, complete, error) => {
 *     let nbInterval = 0;
 *
 *     const interval = setInterval(() => {
 *       nbInterval += 1;
 *       next(nbInterval);
 *     }, duration);
 *
 *     // function called on unsubscribe
 *     return () => {
 *       clearInterval(interval);
 *     };
 *   });
 * }
 *
 * @public
 */
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
