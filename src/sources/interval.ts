import { Source } from '../index';
import { createSource } from './';

function intervalFunc(duration: number) {
  return (next: (value: number) => void) => {
    let nbInterval = 0;

    const interval = setInterval(() => {
      nbInterval += 1;
      next(nbInterval);
    }, duration);

    return () => {
      clearInterval(interval);
    };
  };
}

function interval(duration: number): Source<number> {
  return createSource(intervalFunc(duration));
}

export default interval;
