import { Source } from '../index';
import subscribe from '../utils/subscribe';
import { createSource } from './';

function zip<T1>(sources: [Source<T1>], poolSize?: number): Source<[T1]>;
function zip<T1, T2>(sources: [Source<T1>, Source<T2>], poolSize?: number): Source<[T1, T2]>;
function zip<T1, T2, T3>(
  sources: [Source<T1>, Source<T2>, Source<T3>],
  poolSize?: number,
): Source<[T1, T2, T3]>;
function zip<T1, T2, T3, T4>(
  sources: [Source<T1>, Source<T2>, Source<T3>, Source<T4>],
  poolSize?: number,
): Source<[T1, T2, T3, T4]>;
function zip<T1, T2, T3, T4, T5>(
  sources: [Source<T1>, Source<T2>, Source<T3>, Source<T4>, Source<T5>],
  poolSize?: number,
): Source<[T1, T2, T3, T4, T5]>;
function zip<T1, T2, T3, T4, T5, T6>(
  sources: [Source<T1>, Source<T2>, Source<T3>, Source<T4>, Source<T5>, Source<T6>],
  poolSize?: number,
): Source<[T1, T2, T3, T4, T5, T6]>;
function zip<T1, T2, T3, T4, T5, T6, T7>(
  sources: [Source<T1>, Source<T2>, Source<T3>, Source<T4>, Source<T5>, Source<T6>, Source<T7>],
  poolSize?: number,
): Source<[T1, T2, T3, T4, T5, T6, T7]>;
function zip<T1, T2, T3, T4, T5, T6, T7, T8>(
  sources: [
    Source<T1>,
    Source<T2>,
    Source<T3>,
    Source<T4>,
    Source<T5>,
    Source<T6>,
    Source<T7>,
    Source<T8>,
  ],
  poolSize?: number,
): Source<[T1, T2, T3, T4, T5, T6, T7, T8]>;
function zip<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  sources: [
    Source<T1>,
    Source<T2>,
    Source<T3>,
    Source<T4>,
    Source<T5>,
    Source<T6>,
    Source<T7>,
    Source<T8>,
    Source<T9>,
  ],
  poolSize?: number,
): Source<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>;
function zip<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
  sources: [
    Source<T1>,
    Source<T2>,
    Source<T3>,
    Source<T4>,
    Source<T5>,
    Source<T6>,
    Source<T7>,
    Source<T8>,
    Source<T9>,
    Source<T10>,
  ],
  poolSize?: number,
): Source<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;
function zip<T = any>(sources: Source<T>[], poolSize?: number): Source<T[]>;

function zip<T = any>(sources: Source<T>[], poolSize = Infinity): Source<T[]> {
  return createSource((next, complete, error) => {
    const nbSources = sources.length;
    let nbStarted = 0;
    let nbFinished = 0;
    let finished = false;
    const batches: T[][] = [];
    const unsubscribeFuncs = new Array<() => void>(nbSources);

    const handleComplete = () => {
      nbFinished += 1;
      finished = finished || nbFinished === nbSources;

      if (finished) {
        complete();
      } else if (nbStarted < nbSources) {
        // start next source which isn't started yet
        startSource(nbStarted);
      }
      // all sources are started but some aren't already finished
    };

    const startSource = (index: number) => {
      nbStarted += 1;

      const handleNext = (value: T) => {
        appendValue(batches, value, index, nbSources);
        if (isBatchComplete(batches[0])) {
          // if batch is complete, we get it from batches and send it
          const batch = batches.shift();
          next(batch!);
        }
      };

      const handleError = (err: any) => {
        finished = true;
        for (let j = 0; j < nbSources; j += 1) {
          if (j !== index) {
            // if callbag fail, we cancel other sources
            unsubscribeFuncs[j] && unsubscribeFuncs[j]();
          }
        }
        error(err);
      };

      unsubscribeFuncs[index] = subscribe(sources[index])({
        next: handleNext,
        complete: handleComplete,
        error: handleError,
      });
    };

    const nbToStart = Math.min(nbSources, poolSize);
    while (nbStarted < nbToStart) {
      startSource(nbStarted);
    }

    return () => {
      finished = true;
      for (let i = 0; i < nbSources; i += 1) {
        unsubscribeFuncs[i] && unsubscribeFuncs[i]();
      }
    };
  });
}

/**
 * this function mutate `values` array to add the new value received from a source
 */
function appendValue<T>(batches: T[][], value: T, sourceIndex: number, nbSources: number) {
  const nbBatch = batches.length;

  for (let i = 0; i < nbBatch; i += 1) {
    const batch = batches[i];
    if (batch[sourceIndex] === undefined) {
      batch[sourceIndex] = value;
      return;
    }
  }

  // if value is already defined for all current batch, we create a new batch with the new value
  const newBatch = new Array<T>(nbSources);
  newBatch[sourceIndex] = value;
  batches.push(newBatch);
}

function isBatchComplete<T>(batch: T[]) {
  for (let i = 0, l = batch.length; i < l; i += 1) {
    if (batch[i] === undefined) {
      return false;
    }
  }
  return true;
}

export default zip;
