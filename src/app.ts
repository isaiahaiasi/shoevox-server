import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import session from 'express-session';
import passport from 'passport';
import { getEnv } from './config/env';
import { initializeMongoose } from './config/mongooseConfig';
import { getErrorHandlers } from './middleware/errorHandlers';
import router from './routes/v1';
import configurePassport from './config/passportConfig';

const env = getEnv();

const app = express();

// TODO: Logging
// TODO: Sanitization?

// Establish connection with DB
initializeMongoose();

// ! Required middleware for authentication
if (!env.SESSION_COOKIE_SECRET) {
  throw new Error('SESSION_COOKIE_SECRET required to sign cookies');
}

app.use(
  session({
    name: 'session',
    secret: env.SESSION_COOKIE_SECRET,
    cookie: {
      maxAge: 24 * 60 * 60 * 100,
    },
    resave: false,
    saveUninitialized: false,
  }),
);

configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Sets security HTTP Headers
app.use(helmet());

// Parse JSON RequestBody
app.use(express.json());

// Parse urlencoded RequestBody
app.use(express.urlencoded({ extended: true }));

// Use gzip compression
app.use(compression());

// Enable CORS
app.use(cors({
  origin: env.CLIENT_URL, // allow to server to accept request from different origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // allow session cookie from browser to pass through
}));

// Include routes
app.use('/v1', router);

// Error handling
app.use(getErrorHandlers());

// Start server
app.listen(env.PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${env.PORT}`);
});
