import { Source, Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

function buffer<I>(closeNotifier: Source<any>): Operator<I, I[]> {
  return source => {
    return createSource((next, complete, error) => {
      let valuesBuffer: I[] = [];

      const notifierObserver: Observer<any> = {
        next: () => {
          if (buffer.length > 0) {
            next(valuesBuffer);
            valuesBuffer = [];
          }
        },
      };

      const observer: Observer<I> = {
        next: value => {
          valuesBuffer.push(value);
        },
        error: err => {
          unsubscribeNotifier();
          error(err);
        },
        complete: () => {
          if (buffer.length > 0) {
            next(valuesBuffer);
          }
          unsubscribeNotifier();
          complete();
        },
      };

      const unsubscribeNotifier = subscribe(closeNotifier)(notifierObserver);
      const unsubscribe = subscribe(source)(observer);

      return () => {
        unsubscribeNotifier();
        unsubscribe();
      };
    });
  };
}

export default buffer;
