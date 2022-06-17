import { createGenericServerError, createNotImplementedError, createResourceNotFoundError } from '../../utils/errorResponse';

// TODO?: Might need to rethink my approach to these tests,
// This feels like too much knowledge of implementation is required.

describe('createNotImplementedError', () => {
  test('returns error object in expected shape', () => {
    const method = 'PATCH';
    const fullPath = '/endpoint/to/fake/resource';

    const expectedError = {
      status: 501,
      msg: 'PATCH/endpoint/to/fake/resource has not been implemented yet!',
    };

    expect(createNotImplementedError({ method, fullPath })).toEqual(expectedError);
  });
});

describe('createResourceNotFoundError', () => {
  test('returns error object in expected shape', () => {
    const input = {
      resource: 'USER',
      fullPath: '/endpoint/fafefa',
      identifier: 'bleh',
    };

    const expectedError = {
      status: 404,
      msg: 'Could not find USER bleh at /endpoint/fafefa',
    };

    expect(createResourceNotFoundError(input)).toEqual(expectedError);
  });
});

describe('createGenericServerError', () => {
  test('returns error object in expected shape (given identifier)', () => {
    const input = Object.freeze({
      method: 'GET',
      resource: 'COMMENT',
      identifier: 'abc',
    });

    const expectedError = {
      status: 500,
      msg: 'Could not GET COMMENT abc',
    };

    expect(createGenericServerError(input)).toEqual(expectedError);
  });

  test('returns error object in expected shape (no identifier)', () => {
    const input = Object.freeze({
      method: 'POST',
      resource: 'doggo',
    });

    const expectedError = {
      status: 500,
      msg: 'Could not POST doggo',
    };

    expect(createGenericServerError(input)).toEqual(expectedError);
  });
});
