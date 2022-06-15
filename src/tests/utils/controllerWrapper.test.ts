import { wrapController } from '../../utils/controllerWrapper';

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

  test('works for async functions', async () => {
    const err = Error('borked!');
    const next = jest.fn();
    const brokenController = async () => {
      await Promise.resolve();
      throw err;
    };

    const wrappedController = wrapController(brokenController);

    await wrappedController(null as any, null as any, next);

    expect(next.mock.calls[0][0]).toBe(err);
  });

  test('works if controller is an array of requestHandlers (fails first handler)', () => {
    const err = Error('borked!');
    const next = jest.fn();
    const brokenController = () => {
      throw err;
    };

    const wrappedController = wrapController([brokenController, brokenController]);

    wrappedController[0](null as any, null as any, next);

    expect(next.mock.calls[0][0]).toBe(err);
  });
  test('works if controller is an array of requestHandlers (fails second handler)', () => {
    const err = Error('borked!');
    const next = jest.fn();
    const brokenController = () => {
      throw err;
    };

    const wrappedController = wrapController([brokenController, brokenController]);

    for (let i = 0; i < wrappedController.length; i++) {
      wrappedController[i](null as any, null as any, next);
    }

    expect(next.mock.calls[1][0]).toBe(err);
  });
});
