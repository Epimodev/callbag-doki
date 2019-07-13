import pipe from './utils/pipe';
import subscribe from './utils/subscribe';
import fromEvent from './sources/fromEvent';
import count from './operators/count';
import map from './operators/map';

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

const source = pipe(
  fromEvent(window, 'click'),
  count(),
  map(v => v),
);

const unsubscribe = subscribe(source)({
  next: v => console.log('VALUE', v),
  error: error => console.log('ERROR', error),
  complete: () => console.log('COMPLETE'),
});

setTimeout(() => {
  unsubscribe();
}, 5000);
