import { Source } from '../index';
import { createSource } from './';

/**
 * Converts params to an observable source
 *
 * @param values - values to convert
 * @return callbag source
 *
 * @public
 */
function of<T>(...values: T[]): Source<T> {
  return createSource((next, complete) => {
    let finished = false;

    for (let i = 0, l = values.length; i < l && !finished; i += 1) {
      next(values[i]);
    }
    if (!finished) {
      complete();
    }

    return () => {
      finished = true;
    };
  });
}

export default of;
