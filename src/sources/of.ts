import { Source } from '../index';
import { createSource } from './';

function ofFunc<T>(...values: T[]) {
  return (next: (value: T) => void, complete: () => void) => {
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
  };
}

function of<T>(...values: T[]): Source<T> {
  return createSource(ofFunc(...values));
}

export default of;
