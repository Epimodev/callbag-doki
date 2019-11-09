import { Source } from '../index';
import { createSource } from './';

/**
 * Create a source that emit a tick on request animation frame
 *
 * @param duration - in milliseconds, duration before stop request animation frame. If duration is 0 or not define, request animation frame will be stop only on unsubscribe
 * @return callbag source
 *
 * @public
 */
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
