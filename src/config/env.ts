import dotenv from 'dotenv';

/**
 * Loads environment variables and handles fallbacks if necessary.
 */

dotenv.config();

export const env = {
  PORT: process.env.PORT ? +process.env.PORT : 5000,
};
