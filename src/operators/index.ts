import { CALLBAG_START, CallbagType, CallbagGreets, Callbag, CallbagOperator } from '../types';

export type CreateOperatorParam<I, O> = (output: Callbag<O>) => Callbag<I>;

export function createOperator<I, O>(fn: CreateOperatorParam<I, O>): CallbagOperator<I, O> {
  return (input: CallbagGreets<I>): CallbagGreets<O> => {
    return (start: CallbagType, output: Callbag<O>) => {
      if (start === CALLBAG_START) {
        input(CALLBAG_START, fn(output));
      }
    };
  };
}
