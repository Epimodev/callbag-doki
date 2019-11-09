import { Source } from '../index';
import { createSource } from './';

/**
 * Create a source from a promise
 *
 * @param promise - promise to observe
 * @return callbag source
 *
 * @public
 */
function fromPromise<T>(promise: Promise<T>): Source<T> {
  return createSource((next, complete, error) => {
    let canceled = false;

    promise
      .then(value => {
        if (!canceled) {
          next(value);
          complete();
        }
      })
      .catch(err => {
        if (!canceled) {
          error(err);
        }
      });

    return () => {
      canceled = true;
    };
  });
}

export default fromPromise;
