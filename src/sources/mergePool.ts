import { Source } from '../index';
import subscribe from '../utils/subscribe';
import { createSource } from './';

/**
 * Create a source which concurrently emits values of each given sources like merge but with a pool size limit
 * For example there are 10 sources and size limit is 5, only 5 sources will be concurrently running. Each time a source complete, a new given source start
 *
 * @param sources - sources to observe concurrently
 * @param size - pool size limit
 * @return callbag source
 *
 * @public
 */
function mergePool<T = any>(sources: Source<T>[], size: number): Source<T> {
  return createSource((next, complete, error) => {
    const nbSources = sources.length;
    let nbStarted = 0;
    let nbFinished = 0;
    let finished = false;
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
        next,
        complete: handleComplete,
        error: handleError,
      });
    };

    const nbToStart = Math.min(nbSources, size);
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

export default mergePool;
