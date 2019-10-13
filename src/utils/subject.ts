import { Source, Listener, Observer, Unsubscribe } from '../index';
import subscribe from './subscribe';

interface Subject<T> {
  subscribe: (listener: Observer<T> | Listener<T>) => Unsubscribe;
  next: (value: T) => void;
  error: (error?: any) => void;
  complete: () => void;
}

/**
 * Create a subject
 *
 * @return a new subject
 *
 * ## Example
 * ```ts
 * import { createSubject } from 'callbag-doki/utils/subject';
 *
 * const mySubject = createSubject();
 * mySubject.next(1); // nothing happens because there isn't any subscription
 *
 * const unsubscribe = mySubject.subscribe(value => console.log('Receive value: ', value));
 *
 * mySubject.next(2); // "Receive value: 2"
 * mySubject.next(3); // "Receive value: 3"
 * ```
 *
 * @public
 */
function createSubject<T>(): Subject<T> {
  const observers: Observer<T>[] = [];

  const next = (newValue: T) => {
    for (let i = 0, l = observers.length; i < l; i += 1) {
      const observer = observers[i];
      observer.next && observer.next(newValue);
    }
  };
  const error = (err: any) => {
    for (let i = 0, l = observers.length; i < l; i += 1) {
      const observer = observers[i];
      observer.error && observer.error(err);
    }
  };
  const complete = () => {
    for (let i = 0, l = observers.length; i < l; i += 1) {
      const observer = observers[i];
      observer.complete && observer.complete();
    }
  };

  const unsubscribeSubject = (observer: Observer<T>) => {
    const index = observers.indexOf(observer);
    observers.splice(index, 1);
  };

  const subscribeSubject = (listener: Observer<T> | Listener<T>): Unsubscribe => {
    const observer: Observer<T> = typeof listener === 'function' ? { next: listener } : listener;
    observers.push(observer);

    return () => {
      unsubscribeSubject(observer);
    };
  };

  return {
    next,
    error,
    complete,
    subscribe: subscribeSubject,
  };
}

/**
 * Create a behavior subject
 *
 * Each observer will receive the last received value by the subject on subscription
 *
 * @return a new behavior subject
 *
 * ## Example
 * ```ts
 * import { createBehaviorSubject } from 'callbag-doki/utils/subject';
 *
 * const mySubject = createBehaviorSubject();
 * mySubject.next(1); // nothing happens because there isn't any subscription
 * mySubject.next(2); // nothing happens because there isn't any subscription
 *
 * const unsubscribe = mySubject.subscribe(value => console.log('Receive value: ', value)); // "Receive value: 2"
 *
 * mySubject.next(3); // "Receive value: 3"
 * mySubject.next(4); // "Receive value: 4"
 * ```
 *
 * @public
 */
function createBehaviorSubject<T>(initialValue: T): Subject<T> {
  const subject = createSubject<T>();
  let lastValue: T = initialValue;

  const subscribeSubject = (listener: Observer<T> | Listener<T>): Unsubscribe => {
    const observer: Observer<T> = typeof listener === 'function' ? { next: listener } : listener;

    observer.next && observer.next(lastValue);

    return subject.subscribe(observer);
  };

  return {
    next: value => {
      lastValue = value;
      subject.next(value);
    },
    error: subject.error,
    complete: subject.complete,
    subscribe: subscribeSubject,
  };
}

/**
 * Create a replay subject
 *
 * Each observer will receive all received values by the subject on subscription
 *
 * @return a new replay subject
 *
 * ## Example
 * ```ts
 * import { createReplaySubject } from 'callbag-doki/utils/subject';
 *
 * const mySubject = createReplaySubject();
 * mySubject.next(1); // nothing happens because there isn't any subscription
 * mySubject.next(2); // nothing happens because there isn't any subscription
 *
 * const unsubscribe = mySubject.subscribe(value => console.log('Receive value: ', value));
 * // "Receive value: 1"
 * // "Receive value: 2"
 *
 * mySubject.next(3); // "Receive value: 3"
 * mySubject.next(4); // "Receive value: 4"
 * ```
 *
 * @public
 */
function createReplaySubject<T>(bufferSize = Infinity): Subject<T> {
  const subject = createSubject<T>();
  const values: T[] = [];

  const subscribeSubject = (listener: Observer<T> | Listener<T>): Unsubscribe => {
    const observer: Observer<T> = typeof listener === 'function' ? { next: listener } : listener;

    if (observer.next) {
      for (let i = 0, l = values.length; i < l; i += 1) {
        observer.next(values[i]);
      }
    }

    return subject.subscribe(observer);
  };

  return {
    next: value => {
      values.push(value);
      if (values.length > bufferSize) {
        values.shift();
      }
      subject.next(value);
    },
    error: subject.error,
    complete: subject.complete,
    subscribe: subscribeSubject,
  };
}

/**
 * Create an async subject
 *
 * Each observer will receive the last value when subject is complete
 *
 * @return a new async subject
 *
 * ## Example
 * ```ts
 * import { createAsyncSubject } from 'callbag-doki/utils/subject';
 *
 * const mySubject = createAsyncSubject();
 * mySubject.next(1); // nothing happens because there isn't any subscription
 * mySubject.next(2); // nothing happens because there isn't any subscription
 *
 * const unsubscribe = mySubject.subscribe({
 *   next: value => console.log('Receive value: ', value),
 *   complete: () => console.log('Subject complete'),
 * });
 *
 * mySubject.next(3); // nothing happens because subject isn't complete
 * mySubject.next(4); // nothing happens because subject isn't complete
 *
 * mySubject.complete();
 * // "Receive value: 4"
 * // "Subject complete"
 * ```
 *
 * @public
 */
function createAsyncSubject<T>(): Subject<T> {
  const subject = createSubject<T>();
  let lastValue: T | undefined = undefined;

  return {
    next: value => {
      lastValue = value;
    },
    error: subject.error,
    complete: () => {
      if (lastValue !== undefined) {
        subject.next(lastValue);
      }
      subject.complete();
    },
    subscribe: subject.subscribe,
  };
}

/**
 * Create a subject which multicast a source
 *
 * The source will start only on the first subscription and will be cancel only when all subscription are canceled
 *
 * @return a behavior subject
 *
 * ## Example
 * ```ts
 * import { createMulticastedSource } from 'callbag-doki/utils/subject';
 * import interval from 'callbag-doki/sources/interval';
 *
 * const multicastedInterval = createMulticastedSource(interval(1000));
 *
 * const unsubscribeFirst = multicastedInterval.subscribe(value => console.log('First receive: ', value)); // start interval
 * const unsubscribeSecond = multicastedInterval.subscribe(value => console.log('Second receive: ', value)); // use the same interval
 *
 * unsubscribeFirst(); // first observable will not receive any value anymore, but interval isn't clear yet
 *
 * unsubscribeSecond(); // second observable will not receive any value anymore and the interval is clear
 * ```
 *
 * @public
 */
function createMulticastedSource<T>(source: Source<T>): Subject<T> {
  const subject = createBehaviorSubject<T | undefined>(undefined);
  let count = 0;
  let unsubscribe: Unsubscribe | undefined;

  const unsubscribeSubject = () => {
    count -= 1;

    if (count === 0 && unsubscribe) {
      unsubscribe();
    }
  };

  const subscribeSubject = (listener: Observer<T> | Listener<T>): Unsubscribe => {
    const observer: Observer<T> = typeof listener === 'function' ? { next: listener } : listener;
    const unsubscribeObserver = subject.subscribe({
      next: observer.next ? value => value !== undefined && observer.next!(value) : undefined,
      error: observer.error,
      complete: observer.complete,
    });
    count += 1;

    if (unsubscribe === undefined) {
      unsubscribe = subscribe(source)(subject);
    }

    return () => {
      unsubscribeObserver();
      unsubscribeSubject();
    };
  };

  return {
    next: subject.next,
    error: subject.error,
    complete: subject.complete,
    subscribe: subscribeSubject,
  };
}

export {
  createSubject,
  createBehaviorSubject,
  createReplaySubject,
  createAsyncSubject,
  createMulticastedSource,
  Subject,
};
