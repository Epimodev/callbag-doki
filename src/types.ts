export const CALLBAG_START = 0;
export const CALLBAG_RECEIVE = 1;
export const CALLBAG_FINISHING = 2;

export type CallbagType = typeof CALLBAG_START | typeof CALLBAG_RECEIVE | typeof CALLBAG_FINISHING;

export type CallbagGreets<D> = (type: typeof CALLBAG_START, cb: Callbag<D>) => void;
export type CallbagData<D> = (type: typeof CALLBAG_RECEIVE, data: D) => void;
export type CallbagTermination = (type: typeof CALLBAG_FINISHING, error?: any) => void;

export type Callbag<D = any> = CallbagGreets<D> & CallbagData<D> & CallbagTermination;

export type CallbagOperator<I, O> = (input: CallbagGreets<I>) => CallbagGreets<O>;
