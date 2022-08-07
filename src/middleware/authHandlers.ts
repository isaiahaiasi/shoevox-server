import { Request, RequestHandler } from 'express';

/** @returns The id of the resource owner */
type GetRequestedResourceOwner = (req: Request) => string;

export const authenticateUser: RequestHandler = async (req, res, next) => {
  if (!req.user) {
    // TODO: Predefined Error type
    res.status(401);
    throw Error('User could not be authenticated!');
  }

  next();
};

export function authorizeSameUser(getResourceOwner: GetRequestedResourceOwner): RequestHandler {
  return (req, res, next) => {
    const resourceOwner = getResourceOwner(req);

    if (resourceOwner !== res.locals.userId) {
      // TODO: Predefined Error type
      res.status(403);
      throw Error('User does not have permission to access requested resource!');
    }

    next();
  };
}
