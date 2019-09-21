import { Operator } from '../index';
import map from './map';

interface TimestampValue<T> {
  value: T;
  timestamp: number;
}

function timestamp<I>(): Operator<I, TimestampValue<I>> {
  return map(value => ({
    value,
    timestamp: Date.now(),
  }));
}

export default timestamp;
