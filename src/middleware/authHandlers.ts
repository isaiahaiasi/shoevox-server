import { Request, RequestHandler } from 'express';
import FederatedCredential from '../models/FederatedCredential';
import { getGoogleUser, getProvider, getTokenFromHeader } from '../utils/authHelpers';

/** @returns The id of the resource owner */
type GetRequestedResourceOwner = (req: Request) => string;

/**
 * Takes an Access Token/ID Token and verifies it against auth service
 * @returns id of the authenticated user, or null if user could not be authenticated
*/
type ProviderAuthenticator = (token: string) => Promise<string | null>;

const authenticateGoogleId: ProviderAuthenticator = async (token) => {
  const { oauthId } = await getGoogleUser(token);
  const credentials = await FederatedCredential.findOne({ oauthId }, 'user').lean().exec();
  return credentials?.user.toString() ?? null;
};

const authenticators = {
  google: authenticateGoogleId,
};

export const authenticateUser: RequestHandler = async (req, res, next) => {
  const token = getTokenFromHeader(req);
  const provider = getProvider(req);
  const authResult = await authenticators[provider]?.(token) ?? null;

  if (!authResult) {
    // TODO: Predefined Error type
    res.status(401);
    throw Error('User could not be authenticated!');
  }

  res.locals.userId = authResult;
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
