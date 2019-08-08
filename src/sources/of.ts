import { Source } from '../index';
import { createSource } from './';

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
