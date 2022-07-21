import { RequestHandler } from 'express';
import { AnyZodObject } from 'zod';

export function validate(schema: AnyZodObject) {
  const validationHandler: RequestHandler = (req, res, next) => {
    const { body, query, params } = req;
    schema.parseAsync({ body, query, params })
      .then(() => next())
      .catch((err) => res.status(400).json(err));
  };

  return validationHandler;
}
