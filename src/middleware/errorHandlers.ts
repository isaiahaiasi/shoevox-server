/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from 'express';
import { createErrorResponse } from '../utils/errorResponse';

function getStatusCode(err: any) {
  return err.status ?? err.statusCode ?? 500;
}

const logError: ErrorRequestHandler = (err, req, res, next) => {
  console.error(`Error on ${req.path}`, err);
  next(err);
};

/**
 * Ensures error has correct shape and then sends it as JSON.
 */
// (Must keep 4th param in order for Express to recognize function as an error handler)
const sendErrorAsJson: ErrorRequestHandler = (err, req, res, _) => {
  const errorResponse = createErrorResponse(err);

  res.status(getStatusCode(err)).json(errorResponse);
};

// Might want to programmatically determine which error handlers to provide
// eg, might want to change the response if I'm not in development mode
export function getErrorHandlers() {
  return [
    logError,
    sendErrorAsJson,
  ];
}
