import * as userController from '../../controllers/userController';
import { routeBuilder, RouteData } from '../../utils/routeBuilder';

// TODO: Restructure to match OpenAPI a bit more & also remove redundancy
// [{ path: [{ method, operationId }] }]
const userRoutes: RouteData<typeof userController>[] = [
  {
    path: '/',
    method: 'get',
    operationId: 'getUsers',
  },
  {
    path: '/',
    method: 'post',
    operationId: 'createUser',
  },
  {
    path: '/:userid',
    method: 'get',
    operationId: 'getUserById',
  },
];

export default routeBuilder(userRoutes, userController);
