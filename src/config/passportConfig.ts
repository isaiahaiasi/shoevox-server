// I wanted to avoid sessions entirely, but this SO answer (https://stackoverflow.com/a/47234114)
// says that is basically nonsensical with the Authorization Code Grant flow of OAuth.
// However, I do receive access & refresh tokens, so I could conceivably replace sessions with JWTs.

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import userService from '../services/userService';
import { OauthCredentialData } from '../types/auth';
import { getEnv } from './env';

export default function configurePassport() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = getEnv();

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Could not find Google OAuth Client credentials!');
  }

  passport.use(new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: '/v1/auth/providers/google/redirect',
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
  ));

  passport.serializeUser((user, done) => {
    // ! All attempts to extend Express.User have failed.
    // TODO: solve the mystery of the un-extendable Express interface.
    // @ts-ignore
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
