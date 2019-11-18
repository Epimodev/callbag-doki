import { Operator } from '../index';
import map from './map';

/**
 * Emits the given constant value on the output every time the source emits a value
 *
 * @param value - value to map each source value to
 * @return callbag operator
 *
 * @public
 */
function mapTo<I, O>(value: O): Operator<I, O> {
  return map(() => value);
}

export default mapTo;
