# callbag-doki

`callbag-doki` is a new lib for reactive programing inspired by [RxJS](https://rxjs-dev.firebaseapp.com/) and based on [callbag specs](https://github.com/callbag/callbag).  
If you already use functions based on `callbag` specs, you can import only some sources or operators and use them with other packages based on the same spec.

### Motivation

I was looking for a lightweight alternative of RxJS because it was 1 of my biggest dependency for a mobile web-app.
Then I discover [callbag](https://github.com/callbag/callbag) `A standard for JS callbacks that enables lightweight observables and iterables`.
Even if there are already some sources and operators available, I was interessed by creating my own lib to have a better knowledge about how a reactive library works under the hood.

### Installation

```
yarn add @epimodev/callbag-doki

# or with npm

npm install --save @epimodev/callbag-doki
```

### Examples

Basic source with subscription:
```js
import subscribe from '@epimodev/callbag-doki/utils/subscribe'
import interval from '@epimodev/callbag-doki/sources/interval'

const unsubscribe = subscribe(interval(1000))(count => console.log(count))
// 1
// 2
// 3

setTimeout(() => {
  unsubscribe()
}, 3500)
```

Source transformed with operator:
```js
import subscribe from '@epimodev/callbag-doki/utils/subscribe'
import pipeSource from '@epimodev/callbag-doki/utils/pipeSource'
import interval from '@epimodev/callbag-doki/sources/interval'
import map from '@epimodev/callbag-doki/operators/map'

const customInterval = pipeSource(
  interval(1000),
  map(count => count * 2),
)

const unsubscribe = subscribe(customInterval)(value => console.log(value))
// 2
// 4
// 6

setTimeout(() => {
  unsubscribe()
}, 3500)
```

http request:
```js
import subscribe from '@epimodev/callbag-doki/utils/subscribe'
import httpRequest from '@epimodev/callbag-doki/sources/httpRequest'

const httpSource = httpRequest({ url: 'https://jsonplaceholder.typicode.com/albums' })

const cancelRequest = subscribe(httpSource)({
  next: response => console.log('Succeed: ', response),
  error: err => console.log('Failed: ', err),
  complete: () => console.log('Complete'),
})
```

### List of sources
- [concat](https://github.com/Epimodev/callbag-doki/blob/master/src/sources/concat.ts)
- [fromEvent](https://github.com/Epimodev/callbag-doki/blob/master/src/sources/fromEvent.ts)
- [fromPromise](https://github.com/Epimodev/callbag-doki/blob/master/src/sources/fromPromise.ts)
- [fromRequestFrame](https://github.com/Epimodev/callbag-doki/blob/master/src/sources/fromRequestFrame.ts)
- [httpRequest](https://github.com/Epimodev/callbag-doki/blob/master/src/sources/httpRequest.ts)
- [imageBase64](https://github.com/Epimodev/callbag-doki/blob/master/src/sources/imageBase64.ts)
- [interval](https://github.com/Epimodev/callbag-doki/blob/master/src/sources/interval.ts)
- [merge](https://github.com/Epimodev/callbag-doki/blob/master/src/sources/merge.ts)
- [mergePool](https://github.com/Epimodev/callbag-doki/blob/master/src/sources/mergePool.ts)
- [of](https://github.com/Epimodev/callbag-doki/blob/master/src/sources/of.ts)
- [timer](https://github.com/Epimodev/callbag-doki/blob/master/src/sources/timer.ts)
- [zip](https://github.com/Epimodev/callbag-doki/blob/master/src/sources/zip.ts)

### List of operators
- [buffer](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/buffer.ts)
- [bufferCount](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/bufferCount.ts)
- [bufferTime](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/bufferTime.ts)
- [catchError](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/catchError.ts)
- [count](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/count.ts)
- [debounce](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/debounce.ts)
- [delay](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/delay.ts)
- [every](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/every.ts)
- [filter](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/filter.ts)
- [find](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/find.ts)
- [first](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/first.ts)
- [flatMap](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/flatMap.ts)
- [isEmpty](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/isEmpty.ts)
- [last](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/last.ts)
- [map](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/map.ts)
- [mapTo](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/mapTo.ts)
- [max](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/max.ts)
- [min](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/min.ts)
- [pluck](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/pluck.ts)
- [reduce](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/reduce.ts)
- [repeat](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/repeat.ts)
- [retry](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/retry.ts)
- [scan](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/scan.ts)
- [switchMap](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/switchMap.ts)
- [take](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/take.ts)
- [takeLast](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/takeLast.ts)
- [tap](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/tap.ts)
- [throttle](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/throttle.ts)
- [throwIfEmpty](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/throwIfEmpty.ts)
- [timestamp](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/timestamp.ts)
- [toArray](https://github.com/Epimodev/callbag-doki/blob/master/src/operators/toArray.ts)
