import { RequestHandler, Router } from 'express';

export interface Controller {
  [key: string]: RequestHandler
}

export interface RouteData<T extends Controller> {
  // Methods supported by OpenAPI 3.0
  // ('connect' is NOT a supported method)
  method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options' | 'trace';
  path: string;
  operationId: keyof T;
}

export function routeBuilder<T extends Controller>(routes: RouteData<T>[], controller: T) {
  const router = Router();

  routes.forEach(({ method, path, operationId }) => {
    const requestHandler = controller[operationId];
    router[method](path, requestHandler);
  });

  return router;
}
