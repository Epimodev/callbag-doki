import { Source } from '../index';
import { createSource } from './';

function fromRequestFrame(duration?: number): Source<undefined> {
  return createSource((next, complete) => {
    let timeout = 0;
    let requestFrame = 0;

    const run = () => {
      next(undefined);
      requestFrame = requestAnimationFrame(run);
    };

    run();

    if (duration) {
      timeout = setTimeout(() => {
        cancelAnimationFrame(requestFrame);
        complete();
      }, duration);
    }

    return () => {
      cancelAnimationFrame(requestFrame);
      if (duration) {
        clearTimeout(timeout);
      }
    };
  });
}

export default fromRequestFrame;
