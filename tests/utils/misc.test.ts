import { randomFn } from '../../src/utils/misc';

describe('Confirm tests run correctly', () => {
  test('test 1', () => {
    expect(randomFn()).toBe(2);
  });
});
