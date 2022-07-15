import { RequestHandler } from 'express';
import { body, query, validationResult } from 'express-validator';

export const validatorGroups = {
  UserBody: [
    body('username').trim().isLength({ min: 3, max: 15 }),
  ],

  RoomBody: [
    body('title').trim().isLength({ min: 3, max: 100 }),
  ],

  CommentBody: [
    body('content').trim().isLength({ min: 3, max: 140 }),
  ],

  FriendRequestUpdateBody: [
    body('status').isIn(['ACCEPTED', 'REJECTED']),
    body('is').isIn(['recipient', 'requester']),
  ],

  FriendshipQueryRequest: [
    query('is').isIn(['recipient', 'requester']),
    query('status').optional().isIn(['ACCEPTED', 'PENDING', 'REJECTED']),
  ],
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
  return [...validatorGroups[requestBodyName], validationResolver];
};
