import { Source } from '../index';
import { createSource } from './';

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
