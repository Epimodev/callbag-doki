import { Source } from '../index';
import { createSource } from './';

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
