import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  CallbagType,
  Callbag,
  Sink,
} from '../index';
import { createOperator, CreateOperatorParam } from './';

interface ThrottleConfig {
  leading: boolean;
  trailing: boolean;
}

const defaultThrottleConfig: ThrottleConfig = {
  leading: true,
  trailing: false,
};

function throttleFunc<I>(
  duration: number,
  config = defaultThrottleConfig,
): CreateOperatorParam<I, I> {
  let value: I;
  let timeout = 0;

  return (output: Sink<I>): Sink<I> => (type: CallbagType, payload: any) => {
    switch (type) {
      case CALLBAG_START:
        const talkback: Callbag<void, I> = (t: CallbagType, p: any) => {
          if (t === CALLBAG_FINISHING) {
            clearTimeout(timeout);
          }
          payload(t, p);
        };

        output(type, talkback);
        break;
      case CALLBAG_RECEIVE:
        value = payload;

        if (!timeout) {
          if (config.leading) {
            output(CALLBAG_RECEIVE, value);
          }

          timeout = setTimeout(() => {
            timeout = 0;
            if (config.trailing) {
              output(CALLBAG_RECEIVE, value);
            }
          }, duration);
        }
        break;
      case CALLBAG_FINISHING:
        output(type, payload);
        break;
    }
  };
}

function throttle<I>(duration: number, config?: ThrottleConfig) {
  return createOperator(throttleFunc<I>(duration, config));
}

export default throttle;
