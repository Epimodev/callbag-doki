import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

/**
 * Buffers the source values until the size hits the maximum bufferSize given
 *
 * @param bufferSize - maximum size of the buffer emitted
 * @param startBufferEvery - interval at which to start a new buffer
 * @return callbag operator
 *
 * @public
 */
function bufferCount<I>(bufferSize: number, startBufferEvery = bufferSize): Operator<I, I[]> {
  return source => {
    return createSource((next, complete, error) => {
      let nbValuesBeforeStart = 0;
      const buffer: I[] = [];
      const observer: Observer<I> = {
        next: value => {
          if (nbValuesBeforeStart <= 0) {
            buffer.push(value);
          } else {
            nbValuesBeforeStart -= 1;
          }

          if (buffer.length === bufferSize) {
            next([...buffer]);
            for (let i = 0; i < startBufferEvery; i += 1) {
              buffer.shift();
            }
            nbValuesBeforeStart = startBufferEvery - bufferSize;
          }
        },
        error,
        complete,
      };

      return subscribe(source)(observer);
    });
  };
}

export default bufferCount;
