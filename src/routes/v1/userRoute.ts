import { getUsers } from '../../controllers/userController';
import { routeBuilder, RouteData } from '../../utils/routeBuilder';

const userRoutes: RouteData[] = [
  {
    path: '/',
    method: 'get',

    // TODO: might replace with 'operationId',
    // and use that to index into a singular UserControllers object
    // for better integration with OpenAPI spec document.
    requestHandler: getUsers,
  },
];

export default routeBuilder(userRoutes);
