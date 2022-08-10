import { RequestHandler } from 'express';
import passport from 'passport';
import { getEnv } from '../config/env';

const { CLIENT_URL } = getEnv();

if (!CLIENT_URL) {
  throw new Error('CLIENT_URL environment variable not found, but required for authentication.');
}

const providerOptions = {
  google: { scope: ['email', 'profile'] },
  github: { scope: ['email'] },
};

const getCurrentUser: RequestHandler = (req, res) => {
  const resData = req.user
    ? {
      success: true,
      message: 'User is currently authenticated',
      user: req.user,
    }
    : {
      success: false,
      message: 'User is not currently authenticated',
      user: null,
    };

  res.json(resData);
};

const handleLoginFailure: RequestHandler = (req, res, next) => {
  req.logout((err) => (err ? next(err) : res.redirect(CLIENT_URL)));
};

const handleProviderRedirect: RequestHandler = (req, res, next) => {
  const { provider } = req.params;

  passport.authenticate(provider, {
    successRedirect: CLIENT_URL,
    failureRedirect: '/v1/auth/login/failed',
  })(req, res, next);
};

const handleProvider: RequestHandler = (req, res, next) => {
  const { provider } = req.params;

  if (!Object.keys(providerOptions).includes(provider)) {
    throw new Error(`Unhandled auth provider: ${provider}! No provider options found.`);
  }

  passport.authenticate(
    provider,
    providerOptions[provider as keyof typeof providerOptions],
  )(req, res, next);
};

const handleLogout: RequestHandler = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
    } else {
      res.redirect(CLIENT_URL);
    }
  });
};

export {
  getCurrentUser,
  handleLoginFailure,
  handleLogout,
  handleProvider,
  handleProviderRedirect,
};
