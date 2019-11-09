import { Source } from '../index';
import mergePool from './mergePool';

/**
 * Create a source which concurrently emits values of each given sources
 *
 * @param sources - sources to observe concurrently
 * @return callbag source
 *
 * @public
 */
function merge<T1>(s1: Source<T1>): Source<T1>;
function merge<T1, T2>(s1: Source<T1>, s2: Source<T2>): Source<T1 | T2>;
function merge<T1, T2, T3>(s1: Source<T1>, s2: Source<T2>, s3: Source<T3>): Source<T1 | T2 | T3>;
function merge<T1, T2, T3, T4>(
  s1: Source<T1>,
  s2: Source<T2>,
  s3: Source<T3>,
  s4: Source<T4>,
): Source<T1 | T2 | T3 | T4>;
function merge<T1, T2, T3, T4, T5>(
  s1: Source<T1>,
  s2: Source<T2>,
  s3: Source<T3>,
  s4: Source<T4>,
  s5: Source<T5>,
): Source<T1 | T2 | T3 | T4 | T5>;
function merge<T1, T2, T3, T4, T5, T6>(
  s1: Source<T1>,
  s2: Source<T2>,
  s3: Source<T3>,
  s4: Source<T4>,
  s5: Source<T5>,
  s6: Source<T6>,
): Source<T1 | T2 | T3 | T4 | T5 | T6>;
function merge<T1, T2, T3, T4, T5, T6, T7>(
  s1: Source<T1>,
  s2: Source<T2>,
  s3: Source<T3>,
  s4: Source<T4>,
  s5: Source<T5>,
  s6: Source<T6>,
  s7: Source<T7>,
): Source<T1 | T2 | T3 | T4 | T5 | T6 | T7>;
function merge<T1, T2, T3, T4, T5, T6, T7, T8>(
  s1: Source<T1>,
  s2: Source<T2>,
  s3: Source<T3>,
  s4: Source<T4>,
  s5: Source<T5>,
  s6: Source<T6>,
  s7: Source<T7>,
  s8: Source<T8>,
): Source<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8>;
function merge<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  s1: Source<T1>,
  s2: Source<T2>,
  s3: Source<T3>,
  s4: Source<T4>,
  s5: Source<T5>,
  s6: Source<T6>,
  s7: Source<T7>,
  s8: Source<T8>,
  s9: Source<T9>,
): Source<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>;
function merge<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
  s1: Source<T1>,
  s2: Source<T2>,
  s3: Source<T3>,
  s4: Source<T4>,
  s5: Source<T5>,
  s6: Source<T6>,
  s7: Source<T7>,
  s8: Source<T8>,
  s9: Source<T9>,
  s10: Source<T10>,
): Source<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10>;
function merge<T = any>(...sources: Source<T>[]): Source<T>;

function merge<T = any>(...sources: Source<T>[]): Source<T> {
  return mergePool(sources, Infinity);
}

export default merge;
