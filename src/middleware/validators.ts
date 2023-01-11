import { RequestHandler } from 'express';
import { AnyZodObject } from 'zod';

// TODO: Might be smarter to accumulate validation errors in a route,
// then send them all together, like how express-validator works.
// Especially for forms, this seems like a better approach.
export function validate(schema: AnyZodObject) {
  const validationHandler: RequestHandler = (req, res, next) => {
    const { body, query, params } = req;
    schema.parseAsync({ body, query, params })
      .then(() => next())
      .catch((err) => res.status(400).json(err));
  };

  return validationHandler;
}
