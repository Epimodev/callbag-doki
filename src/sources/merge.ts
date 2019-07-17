import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  CallbagType,
  Callbag,
  Source,
  Sink,
} from '../index';

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
  // @ts-ignore
  return (start: CallbagType, sink: Sink<any>) => {
    if (start === CALLBAG_START) {
      const nbSources = sources.length;
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

      for (let i = 0; i < nbSources; i += 1) {
        sources[i](CALLBAG_START, (type: CallbagType, payload: any) => {
          switch (type) {
            case CALLBAG_START:
              sourceTalkbacks[i] = payload;
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
                  if (j !== i) {
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
                }
              }
              break;
          }
        });
      }
    }
  };
}

export default merge;
