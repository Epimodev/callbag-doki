import subscribe from '../utils/subscribe';
import of from './of';

describe('of', () => {
  test('should send an event for each param and 1 complete', () => {
    const params = [10, 5, 12, 16, 28];
    const source = of(...params);

    const next = jest.fn();
    const complete = jest.fn();

    subscribe(source)({ next, complete });

    expect(next.mock.calls.length).toBe(params.length);
    expect(complete.mock.calls.length).toBe(1);
  });
});
