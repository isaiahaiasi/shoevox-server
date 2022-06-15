import * as userController from '../../controllers/userController';
import { getRouterFromRouteData, RouteData } from '../../utils/routeBuilder';

const userRoutes: RouteData<typeof userController> = {
  '/': {
    get: {
      operationId: 'getUsers',
    },
    post: {
      operationId: 'createUser',
    },
  },
  '/:userid': {
    get: {
      operationId: 'getUserById',
    },
  },
};

export default getRouterFromRouteData(userRoutes, userController);
