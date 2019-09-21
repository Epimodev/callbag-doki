import { Operator } from '../index';
import interval from '../sources/interval';
import buffer from './buffer';

function bufferTime<I>(duration: number): Operator<I, I[]> {
  return buffer(interval(duration));
}

export default bufferTime;
