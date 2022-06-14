import { RequestHandler } from 'express';
import { body, validationResult } from 'express-validator';

type ValidatorInput = (keyof typeof validators)[];

const validators = {
  username: body('username').trim().isLength({ min: 3, max: 15 }),
  password: body('password').isLength({ min: 8 }).custom(
    (value, { req }) => {
      if (value !== req.body.passwordConfirm) {
        throw new Error('Passwords must match!');
      } else {
        return true;
      }
    },
  ),
};

const validationResolver: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // TODO: Proper Error data builder
    next({ status: 400, msg: 'Validation failed', errors: errors.array() });
  } else {
    next();
  }
};

/**
 * Create a middleware chain consisting of the given validator handlers
 * and the final validation "resolver", which checks errors & calls next().
 */
export const validate = (...fields: ValidatorInput) => {
  const validationHandlers = fields.map((field) => validators[field]);
  return [...validationHandlers, validationResolver];
};
