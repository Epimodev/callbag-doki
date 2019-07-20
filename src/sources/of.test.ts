import subscribe from '../utils/subscribe';
import of from './of';

describe('sources/of', () => {
  test('should send an event for each param and 1 complete', () => {
    const params = [10, 5, 12, 16, 28];
    const source = of(...params);

    const next = jest.fn();
    const complete = jest.fn();

    subscribe(source)({ next, complete });

    expect(next).toHaveBeenCalledTimes(params.length);
    expect(complete).toHaveBeenCalledTimes(1);
  });
});
