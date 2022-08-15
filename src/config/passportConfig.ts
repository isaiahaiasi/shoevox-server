// I wanted to avoid sessions entirely, but this SO answer (https://stackoverflow.com/a/47234114)
// says that is basically nonsensical with the Authorization Code Grant flow of OAuth.
// However, I do receive access & refresh tokens, so I could conceivably replace sessions with JWTs.

import passport, { Profile } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GithubStrategy } from 'passport-github2';
import userService from '../services/userService';
import { OauthCredentialData, Provider } from '../types/auth';
import { getEnv } from './env';

function getCallbackUrl(provider: Provider) {
  return `/v1/auth/providers/${provider}/redirect`;
}

function getGoogleStrategy() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = getEnv();

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Could not find Google OAuth Client credentials!');
  }

  return new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: getCallbackUrl('google'),
      scope: ['email', 'profile'],
    },
    (async (accessToken, refreshToken, profile, cb) => {
      const { id, displayName, emails } = profile;

      const credentials: OauthCredentialData = {
        displayName,
        oauthId: id,
        provider: 'google',
      };

      if (emails && emails.length > 0) {
        credentials.email = emails[0].value;
      }

      const user = await userService.getOrCreateUserByCredentials(credentials);

      cb(null, user);
    }),
  );
}

function getGithubStrategy() {
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = getEnv();

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    throw new Error('Could not find GitHub OAuth Client credentials!');
  }

  return new GithubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: getCallbackUrl('github'),
      scope: ['email'],
    },
    // no idea why this is missing typings...
    async (accessToken: string, refreshToken: string, profile: Profile, cb: any) => {
      const {
        id, username, displayName, emails,
      } = profile;

      const credentials: OauthCredentialData = {
        displayName: username ?? displayName,
        oauthId: id,
        provider: 'github',
      };

      if (emails && emails.length > 0) {
        credentials.email = emails[0].value;
      }

      const user = await userService.getOrCreateUserByCredentials(credentials);

      cb(null, user);
    },
  );
}

const strategies = [
  getGoogleStrategy,
  getGithubStrategy,
];

export default function configurePassport() {
  strategies.forEach((strategy) => {
    passport.use(strategy());
  });

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    const user = await userService.getUserById(id);

    if (user == null) {
      done(new Error('Could not find user record from id'));
    }

    done(null, user);
  });
}
