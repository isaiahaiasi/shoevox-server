import { RequestHandler } from 'express';

function wrapHandler(handler: RequestHandler) {
  const wrappedController: RequestHandler = async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (err) {
      next(err);
    }
  };

  return wrappedController;
}

function wrapHandlers(handlers: RequestHandler[]) {
  return handlers.map(wrapHandler);
}

// Exports several signatures so that callers can know which subtype they're getting.
type Controller = RequestHandler | RequestHandler[];
export function wrapController(controller: RequestHandler): RequestHandler;
export function wrapController(controller: RequestHandler[]): RequestHandler[];
export function wrapController(controller: Controller): Controller;

// Wraps controller in a try/catch and passes to next()
// NOTE: This is handled automatically for async functions in express 5.0
export function wrapController(controller: Controller) {
  if (Array.isArray(controller)) {
    return wrapHandlers(controller);
  }
  return wrapHandler(controller);
}
