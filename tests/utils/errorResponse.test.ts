import { createNotImplementedError } from '../../src/utils/errorResponse';

describe('createNotImplementedError', () => {
  test('returns error object in expected shape', () => {
    // TODO?: This feels like too much knowledge of implementation is required...
    const method = 'PATCH';
    const fullPath = '/endpoint/to/fake/resource';

    const expectedError = {
      status: 404,
      msg: 'PATCH/endpoint/to/fake/resource has not been implemented yet!',
    };

    expect(createNotImplementedError({ method, fullPath })).toEqual(expectedError);
  });
});
