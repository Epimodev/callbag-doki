import { Operator } from '../index';
import interval from '../sources/interval';
import buffer from './buffer';

/**
 * Buffers source values for a specific time period
 *
 * @param duration - amount of time to fill each buffer array
 * @return callbag operator
 *
 * @public
 */
function bufferTime<I>(duration: number): Operator<I, I[]> {
  return buffer(interval(duration));
}

export default bufferTime;
