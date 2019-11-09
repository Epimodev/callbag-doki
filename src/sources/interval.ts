import { Source } from '../index';
import { createSource } from './';

/**
 * Create a source that emits sequential numbers every specified interval of time
 *
 * @param duration - interval in milliseconds between each value emit
 * @return callbag source
 *
 * ## Example
 * ```ts
 * import interval from 'callbag-doki/sources/interval';
 * import subscribe from 'callbag-doki/utils/subscribe';
 *
 * const unsubscribe = subscribe(interval(1000))(value => console.log('Interval: ', value));
 *
 * // Interval: 1
 * // Interval: 2
 * // Interval: 3
 * // ...
 *
 * @public
 */
function interval(duration: number): Source<number> {
  return createSource(next => {
    let nbInterval = 0;

    const interval = setInterval(() => {
      nbInterval += 1;
      next(nbInterval);
    }, duration);

    return () => {
      clearInterval(interval);
    };
  });
}

export default interval;
