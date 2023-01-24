import { Resource } from '@isaiahaiasi/voxelatlas-spec';
import { RequestHandler } from 'express';
import { createResourceNotFoundError } from './errorResponse';
import { getFullRequestUrl } from './expressHelpers';
import {
  getPaginationLinks, getPaginationParams, RawPaginationInfo, serializeTimestampCursor,
} from './paginationHelpers';

interface PaginatedService<T extends keyof Resource> {
  (paginationInfo: RawPaginationInfo): Promise<Resource[T][]>
}

interface PaginatedServiceWithIdentifier<T extends keyof Resource> {
  (identifier: string, paginationInfo: RawPaginationInfo): Promise<Resource[T][]>
}

interface ServiceWithIdentifier<T extends keyof Resource> {
  (identifier: string): Promise<Resource[T] | null>
}

export function serviceWithIdentifierQueryHandler<T extends keyof Resource>(
  idName: string,
  serviceFn: ServiceWithIdentifier<T>,
): RequestHandler {
  return async (req, res, next) => {
    const id = req.params[idName];
    const data = await serviceFn(id);

    if (data) {
      res.json({ data });
    } else {
      const { originalUrl } = req;
      res.status(404);
      next(
        createResourceNotFoundError({ id, idName, originalUrl }),
      );
    }
  };
}

export function paginatedGetQueryHandler<T extends keyof Resource>(
  serviceFn: PaginatedService<T>,
): RequestHandler {
  return async (req, res) => {
    const { limit, cursor } = getPaginationParams(req.query, 3);

    const data = await serviceFn({ limit, cursor });

    const baseUrl = getFullRequestUrl(req, false);
    const links = getPaginationLinks(data, baseUrl, limit, serializeTimestampCursor);

    res.json({
      count: data.length,
      data,
      links,
    });
  };
}

export function paginatedGetByIdentifierQueryHandler<T extends keyof Resource>(
  identifier: string,
  serviceFn: PaginatedServiceWithIdentifier<T>,
): RequestHandler {
  return async (req, res) => {
    const { limit, cursor } = getPaginationParams(req.query, 3);
    const id = req.params[identifier];

    const data = await serviceFn(id, { limit, cursor });

    const baseUrl = getFullRequestUrl(req, false);
    const links = getPaginationLinks(data, baseUrl, limit, serializeTimestampCursor);

    res.json({
      count: data.length,
      data,
      links,
    });
  };
}
