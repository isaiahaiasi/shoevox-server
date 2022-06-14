import { RequestHandler, Router } from 'express';
import { wrapController } from './controllerWrapper';
import { Method } from './typeHelpers';

export interface Controller {
  [key: string]: RequestHandler | RequestHandler[]
}

export interface RouteData<T extends Controller> {
  method: Method;
  path: string;
  operationId: keyof T;
}

/**
 * Takes a route data object and a Controller group and creates a route.
 * Wraps controllers so that thrown errors are passed to express error handlers.
 */
export function routeBuilder<T extends Controller>(routes: RouteData<T>[], controller: T) {
  const router = Router();

  routes.forEach(({ method, path, operationId }) => {
    const requestHandler = controller[operationId];
    router[method](path, wrapController(requestHandler));
  });

  return router;
}
