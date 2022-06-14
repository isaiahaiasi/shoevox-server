import { routeBuilder, RouteData } from '../../src/utils/routeBuilder';

jest.mock('express', () => ({
  Router: () => ({
    get: jest.fn((a: any) => a),
  }),
}));

describe('routeBuilder', () => {
  // Not sure how to handle all the dependencies...
  test('Created route produces controllers for given route', () => {
    const controller = {
      operation1: jest.fn(),
    };
    const routeDescription:RouteData<typeof controller>[] = [{
      path: '/',
      method: 'get',
      operationId: 'operation1',
    }];

    const router = routeBuilder(routeDescription, controller);
    const get = router.get as jest.Mock;
    const [path] = get.mock.calls[0];

    expect(path).toBe('/');
  });

  test('Controller "operations" are assigned by operationId in route description', () => {
    const controller = {
      operation1: jest.fn(),
    };
    const routeDescription:RouteData<typeof controller>[] = [{
      path: '/',
      method: 'get',
      operationId: 'operation1',
    }];

    const router = routeBuilder(routeDescription, controller);
    const get = router.get as jest.Mock;
    const [, routeController] = get.mock.calls[0];
    routeController('a', 'b', 'c');

    expect(controller.operation1.mock.calls[0][0]).toBe('a');
    expect(controller.operation1.mock.calls[0][1]).toBe('b');
    expect(controller.operation1.mock.calls[0][2]).toBe('c');
  });
});
