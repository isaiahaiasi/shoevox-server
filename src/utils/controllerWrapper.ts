import { RequestHandler } from 'express';

// Wraps controller in a try/catch and passes to next()
// NOTE: This is handled automatically for async functions in express 5.0
export function wrapController(controller: RequestHandler) {
  const wrappedController: RequestHandler = async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (err) {
      next(err);
    }
  };

  return wrappedController;
}
