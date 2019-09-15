import { Source, Operator, Unsubscribe } from '../index';
import subscribe from '../utils/subscribe';
import { createOperator } from './';

function catchError<I, O>(handler: (error: any) => Source<O>): Operator<I, I | O> {
  return createOperator(observer => {
    let unsubscribe: Unsubscribe | undefined;

    return {
      next: value => observer.next(value),
      error: err => {
        unsubscribe = subscribe(handler(err))(observer);
      },
      complete: observer.complete,
      clear: () => {
        unsubscribe && unsubscribe();
      },
    };
  });
}

export default catchError;
