import { RequestHandler, Router } from 'express';

export interface RouteData {
  method: 'post' | 'get' | 'put' | 'patch' | 'delete';
  path: string;
  requestHandler: RequestHandler;
}

export function routeBuilder(routes: RouteData[]) {
  const router = Router();

  routes.forEach(({ method, path, requestHandler }) => {
    router[method](path, requestHandler);
  });

  return router;
}
