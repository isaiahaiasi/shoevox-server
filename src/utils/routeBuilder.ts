import { operations, OperationId } from '@isaiahaiasi/voxelatlas-spec';
import { HttpMethod } from '@isaiahaiasi/voxelatlas-spec/public/commonTypes';
import { requests } from '@isaiahaiasi/voxelatlas-spec/public/zSchemas';
import { RequestHandler, Router } from 'express';
import { validate } from '../middleware/validators';
import { wrapController } from './controllerWrapper';

export interface Controller {
  [key: string]: RequestHandler | RequestHandler[]
}

interface OperationInfo {
  method: HttpMethod
  path: string;
}

export type RouteData<OpId extends string> = {
  [K in OpId]: OperationInfo;
};

/**
 * Takes a route data object and a Controller group and creates a route.
 * Wraps controllers so that thrown errors are passed to express error handlers.
 */
export function getRouterFromRouteData<O extends string>(
  routeData: RouteData<O>,
  controller: Controller,
) {
  const router = Router();

  Object.entries(routeData).forEach(([operationId, operationInfo]) => {
    const { method, path } = operationInfo as OperationInfo;

    let requestHandler = controller[operationId];

    if (!requestHandler) {
      console.warn(`NOT IMPLEMENTED: ${operationId}`);
      return;
    }

    // If there's a zod schema for the incoming request preface controller with validator middleware
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
  return getRouterFromRouteData<OperationId>(operations, controller);
}
