import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

function takeLast<I>(count = 1): Operator<I, I> {
  return source => {
    return createSource((next, complete, error) => {
      const lastValues: I[] = [];

      const observer: Observer<I> = {
        next: value => {
          lastValues.push(value);

          if (lastValues.length > count) {
            lastValues.shift();
          }
        },
        error,
        complete: () => {
          for (let i = 0, l = lastValues.length; i < l; i += 1) {
            next(lastValues[i]);
          }

          complete();
        },
      };

      return subscribe(source)(observer);
    });
  };
}

export default takeLast;
