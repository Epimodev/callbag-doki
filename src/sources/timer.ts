import { Source } from '../index';
import { createSource } from './';

function timer(dueTime: number | Date, intervalDuration?: number): Source<number> {
  return createSource((next, complete) => {
    const timeoutDuration = typeof dueTime === 'number' ? dueTime : dueTime.getTime() - Date.now();

    if (timeoutDuration < 0) {
      complete();
    } else {
      let nbInterval = 0;
      let interval = 0;

      const timeout = setTimeout(() => {
        nbInterval += 1;
        next(nbInterval);

        if (intervalDuration) {
          interval = setInterval(() => {
            nbInterval += 1;
            next(nbInterval);
          }, intervalDuration);
        } else {
          complete();
        }
      }, timeoutDuration);

      return () => {
        clearTimeout(timeout);
        clearInterval(interval);
      };
    }
  });
}

export default timer;
