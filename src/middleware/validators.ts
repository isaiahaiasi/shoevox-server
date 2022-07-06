import { RequestHandler } from 'express';
import { body, validationResult } from 'express-validator';

export const validators = {
  UserBody: {
    username: body('username').trim().isLength({ min: 3, max: 15 }),
    // passwordConfirm: body('passwordConfirm').exists(),
    // password: body('password').isLength({ min: 8 }).custom(
    //   (value, { req }) => {
    //     if (value !== req.body.passwordConfirm) {
    //       throw new Error('Passwords must match!');
    //     } else {
    //       return true;
    //     }
    //   },
    // ),
  },

  RoomBody: {
    title: body('title').trim().isLength({ min: 3, max: 100 }),
  },

  CommentBody: {
    content: body('content').trim().isLength({ min: 3, max: 140 }),
  },

  FriendRequestUpdateBody: {
    status: body('status').custom(
      (value) => {
        if (['ACCEPTED', 'REJECTED'].indexOf(value) === -1) {
          throw new Error('Status must be either "ACCEPTED" or "REJECTED"');
        }

        return true;
      },
    ),
  },
};

const validationResolver: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next({ status: 400, msg: 'Validation failed', errors: errors.array() });
  } else {
    next();
  }
};

/**
 * Create a middleware chain consisting of the given validator handlers
 * and the final validation "resolver", which checks errors & calls next().
 */
export const validate = (requestBodyName: keyof typeof validators) => {
  const validationHandlers = Object.values(validators[requestBodyName]);
  return [...validationHandlers, validationResolver];
};
