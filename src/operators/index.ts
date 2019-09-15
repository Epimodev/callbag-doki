import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  Callbag,
  CallbagType,
  Source,
  Sink,
  Operator,
  Observer,
  Unsubscribe,
} from '../index';

export type CreateOperatorParam<I, O> = (output: Sink<O>) => Sink<I>;

export type CreateOperatorParam2<I, O> = (
  observer: Required<Observer<O>>,
  unsubscribe: Unsubscribe,
) => Required<Observer<I>>;

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

export function createOperator2<I, O>(fn: CreateOperatorParam2<I, O>): Operator<I, O> {
  return (input: Source<I>): Source<O> => {
    // @ts-ignore
    return (start: CallbagType, output: Sink<O>) => {
      if (start === CALLBAG_START) {
        let sourceTalkback: Callbag<void, O>;

        const observer: Required<Observer<O>> = {
          next: value => output(CALLBAG_RECEIVE, value),
          error: err => output(CALLBAG_FINISHING, err),
          complete: () => output(CALLBAG_FINISHING),
        };
        const unsubscribe = () => {
          sourceTalkback && sourceTalkback(CALLBAG_FINISHING);
        };
        const inputObserver = fn(observer, unsubscribe);

        input(CALLBAG_START, (type: CallbagType, payload: any) => {
          switch (type) {
            case CALLBAG_START:
              sourceTalkback = payload;
              output(type, payload);
              break;
            case CALLBAG_RECEIVE:
              inputObserver.next(payload);
              break;
            case CALLBAG_FINISHING:
              if (payload) {
                inputObserver.error(payload);
              } else {
                inputObserver.complete();
              }
              break;
          }
        });
      }
    };
  };
}
