import { Request } from 'express';
import { FilterQuery, HydratedDocument, Model } from 'mongoose';
import { getNumeric } from './inputHelpers';

interface PaginationInfo<T> {
  cursor: [{
    field: keyof HydratedDocument<T>;
    value: any
    direction: 'asc' | 'desc';
  }];
  limit: number;
}

// function getSortArgumentFromPaginationInfo(paginationInfo: PaginationInfo) {}

/** Returns a paginated query based on cursor and limit params */
export function getPaginatedQuery<T>(
  model: Model<T>,
  paginationInfo: PaginationInfo<T>,
  filterQuery:FilterQuery<T> = {},
) {
  return model
    .find(filterQuery)
    .sort();
}

export function getPaginationParams(req: Request, defaultLimit: number) {
  const limit = getNumeric(req.query.limit as string) ?? defaultLimit;
  const cursor = req.query.cursor as string | undefined;
  return { limit, cursor };
}
