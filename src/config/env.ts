import dotenv from 'dotenv';

/**
 * Loads environment variables and handles fallbacks if necessary.
 */

interface Env {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI?: string;
}

dotenv.config();

function getNumeric(input?: string) {
  return input && !Number.isNaN(+input) ? +input : undefined;
}

const fallbacks = {
  PORT: 5000,
};

let env: Env | null = null;

function initEnv() {
  env = {
    PORT: getNumeric(process.env.PORT) ?? fallbacks.PORT,
    NODE_ENV: process.env.NODE_ENV ?? 'production',
    MONGODB_URI: process.env.MONGODB_URI,
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
