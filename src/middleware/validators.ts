import { RequestHandler } from 'express';
import { body, query, validationResult } from 'express-validator';

export const validatorGroups = {
  UserBody: {
    username: body('username').trim().isLength({ min: 3, max: 15 }),
  },

  RoomBody: {
    title: body('title').trim().isLength({ min: 3, max: 100 }),
  },

  CommentBody: {
    content: body('content').trim().isLength({ min: 3, max: 140 }),
  },

  FriendRequestUpdateBody: {
    is: body('is').isIn(['recipient', 'requester']),
    status: body('status').isIn(['ACCEPTED', 'REJECTED']).custom(
      // Only the recipient may accept the request
      (status, { req }) => req.body.is === 'recipient' || status !== 'ACCEPTED',
    ),
  },

  FriendshipQueryRequest: {
    is: query('is').isIn(['recipient', 'requester']),
    status: query('status').optional().isIn(['ACCEPTED', 'PENDING', 'REJECTED']),
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
 * Create a middleware chain consisting of the given ValidationChains
 * and the final validation "resolver", which checks errors & calls next().
 */
// eslint-disable-next-line arrow-body-style
export const validate = (requestBodyName: keyof typeof validatorGroups) => {
  const validationChains = Object.values(validatorGroups[requestBodyName]);
  return [...validationChains, validationResolver];
};
