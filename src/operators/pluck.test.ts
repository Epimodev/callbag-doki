import subscribe from '../utils/subscribe';
import pluck from './pluck';
import { intervalValues } from '../test/callbags';

interface TestValue {
  label: string;
  value: {
    id: number;
    name: string;
    location: {
      country: string;
      city: string;
    };
  };
}

const values: TestValue[] = [
  { label: 'a', value: { id: 1, name: 'A', location: { city: 'cityA', country: 'countryA' } } },
  { label: 'b', value: { id: 2, name: 'B', location: { city: 'cityB', country: 'countryB' } } },
  { label: 'c', value: { id: 3, name: 'C', location: { city: 'cityC', country: 'countryC' } } },
  { label: 'd', value: { id: 4, name: 'D', location: { city: 'cityD', country: 'countryD' } } },
  { label: 'e', value: { id: 5, name: 'E', location: { city: 'cityE', country: 'countryE' } } },
];

describe('operators/pluck', () => {
  test('should receive a message for each value from source', done => {
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = pluck<TestValue, 'label'>('label')(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).toBeCalledTimes(values.length);

      done();
    }, 300);
  });

  test('should complete at the end of the source', done => {
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = pluck<TestValue, 'label'>('label')(source);
    const complete = jest.fn();

    subscribe(transformedSource)({ complete });

    setTimeout(() => {
      expect(complete).toBeCalledTimes(1);

      done();
    }, 300);
  });

  test('should failed if source fail', done => {
    const source = intervalValues({ values, duration: 50, willFail: true });
    const transformedSource = pluck<TestValue, 'label'>('label')(source);
    const error = jest.fn();

    subscribe(transformedSource)({ error });

    setTimeout(() => {
      expect(error).toBeCalledTimes(1);

      done();
    }, 100);
  });

  test('should cancel source on unsubscribe', () => {
    const cancelMock = jest.fn();
    const source = intervalValues({ values, duration: 50, cancelMock });
    const transformedSource = pluck<TestValue, 'label'>('label')(source);

    const unsubscribe = subscribe(transformedSource)({});
    unsubscribe();

    expect(cancelMock).toBeCalledTimes(1);
  });

  test('send each value from key', done => {
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = pluck<TestValue, 'label'>('label')(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).nthCalledWith(1, 'a');
      expect(next).nthCalledWith(2, 'b');
      expect(next).nthCalledWith(3, 'c');
      expect(next).nthCalledWith(4, 'd');
      expect(next).nthCalledWith(5, 'e');

      done();
    }, 300);
  });

  test('send each value from sub key', done => {
    const source = intervalValues({ values, duration: 50 });
    const transformedSource = pluck<TestValue, 'value', 'location', 'city'>(
      'value',
      'location',
      'city',
    )(source);
    const next = jest.fn();

    subscribe(transformedSource)({ next });

    setTimeout(() => {
      expect(next).nthCalledWith(1, 'cityA');
      expect(next).nthCalledWith(2, 'cityB');
      expect(next).nthCalledWith(3, 'cityC');
      expect(next).nthCalledWith(4, 'cityD');
      expect(next).nthCalledWith(5, 'cityE');

      done();
    }, 300);
  });
});
