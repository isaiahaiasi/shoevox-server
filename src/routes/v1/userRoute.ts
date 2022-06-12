import * as userController from '../../controllers/userController';
import { routeBuilder, RouteData } from '../../utils/routeBuilder';

const userRoutes: RouteData<typeof userController>[] = [
  {
    path: '/',
    method: 'get',
    operationId: 'getUsers',
  },
  {
    path: '/:userid',
    method: 'get',
    operationId: 'getUserById',
  },
];

export default routeBuilder(userRoutes, userController);
