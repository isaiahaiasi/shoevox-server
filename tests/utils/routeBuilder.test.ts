import { routeBuilder, RouteData } from '../../src/utils/routeBuilder';

jest.mock('express', () => ({
  Router: () => ({
    get: jest.fn(),
  }),
}));

describe('routeBuilder', () => {
  test('Operations are correctly assigned by operationId in route description object', () => {
    const controller = {
      operation1: () => {},
      operation2: () => {},
    };
    const routeDescription:RouteData<typeof controller>[] = [{
      path: '/',
      method: 'get',
      operationId: 'operation1',
    }];

    const router = routeBuilder(routeDescription, controller);
    const get = router.get as jest.Mock;
    const [arg1, arg2] = get.mock.calls[0];

    expect(arg1).toBe('/');
    expect(arg2).toBe(controller.operation1);
  });
});
