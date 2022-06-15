import { getCleanPathsObject, getMethodsFromPath } from '../../src/utils/apiSpecHelpers';

describe('getMethodsFromPath', () => {
  test(
    'getMethodsFromPath should preserve return the same object without "parameters" property',
    () => {
      const before = {
        parameters: {
          param1: 'abc',
          param2: 123,
        },
        get: { operationId: 'getTest' },
        post: { operationId: 'postTest' },
      };
      const after = {
        get: { operationId: 'getTest' },
        post: { operationId: 'postTest' },
      };

      expect(getMethodsFromPath(before)).toEqual(after);
    },
  );
});

describe('getCleanPathsObject', () => {
  test(
    'should return the same object but with every path cleaned',
    () => {
      const before = {
        '/path1': {
          parameters: { param1: 'abc' },
          get: { operationId: 'getTest' },
          post: { operationId: 'postTest' },
        },
        '/path2': {
          parameters: { param1: '123' },
          get: { operationId: 'getPath2Test' },
          post: { operationId: 'postPath2Test' },
        },
      };
      const after = {
        '/path1': {
          get: { operationId: 'getTest' },
          post: { operationId: 'postTest' },
        },
        '/path2': {
          get: { operationId: 'getPath2Test' },
          post: { operationId: 'postPath2Test' },
        },
      };

      expect(getCleanPathsObject(before)).toEqual(after);
    },
  );

  test('should transform route params to match Express format (param ends path)', () => {
    const beforePath = '/users/{userid}';
    const afterPath = '/users/:userid';

    const before = {
      [beforePath]: {
        get: { operationId: 'getTest' },
      },
    };
    const after = {
      [afterPath]: {
        get: { operationId: 'getTest' },
      },
    };

    expect(getCleanPathsObject(before)).toEqual(after);
  });

  test('should transform route params to match Express format (param does not end path)', () => {
    const beforePath = '/users/{userid}/blah';
    const afterPath = '/users/:userid/blah';

    const before = {
      [beforePath]: {
        get: { operationId: 'getTest' },
      },
    };
    const after = {
      [afterPath]: {
        get: { operationId: 'getTest' },
      },
    };

    expect(getCleanPathsObject(before)).toEqual(after);
  });

  test('should transform route params to match Express format (multiple params)', () => {
    const beforePath = '/users/{userid}/blah/{friendshipid}';
    const afterPath = '/users/:userid/blah/:friendshipid';

    const before = {
      [beforePath]: {
        get: { operationId: 'getTest' },
      },
    };
    const after = {
      [afterPath]: {
        get: { operationId: 'getTest' },
      },
    };

    expect(getCleanPathsObject(before)).toEqual(after);
  });
});
