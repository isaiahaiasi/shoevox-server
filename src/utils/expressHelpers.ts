import { Request } from 'express';

export function getFullRequestUrl(req: Request, includeParams: boolean = true) {
  const path = includeParams ? req.originalUrl : req.originalUrl.split('?')[0];
  return `${req.protocol}://${req.get('host')}${path}`;
}
