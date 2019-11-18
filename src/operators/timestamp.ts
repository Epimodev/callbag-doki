import { Operator } from '../index';
import map from './map';

interface TimestampValue<T> {
  value: T;
  timestamp: number;
}

/**
 * Attaches a timestamp to each item emitted by an observable indicating when it was emitted
 *
 * @return callbag operator
 *
 * @public
 */
function timestamp<I>(): Operator<I, TimestampValue<I>> {
  return map(value => ({
    value,
    timestamp: Date.now(),
  }));
}

export default timestamp;
