import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { getEnv } from './config/env';
import { initializeMongoose } from './config/mongooseConfig';
import { getErrorHandlers } from './middleware/errorHandlers';
import router from './routes/v1';

const env = getEnv();

const app = express();

// TODO: Logging
// TODO: Sanitization?

// Establish connection with DB
initializeMongoose();

// Sets security HTTP Headers
app.use(helmet());

// Parse JSON RequestBody
app.use(express.json());

// Parse urlencoded RequestBody
app.use(express.urlencoded({ extended: true }));

// Use gzip compression
app.use(compression());

// Enable CORS
app.use(cors({}));

// Include routes
app.use('/v1', router);

// Error handling
app.use(getErrorHandlers());

// Start server
app.listen(env.PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${env.PORT}`);
});
