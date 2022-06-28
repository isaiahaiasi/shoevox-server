import dotenv from 'dotenv';
import { getNumeric } from '../utils/inputHelpers';

/**
 * Loads environment variables and handles fallbacks if necessary.
 */

interface Env {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI?: string;
  GOOGLE_CLIENT_ID?: string;
}

dotenv.config();

const fallbacks = {
  PORT: 5000,
};

let env: Env | null = null;

function initEnv() {
  env = {
    PORT: getNumeric(process.env.PORT) ?? fallbacks.PORT,
    NODE_ENV: process.env.NODE_ENV ?? 'production',
    MONGODB_URI: process.env.MONGODB_URI,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
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
