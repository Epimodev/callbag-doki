import { Operator, Observer } from '../index';
import { createSource } from '../sources';
import subscribe from '../utils/subscribe';

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
