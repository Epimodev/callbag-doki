import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  CallbagType,
  Callbag,
  Source,
  Sink,
} from '../index';

function mergePool<T = any>(sources: Source<T>[], size: number): Source<T> {
  // @ts-ignore
  return (start: CallbagType, sink: Sink<T>) => {
    if (start === CALLBAG_START) {
      const nbSources = sources.length;
      let nbStarted = 0;
      let nbFinished = 0;
      let started = false;
      let finished = false;
      const sourceTalkbacks = new Array<Callbag<any, any>>(nbSources);

      const talkback = (type: CallbagType, payload: any) => {
        if (type === CALLBAG_FINISHING) {
          finished = true;
        }
        for (let i = 0; i < nbSources; i += 1) {
          sourceTalkbacks[i] && sourceTalkbacks[i](type as any, payload);
        }
      };

      const startSource = (index: number) => {
        nbStarted += 1;
        sources[index](CALLBAG_START, (type: CallbagType, payload: any) => {
          switch (type) {
            case CALLBAG_START:
              sourceTalkbacks[index] = payload;
              if (!started) {
                started = true;
                sink(CALLBAG_START, talkback);
              }
              break;
            case CALLBAG_RECEIVE:
              sink(type, payload);
              break;
            case CALLBAG_FINISHING:
              nbFinished += 1;

              if (payload) {
                // if there is an error
                finished = true;

                for (let j = 0; j < nbSources; j += 1) {
                  if (j !== index) {
                    // if callbag fail, we cancel other sources
                    sourceTalkbacks[j] && sourceTalkbacks[j](CALLBAG_FINISHING);
                  }
                }
                sink(CALLBAG_FINISHING, payload);
              } else {
                // if callbag complete
                finished = finished || nbFinished === nbSources;

                if (finished) {
                  sink(CALLBAG_FINISHING);
                } else if (nbStarted < nbSources) {
                  // all sources are started but some aren't already finished
                  // nbStarted is equals to next index source to start
                  startSource(nbStarted);
                }
              }
              break;
          }
        });
      };

      const nbToStart = Math.min(nbSources, size);
      while (nbStarted < nbToStart) {
        startSource(nbStarted);
      }
    }
  };
}

export default mergePool;
