import { Operator } from '../index';
import { createOperator } from './';

function map<I, O>(mapper: (value: I) => O): Operator<I, O> {
  return createOperator(observer => {
    return {
      next: value => {
        observer.next(mapper(value));
      },
      error: observer.error,
      complete: observer.complete,
    };
  });
}

export default map;
