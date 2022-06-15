import { RequestHandler, Router } from 'express';
import { getCleanPathsObject, getOpenApiData } from './apiSpecHelpers';
import { wrapController } from './controllerWrapper';
import { Method } from './typeHelpers';

export interface Controller {
  [key: string]: RequestHandler | RequestHandler[]
}

export interface RouteData<T extends Controller> {
  [key: string]: {
    [key in Method]?: {
      operationId: keyof T
    }
  }
}

type MapRouteDataCallback<T extends Controller> = (
  path: string,
  method: Method,
  operationId: keyof T,
) => void;

function mapRouteData<T extends Controller>(routes: RouteData<T>, fn: MapRouteDataCallback<T>) {
  Object.entries(routes).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, { operationId }]) => {
      fn(path, method as Method, operationId);
    });
  });
}

/**
 * Takes a route data object and a Controller group and creates a route.
 * Wraps controllers so that thrown errors are passed to express error handlers.
 */
export function getRouterFromRouteData<T extends Controller>(
  routeData: RouteData<T>,
  controller: T,
) {
  const router = Router();

  mapRouteData(routeData, (path, method, operationId) => {
    const requestHandler = controller[operationId];

    if (requestHandler) {
      router[method](path, wrapController(requestHandler));
    }
  });

  return router;
}

export function getOpenApiRouter(apiDataPath: string, controller: Controller) {
  const data = getOpenApiData(apiDataPath);
  const paths = getCleanPathsObject(data.paths) as unknown;
  return getRouterFromRouteData(paths as RouteData<typeof controller>, controller);
}
