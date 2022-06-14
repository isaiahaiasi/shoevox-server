import { RequestHandler, Router } from 'express';
import { wrapController } from './controllerWrapper';

export interface Controller {
  [key: string]: RequestHandler | RequestHandler[]
}

export interface RouteData<T extends Controller> {
  // Methods supported by OpenAPI 3.0
  // ('connect' is NOT a supported method)
  method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options' | 'trace';
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
