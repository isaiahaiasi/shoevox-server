import dotenv from 'dotenv';
import { getNumeric } from '../utils/inputHelpers';

interface Env {
  DEBUG_DB: boolean;
  CLIENT_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  HAS_CREDENTIALS_GOOGLE: boolean;
  MONGODB_URI?: string;
  NODE_ENV: string;
  PORT: number;
  SESSION_COOKIE_SECRET?: string;
}

dotenv.config();

const fallbacks = {
  PORT: 5000,
  NODE_ENV: 'production',
};

let env: Env | null = null;

function getStringBoolean(str?: string) {
  return !!(str && str.toLowerCase() === 'true');
}

/**
 * Loads environment variables and handles fallbacks if necessary.
 */
function initEnv() {
  env = {
    DEBUG_DB: getStringBoolean(process.env.DEBUG_DB),
    CLIENT_URL: process.env.CLIENT_URL,
    SESSION_COOKIE_SECRET: process.env.SESSION_COOKIE_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    HAS_CREDENTIALS_GOOGLE: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    MONGODB_URI: process.env.MONGODB_URI,
    NODE_ENV: process.env.NODE_ENV ?? fallbacks.NODE_ENV,
    PORT: getNumeric(process.env.PORT) ?? fallbacks.PORT,
  };
}

export function getEnv(): Env {
  if (!env) {
    initEnv();
  }

  return env as Env;
}

// Included to enable state to be reset for testing,
// which is otherwise not possible with ESModule resolution.
// Turns out, there are some problems with the Singleton pattern!
export function resetEnv() {
  env = null;
}
