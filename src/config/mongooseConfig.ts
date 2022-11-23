import mongoose from 'mongoose';
import { getEnv } from './env';

export async function initializeMongoose() {
  const { MONGODB_URI, DB_DEBUG_MODE } = getEnv();

  if (!MONGODB_URI) {
    throw Error(
      '[db]: Could not establish MongoDB connection.\n'
      + 'No connection URI provided.',
    );
  }

  if (DB_DEBUG_MODE) {
    console.log(process.env.DEBUG_DB);
    mongoose.set('debug', true);
  }

  mongoose.connect(MONGODB_URI).catch((err) => {
    console.error('[db]: Could not connect to database server.');
    console.error(err);
  });

  const db = mongoose.connection;

  db
    .on('error', () => console.error('[db]: MongoDB connection error'))
    .on('open', () => console.log('[db]: MongoDB connection established'));

  return db;
}
