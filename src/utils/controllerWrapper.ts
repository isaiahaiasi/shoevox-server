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

// Wraps controller in a try/catch and passes to next()
// NOTE: This is handled automatically for async functions in express 5.0
export function wrapController(controller: RequestHandler | RequestHandler[]) {
  return Array.isArray(controller) ? wrapHandlers(controller) : wrapHandler(controller);
}
