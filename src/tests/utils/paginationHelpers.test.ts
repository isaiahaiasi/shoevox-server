import { URLSearchParams } from 'url';
import {
  deserializeTimestampCursor,
  getNextLink,
  getPaginationLinks,
  getPaginationParams,
  serializeTimestampCursor,
} from '../../utils/paginationHelpers';

function getQueryParams(url: string) {
  return Object.fromEntries(
    new URLSearchParams(url.split('?')[1]).entries(),
  );
}

describe('getPaginationParams', () => {
  test('returns limit and cursor from Request\'s query params', () => {
    const limit = '30';
    const cursor = '12345';
    const query = { limit, cursor };

    expect(getPaginationParams(query, 1)).toEqual({ limit: 30, cursor: '12345' });
  });

  test('returns fallback limit if no limit is provided', () => {
    const query = {};

    expect(getPaginationParams(query, 3).limit).toBe(3);
  });

  test('returns default limit if provided limit is not numeric', () => {
    const query = { limit: 'abc' };

    expect(getPaginationParams(query, 500).limit).toBe(500);
  });

  test('returns null cursor if no cursor provided', () => {
    const query = {};

    expect(getPaginationParams(query, 0).cursor).toBeNull();
  });
});

describe('getNextLink', () => {
  test('returns cursor and href with the query parameters included', () => {
    const url = 'http://test.com/v1/resource';
    const cursor = 'abcd1234';
    const limit = 20;

    const result = getNextLink(url, cursor, limit);

    expect(result.cursor).toEqual(cursor);

    expect(getQueryParams(result.href)).toEqual({ cursor: 'abcd1234', limit: '20' });
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
    const getCursor = (obj: any) => [obj.id, obj.createdAt].join(',');

    const result = getPaginationLinks(data, url, limit, getCursor);

    expect(result.next.cursor).toEqual('2,2022-06-13T07:21:24.519Z');
    expect(getQueryParams(result.next.href)).toEqual({
      cursor: decodeURIComponent('2%2C2022-06-13T07%3A21%3A24.519Z'),
      limit: '3',
    });
  });

  test('only creates `next` link if limit === data.length', () => {
    const data = [
      { createdAt: '2022-04-13T07:21:24.519Z' },
    ];
    const url = 'gopher://mysite.com';
    const limit = 3;
    const getCursor = (obj: any) => obj.createdAt;

    expect(getPaginationLinks(data, url, limit, getCursor)).toEqual({});
  });
});

describe('serializeTimestampCursor', () => {
  test('happy path', () => {
    const createdAt = new Date();
    const id = 1234;
    const refObj = { createdAt, id };
    const expectedOut = [createdAt.toISOString(), id].map(encodeURIComponent).join();

    expect(serializeTimestampCursor(refObj)).toEqual(expectedOut);
  });

  test('handles string date', () => {
    const createdAt = '2022-06-13T07:21:24.517Z';
    const id = 1234;
    const refObj = { createdAt, id };
    const expectedOut = [createdAt, id].map(encodeURIComponent).join();

    expect(serializeTimestampCursor(refObj)).toEqual(expectedOut);
  });

  test('handles numeric date', () => {
    const dateStr = '2022-06-13T07:21:24.517Z';
    const createdAt = new Date(dateStr).valueOf();
    const id = 1234;
    const refObj = { createdAt, id };
    const expectedOut = [dateStr, id].map(encodeURIComponent).join();

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
    expect(deserializeTimestampCursor(null)).toEqual([
      { field: 'createdAt', order: 'desc', value: null },
      { field: '_id', value: null },
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
