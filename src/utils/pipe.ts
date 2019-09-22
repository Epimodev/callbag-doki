import { Source, Operator } from '../index';

/**
 * Transform a source with operators
 *
 * @param source - source to transform
 * @param operators - operators to apply to source
 * @return source transformed by operators
 *
 * ## Example
 * ```ts
 * import pipeSource from 'callbag-doki/utils/pipe'
 * import interval from 'callbag-doki/sources/interval'
 * import map from 'callbag-doki/operators/map'
 *
 * // this will create a source which send each second an integer multiplied by 2
 * pipeSource(
 *  interval(1000),
 *  map(value => value * 2)
 * )
 * ```
 *
 * @public
 */
function pipeSource<T1, T2>(source: Source<T1>, operator1: Operator<T1, T2>): Source<T2>;
function pipeSource<T1, T2, T3>(
  source: Source<T1>,
  operator1: Operator<T1, T2>,
  operator2: Operator<T2, T3>,
): Source<T3>;
function pipeSource<T1, T2, T3, T4>(
  source: Source<T1>,
  operator1: Operator<T1, T2>,
  operator2: Operator<T2, T3>,
  operator3: Operator<T3, T4>,
): Source<T4>;
function pipeSource<T1, T2, T3, T4, T5>(
  source: Source<T1>,
  operator1: Operator<T1, T2>,
  operator2: Operator<T2, T3>,
  operator3: Operator<T3, T4>,
  operator4: Operator<T4, T5>,
): Source<T5>;
function pipeSource<T1, T2, T3, T4, T5, T6>(
  source: Source<T1>,
  operator1: Operator<T1, T2>,
  operator2: Operator<T2, T3>,
  operator3: Operator<T3, T4>,
  operator4: Operator<T4, T5>,
  operator5: Operator<T5, T6>,
): Source<T6>;
function pipeSource<T1, T2, T3, T4, T5, T6, T7>(
  source: Source<T1>,
  operator1: Operator<T1, T2>,
  operator2: Operator<T2, T3>,
  operator3: Operator<T3, T4>,
  operator4: Operator<T4, T5>,
  operator5: Operator<T5, T6>,
  operator6: Operator<T6, T7>,
): Source<T7>;
function pipeSource<T1, T2, T3, T4, T5, T6, T7, T8>(
  source: Source<T1>,
  operator1: Operator<T1, T2>,
  operator2: Operator<T2, T3>,
  operator3: Operator<T3, T4>,
  operator4: Operator<T4, T5>,
  operator5: Operator<T5, T6>,
  operator6: Operator<T6, T7>,
  operator7: Operator<T7, T8>,
): Source<T8>;
function pipeSource<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  source: Source<T1>,
  operator1: Operator<T1, T2>,
  operator2: Operator<T2, T3>,
  operator3: Operator<T3, T4>,
  operator4: Operator<T4, T5>,
  operator5: Operator<T5, T6>,
  operator6: Operator<T6, T7>,
  operator7: Operator<T7, T8>,
  operator8: Operator<T8, T9>,
): Source<T9>;
function pipeSource<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
  source: Source<T1>,
  operator1: Operator<T1, T2>,
  operator2: Operator<T2, T3>,
  operator3: Operator<T3, T4>,
  operator4: Operator<T4, T5>,
  operator5: Operator<T5, T6>,
  operator6: Operator<T6, T7>,
  operator7: Operator<T7, T8>,
  operator8: Operator<T8, T9>,
  operator9: Operator<T9, T10>,
): Source<T10>;
function pipeSource<T>(source: Source<T>, ...operators: Operator<any, any>[]): Source<any>;

function pipeSource<T>(source: Source<T>, ...operators: Operator<any, any>[]): Source<any> {
  let transformedSource: Source<any> = source;

  for (let i = 0, l = operators.length; i < l; i += 1) {
    transformedSource = operators[i](transformedSource);
  }

  return transformedSource;
}

export default pipeSource;
