import { Source } from '../index';
import { createSource } from './';

function fromRequestFrame(): Source<undefined> {
  return createSource(next => {
    let requestFrame = 0;

    const run = () => {
      next(undefined);
      requestFrame = requestAnimationFrame(run);
    };

    run();

    return () => {
      cancelAnimationFrame(requestFrame);
    };
  });
}

export default fromRequestFrame;
