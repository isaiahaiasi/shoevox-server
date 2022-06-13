import mongoose from 'mongoose';
import { getEnv } from './env';

export function initializeMongoose() {
  const { MONGODB_URI } = getEnv();

  if (!MONGODB_URI) {
    throw Error(
      'Could not establish MongoDB connection.\n'
      + 'No connection URI provided.',
    );
  }

  mongoose.connect(MONGODB_URI);
  const db = mongoose.connection;

  db
    .on('error', () => console.error('mongo connection error'))
    .on('open', () => console.log('MongoDB connection established'));
  return db;
}
