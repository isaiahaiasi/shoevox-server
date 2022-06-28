import { Request } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { getEnv } from '../config/env';

export const providers = ['google'] as const;
export type Provider = typeof providers[number];

const googleClient = new OAuth2Client(getEnv().GOOGLE_CLIENT_ID);

export function getTokenFromHeader(req: Request): string {
  const header = req.headers.authorization?.split(' ')[1];

  if (!header) {
    throw Error('No authorization header found, or authorization header improperly formatted.');
  }

  return header;
}

export async function getGoogleUser(token: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: getEnv().GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  console.log('[auth] payload', payload);

  return payload;
}
