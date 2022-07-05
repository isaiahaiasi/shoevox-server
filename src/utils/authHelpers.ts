import { Request } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { getEnv } from '../config/env';
import { OauthUserData, Provider } from '../types/auth';

type OauthGetters = {
  [Property in Provider]: (token: string) => Promise<OauthUserData>
};

const OAUTH_PROVIDER_HEADER_NAME = 'X-Oauth-Provider';

const googleClient = new OAuth2Client(getEnv().GOOGLE_CLIENT_ID);

export function getTokenFromHeader(req: Request): string {
  const header = req.headers.authorization?.split(' ')[1];

  if (!header) {
    throw Error('No authorization header found, or authorization header improperly formatted.');
  }

  return header;
}

export function getProvider(req: Request): Provider {
  const provider = req.headers[OAUTH_PROVIDER_HEADER_NAME.toLowerCase()];

  if (!provider) {
    throw Error('Could not find OAuth provider');
  }

  return provider as Provider;
}

export async function getGoogleUser(token: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: getEnv().GOOGLE_CLIENT_ID,
  });

  const user = ticket.getPayload();

  if (!user) {
    throw Error('Could not get google oauth user!');
  }

  const oauthUserData = {
    displayName: user.name!,
    email: user.email!,
    oauthId: user.sub!,
  };

  if (Object.values(oauthUserData).some((v) => v == null)) {
    throw Error('Not all required user data included in google oauth response!');
  }

  return oauthUserData;
}

const oauthGetters: OauthGetters = {
  google: getGoogleUser,
};

export async function getOauthUser(provider: Provider, token: string) {
  return oauthGetters[provider](token);
}
