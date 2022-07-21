import { apiSpec, OperationId } from '@isaiahaiasi/voxelatlas-spec';
import { requests } from '@isaiahaiasi/voxelatlas-spec/public/zSchemas';
import { RequestHandler, Router } from 'express';
import { validate } from '../middleware/validators';
import { getCleanPathsObject } from './apiSpecHelpers';
import { wrapController } from './controllerWrapper';
import { Method } from './typeHelpers';

export interface Controller {
  [key: string]: RequestHandler | RequestHandler[]
}

export interface RouteData<OpId> {
  [key: string]: {
    [key in Method]?: {
      operationId: OpId
    }
  }
}

type MapRouteDataCallback<T extends Controller> = (
  path: string,
  method: Method,
  operationId: keyof T,
) => void;

function mapRouteData<O extends string, T extends Controller>(
  routes: RouteData<O>,
  fn: MapRouteDataCallback<T>,
) {
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
export function getRouterFromRouteData<O extends string, T extends Controller>(
  routeData: RouteData<O>,
  controller: T,
) {
  const router = Router();

  mapRouteData(routeData, (path, method, operationId) => {
    let requestHandler = controller[operationId];

    if (!requestHandler) {
      return;
    }

    const validationSchema = requests[operationId as OperationId];

    if (validationSchema) {
      if (requestHandler instanceof Array) {
        requestHandler.unshift(validate(validationSchema));
      } else {
        requestHandler = [validate(validationSchema), requestHandler];
      }
    }

    router[method](path, wrapController(requestHandler));
  });

  return router;
}

export function getOpenApiRouter(controller: Controller) {
  const paths = getCleanPathsObject(apiSpec.paths);
  return getRouterFromRouteData<OperationId, typeof controller>(paths, controller);
}
