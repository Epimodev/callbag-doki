import { Source, Listener, Observer, Unsubscribe } from '../index';
import subscribe from './subscribe';

interface Subject<T> {
  subscribe: (listener: Observer<T> | Listener<T>) => Unsubscribe;
  next: (value: T) => void;
  error: (error?: any) => void;
  complete: () => void;
}

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

function createBehaviorSubject<T>(): Subject<T> {
  const subject = createSubject<T>();
  let lastValue: T | undefined = undefined;

  const subscribeSubject = (listener: Observer<T> | Listener<T>): Unsubscribe => {
    const observer: Observer<T> = typeof listener === 'function' ? { next: listener } : listener;

    if (lastValue !== undefined) {
      observer.next && observer.next(lastValue);
    }

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

function createReplaySubject<T>(): Subject<T> {
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
      subject.next(value);
    },
    error: subject.error,
    complete: subject.complete,
    subscribe: subscribeSubject,
  };
}

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

function createMulticastedSource<T>(source: Source<T>): Subject<T> {
  const subject = createBehaviorSubject<T>();
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
    const unsubscribeObserver = subject.subscribe(observer);
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
