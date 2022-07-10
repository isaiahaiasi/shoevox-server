import dotenv from 'dotenv';
import { getNumeric } from '../utils/inputHelpers';

interface Env {
  DEBUG_DB: boolean;
  GOOGLE_CLIENT_ID?: string;
  MONGODB_URI?: string;
  NODE_ENV: string;
  PORT: number;
}

dotenv.config();

const fallbacks = {
  PORT: 5000,
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
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    MONGODB_URI: process.env.MONGODB_URI,
    NODE_ENV: process.env.NODE_ENV ?? 'production',
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
