import dotenv from 'dotenv';

/**
 * Loads environment variables and handles fallbacks if necessary.
 */

// HELPERS
function getNumeric(input?: string) {
  return input && !Number.isNaN(+input) ? +input : undefined;
}

export const fallbacks = {
  PORT: 5000,
};

export const getEnv = () => {
  dotenv.config();

  return {
    PORT: getNumeric(process.env.PORT) ?? fallbacks.PORT,
  };
};
