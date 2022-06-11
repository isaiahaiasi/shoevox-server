import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { env } from './config/env';

const app = express();

// TODO: Logging
// TODO: Sanitization?
// TODO: Error catching

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

app.get('/', (_req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(env.PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${env.PORT}`);
});
