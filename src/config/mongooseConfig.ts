import mongoose from 'mongoose';
import { getEnv } from './env';

export async function initializeMongoose() {
  const { MONGODB_URI, NODE_ENV } = getEnv();

  if (!MONGODB_URI) {
    throw Error(
      'Could not establish MongoDB connection.\n'
      + 'No connection URI provided.',
    );
  }

  if (NODE_ENV === 'development') {
    mongoose.set('debug', true);
  }

  mongoose.connect(MONGODB_URI).catch((err) => {
    console.error('Could not connect to database server.');
    console.error(err);
  });

  const db = mongoose.connection;

  db
    .on('error', () => console.error('mongo connection error'))
    .on('open', () => console.log('MongoDB connection established'));

  return db;
}
