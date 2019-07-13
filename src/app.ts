import { pipe } from './utils/pipe';
import { of } from './sources/of';
import { interval } from './sources/interval';
import { fromEvent } from './sources/fromEvent';
import { tap } from './operators/tap';
import { map } from './operators/map';
import { filter } from './operators/filter';
import { find } from './operators/find';
import { scan } from './operators/scan';
import { reduce } from './operators/reduce';
import { take } from './operators/take';
import { takeLast } from './operators/takeLast';
import { count } from './operators/count';
import { min } from './operators/min';
import { max } from './operators/max';
import { delay } from './operators/delay';
import { debounce } from './operators/debounce';
import { throttle } from './operators/throttle';
import { finishAfter } from './operators/finishAfter';

// pipe(
//   interval(1000),
//   take(5),
//   tap(v => console.log(v)),
//   delay(500),
//   tap(v => console.log('DELAYED', v)),
//   finishAfter(10000),
// )(0, () => {});

// pipe(
//   of(10, 20, 30, 40, 5, 60, 70, 180, 90, 10),
//   map(v => v * 2),
//   tap(v => console.log('VALUE', v)),
//   // reduce((acc, v) => acc + v, 0),
// )(0, () => {});

pipe(
  fromEvent(window, 'click'),
  count(),
  tap(c => console.log('COUNT', c)),
  finishAfter(5000),
  takeLast(4),
  tap(c => console.log('LAST', c)),
)(0, () => {});
