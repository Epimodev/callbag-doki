import { Source } from '../index';
import { createSource } from './';

/**
 * Creates a source that starts emitting after an dueTime and emits ever increasing numbers after each period of time thereafter
 *
 * @param dueTime - initial delay specified as duration in milliseconds or as Date object
 * @param intervalDuration - period of time in milliseconds between each value emit after dueTime
 * @return callbag source
 *
 * @public
 */
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
