import { Operator } from '../index';
import map from './map';

function mapTo<I, O>(value: O): Operator<I, O> {
  return map(() => value);
}

export default mapTo;
