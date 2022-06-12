import { Router } from 'express';
import userRoute from './userRoute';

// TODO: use the OpenAPI spec to dynamically build the whole router structure?...

const router = Router();

const defaultRoutes = [
  {
    path: '/users',
    route: userRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

// Optionally, could load a second list of routes conditionally.
// Eg, a devRoutes list with API documentation if NODE_ENV == 'development'

export default router;
