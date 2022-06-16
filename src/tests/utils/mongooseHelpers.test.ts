import { filterObject } from '../../utils/mongooseHelpers';

describe('filterObject', () => {
  test('filters fields from object', () => {
    const before = {
      a: 'aaa',
      b: 'bbb',
      c: 'ccc',
    };
    const after = { a: 'aaa' };
    expect(filterObject(before, ['a'])).toEqual(after);
  });
});
