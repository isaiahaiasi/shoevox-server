import { createGenericServerError, createNotImplementedError, createResourceNotFoundError } from '../../utils/errorResponse';

describe('createNotImplementedError', () => {
  test('returns error with expected message', () => {
    const method = 'PATCH';
    const originalUrl = '/endpoint/to/fake/resource';

    const expectedMsg = 'PATCH /endpoint/to/fake/resource has not been implemented yet!';

    expect(
      createNotImplementedError({ method, originalUrl }).message,
    ).toEqual(expectedMsg);
  });
});

describe('createResourceNotFoundError', () => {
  test('returns error with expected message', () => {
    const input = {
      idName: 'USER',
      originalUrl: '/endpoint/fafefa',
      id: 'bleh',
    };

    // eslint-disable-next-line no-useless-escape
    const expectedMsg = 'Could not find USER \"bleh\" at /endpoint/fafefa';

    expect(createResourceNotFoundError(input).message).toEqual(expectedMsg);
  });
});

describe('createGenericServerError', () => {
  test('returns error with expected message (given identifier)', () => {
    const input = Object.freeze({
      method: 'GET',
      idName: 'COMMENT',
      id: 'abc',
    });

    const expectedMsg = 'Could not GET COMMENT abc';
    expect(createGenericServerError(input).message).toEqual(expectedMsg);
  });

  test('returns error with expected message (no identifier)', () => {
    const input = Object.freeze({
      method: 'POST',
      idName: 'doggo',
    });

    const expectedMsg = 'Could not POST doggo';

    expect(createGenericServerError(input).message).toEqual(expectedMsg);
  });
});
