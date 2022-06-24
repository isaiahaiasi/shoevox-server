import {
  deserializeTimestampCursor,
  getNextLink,
  getPaginationLinks,
  getPaginationParams,
  // eslint-disable-next-line @typescript-eslint/comma-dangle
  serializeTimestampCursor
} from '../../utils/paginationHelpers';

describe('getPaginationParams', () => {
  test('returns limit and cursor from Request\'s query params', () => {
    const limit = '30';
    const cursor = '12345';
    const req = { query: { limit, cursor } };

    expect(getPaginationParams(req, 1)).toEqual({ limit: 30, cursor: '12345' });
  });

  test('returns default limit if no limit is provided', () => {
    const req = { query: {} };

    expect(getPaginationParams(req, 3).limit).toBe(3);
  });

  test('returns default limit if provided limit is not numeric', () => {
    const req = { query: { limit: 'abc' } };

    expect(getPaginationParams(req, 500).limit).toBe(500);
  });

  test('returns undefined cursor if no cursor provided', () => {
    const req = { query: {} };

    expect(getPaginationParams(req, 0).cursor).toBeUndefined();
  });
});

describe('getNextLink', () => {
  test('returns expected result', () => {
    const href = 'http://test.com/v1/resource?cursor=abcd1234&limit=20';
    const url = 'http://test.com/v1/resource';
    const cursor = 'abcd1234';
    const limit = 20;

    expect(getNextLink(url, cursor, limit)).toEqual({ href });
  });

  test('undefined cursor is not included in query output', () => {
    const url = 'http://test.com/v1/resource';
    const href = 'http://test.com/v1/resource?limit=3';

    expect(getNextLink(url, undefined, 3)).toEqual({ href });
  });

  test('handles array-based cursor (of length 1)', () => {
    const href = 'https://testing.com/resource?cursor=lmno&limit=5';
    const url = 'https://testing.com/resource';
    const cursor = ['lmno'];
    const limit = 5;

    expect(getNextLink(url, cursor, limit)).toEqual({ href });
  });

  test('handles array-based cursor (of length >1)', () => {
    const href = 'https://testing.com/resource?cursor=abcd%2C1234&limit=5';
    const url = 'https://testing.com/resource';
    const cursor = ['abcd', 1234];
    const limit = 5;

    expect(getNextLink(url, cursor, limit)).toEqual({ href });
  });
});

describe('getPaginationLinks', () => {
  test('happy path', () => {
    const data = [
      { createdAt: '2022-04-13T07:21:24.519Z', id: 1 },
      { createdAt: '2022-05-13T07:21:24.519Z', id: 2 },
      { createdAt: '2022-06-13T07:21:24.519Z', id: 2 },
    ];
    const url = 'gopher://mysite.com/resource';
    const limit = 3;
    const getCursor = (obj: any) => [obj.id, obj.createdAt];

    expect(getPaginationLinks(data, url, limit, getCursor)).toEqual({
      next: {
        href: 'gopher://mysite.com/resource?cursor=2%2C2022-06-13T07%3A21%3A24.519Z&limit=3',
      },
    });
  });

  test('only creates `next` link if limit === data.length', () => {
    const data = [
      { createdAt: '2022-04-13T07:21:24.519Z' },
    ];
    const url = 'gopher://mysite.com';
    const limit = 3;
    const getCursor = (obj: any) => [obj.createdAt];

    expect(getPaginationLinks(data, url, limit, getCursor)).toEqual({});
  });
});

describe('serializeTimestampCursor', () => {
  test('happy path', () => {
    const createdAt = new Date();
    const id = 1234;
    const refObj = { createdAt, id };
    const expectedOut = [createdAt.toISOString(), id];

    expect(serializeTimestampCursor(refObj)).toEqual(expectedOut);
  });

  test('handles undefined id', () => {
    const createdAt = new Date();
    const refObj = { createdAt, id: undefined };
    const expectedOut = [createdAt.toISOString(), undefined];

    expect(serializeTimestampCursor(refObj)).toEqual(expectedOut);
  });

  test('handles string date', () => {
    const createdAt = '2022-06-13T07:21:24.517Z';
    const id = 1234;
    const refObj = { createdAt, id };
    const expectedOut = [createdAt, id];

    expect(serializeTimestampCursor(refObj)).toEqual(expectedOut);
  });

  test('handles number date', () => {
    const dateStr = '2022-06-13T07:21:24.517Z';
    const createdAt = new Date(dateStr).valueOf();
    const id = 1234;
    const refObj = { createdAt, id };
    const expectedOut = [dateStr, id];

    expect(serializeTimestampCursor(refObj)).toEqual(expectedOut);
  });
});

describe('deserializeTimestampCursor', () => {
  test('happy path', () => {
    // Input should already be un-encoded
    const rawCursor = '2022-06-13T07:21:24.517Z,b7c8ceb673e30bab9aa5aa6f';

    expect(deserializeTimestampCursor(rawCursor)).toEqual([
      { field: 'createdAt', order: 'desc', value: new Date('2022-06-13T07:21:24.517Z') },
      { field: '_id', value: 'b7c8ceb673e30bab9aa5aa6f' },
    ]);
  });

  test('handles undefined rawCursor', () => {
    expect(deserializeTimestampCursor()).toEqual([
      { field: 'createdAt', order: 'desc' },
      { field: '_id' },
    ]);
  });

  test('handles rawCursor without comma', () => {
    const rawCursor = '2022-06-13T07:21:24.517Z';

    expect(deserializeTimestampCursor(rawCursor)).toEqual([
      { field: 'createdAt', value: new Date('2022-06-13T07:21:24.517Z'), order: 'desc' },
      { field: '_id' },
    ]);
  });

  test('handles rawCursor where createdAt is not valid date', () => {
    const rawCursor = '2022-067:21:24.517Z,b7c8ceb673e30bab9aa5aa6f';

    expect(() => deserializeTimestampCursor(rawCursor)).toThrow();
  });
});
