import { getMethodsFromPath, stripParametersFromPathsObject } from '../../src/utils/apiSpecHelpers';

describe('apiSpecLoaders', () => {
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

  describe('stripParametersFromPathsObject', () => {
    test(
      'stripParametersFromPathsObject should return the same object but with every path cleaned',
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

        expect(stripParametersFromPathsObject(before)).toEqual(after);
      },
    );
  });
});
