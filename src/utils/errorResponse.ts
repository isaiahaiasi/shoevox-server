import { Request } from 'express';

// TODO: proper typing
type ResponseError = any;

export function createNotImplementedError(req: Request) {
  return { status: 404, msg: `${req.method}${req.originalUrl} has not been implemented yet!` };
}

export function createErrorResponse(err: ResponseError) {
  return err;
}
