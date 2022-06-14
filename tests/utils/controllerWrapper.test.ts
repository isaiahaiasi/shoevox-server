import { wrapController } from '../../src/utils/controllerWrapper';

describe('wrapController', () => {
  test('thrown error from controller is caught and passed to next()', () => {
    const err = Error('borked!');
    const next = jest.fn();
    const brokenController = () => {
      throw err;
    };

    const wrappedController = wrapController(brokenController);
    wrappedController(null as any, null as any, next);

    expect(next.mock.calls[0][0]).toBe(err);
  });

  test.todo('works for async functions');
});
