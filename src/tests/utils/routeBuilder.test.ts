import { getRouterFromRouteData, RouteData } from '../../utils/routeBuilder';

// Not sure how to handle all the dependencies...
jest.mock('express', () => ({
  Router: () => ({
    get: jest.fn((a: any) => a),
    patch: jest.fn((a: any) => a),
  }),
}));

describe('routeBuilder', () => {
  test('Created route produces controllers for given route', () => {
    const controller = {
      operation1: jest.fn(),
    };
    const routeDescription = {
      '/': {
        get: {
          operationId: 'operation1',
        },
      },
    };

    const router = getRouterFromRouteData(routeDescription, controller);
    const get = router.get as jest.Mock;
    const [path] = get.mock.calls[0];

    expect(path).toBe('/');
  });

  test('Controller "operations" are assigned by operationId in route description', () => {
    const controller = {
      operation1: jest.fn(),
    };
    const routeDescription: RouteData<'operation1'> = {
      '/': {
        get: {
          operationId: 'operation1',
        },
      },
    };

    const router = getRouterFromRouteData(routeDescription, controller);
    const get = router.get as jest.Mock;
    const [, routeController] = get.mock.calls[0];
    routeController('a', 'b', 'c');

    expect(controller.operation1.mock.calls[0][0]).toBe('a');
    expect(controller.operation1.mock.calls[0][1]).toBe('b');
    expect(controller.operation1.mock.calls[0][2]).toBe('c');
  });

  // Need to handle this even though Typings *should* make this impossible,
  // especially if I generate routes from OpenAPI doc, in which case the typings are irrelevant.
  test('Route is not added if [operationId] is not implemented on Controller', () => {
    const controller = {};
    const routeDescription = {
      '/nothandledyet': {
        patch: {
          operationId: 'handleNotHandledYet',
        },
      },
    };

    /* @ts-ignore */
    const router = getRouterFromRouteData(routeDescription, controller);
    const patch = router.patch as jest.Mock;

    expect(patch.mock.calls).toHaveLength(0);
  });
});
