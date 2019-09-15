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

function createMulticastedSource<T>(source: Source<T>): Subject<T> {
  const observers: Observer<T>[] = [];
  let unsubscribe: Unsubscribe | undefined;
  let value: T | undefined;

  const next = (newValue: T) => {
    value = newValue;
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

  const subscribeSource = (): Unsubscribe => {
    return subscribe(source)({ next, error, complete });
  };

  const unsubscribeSubject = (observer: Observer<T>) => {
    const index = observers.indexOf(observer);
    observers.splice(index, 1);

    if (observers.length === 0 && unsubscribe) {
      unsubscribe();
      unsubscribe = undefined;
    }
  };

  const subscribeSubject = (listener: Observer<T> | Listener<T>): Unsubscribe => {
    const observer: Observer<T> = typeof listener === 'function' ? { next: listener } : listener;

    if (value !== undefined) {
      observer.next && observer.next(value);
    }

    observers.push(observer);

    if (unsubscribe === undefined) {
      unsubscribe = subscribeSource();
    }

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

export { createSubject, createMulticastedSource, Subject };
