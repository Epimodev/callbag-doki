import { CALLBAG_START, CallbagType, Source, Sink, Operator } from '../index';

export type CreateOperatorParam<I, O> = (output: Sink<O>) => Sink<I>;

export function createOperator<I, O>(fn: CreateOperatorParam<I, O>): Operator<I, O> {
  return (input: Source<I>): Source<O> => {
    // @ts-ignore
    return (start: CallbagType, output: Sink<O>) => {
      if (start === CALLBAG_START) {
        input(CALLBAG_START, fn(output));
      }
    };
  };
}
