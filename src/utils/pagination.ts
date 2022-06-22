import { Request } from 'express';
import { FilterQuery, HydratedDocument, Model } from 'mongoose';
import { getNumeric } from './inputHelpers';
import { ApiResponseLinks } from './typeHelpers';

// TODO: Would like shape to be { [field]: value, order?: 'asc' | 'desc' }
// But can't figure out how to Type it correctly
// (can't use generics in Index Signatures, can't add additional props to Mapped Types)
type Cursor<T> = {
  field: keyof HydratedDocument<T>;
  value: any;
  order?: 'asc' | 'desc';
}[];

export interface PaginationInfo<T> {
  cursor: Cursor<T>;
  limit: number;
}

/** Given 'desc' returns '$lt'; otherwise, returns '$gt' */
function getFilterKey(order: 'asc' | 'desc' | undefined) {
  return order === 'desc' ? '$lt' : '$gt';
}

/**
 * Uses cursor information for a single field to create a Mongoose FilterQuery
 * @example [{ field: 'username', value: 'Steve' }] => { username: { $gt: 'Steve' }}
 */
function getSimpleCursorFilterQuery<T>(cursor: Cursor<T>): FilterQuery<T> {
  const { field, value, order } = cursor[0];
  const filterKey = getFilterKey(order);
  return { [field]: { [filterKey]: value } } as FilterQuery<T>;
}

/**
 * Uses cursor information for multiple fields to create a Mongoose FilterQuery
 * @example [{ field: 'createdAt', value: 'Aug 12', order: 'desc' },
 *   { field: '_id', value: 'abc123' },
 * ] => { $or: [
 *     { createdAt: { $lt: 'Aug 12' }},
 *     { createdAt: 'Aug 12', _id: { $gt: 'abc123' }}
 * ]}
 */
function getComplexCursorFilterQuery<T>(cursor: Cursor<T>): FilterQuery<T> {
  if (cursor.length < 2) {
    throw Error('Cursor must have at least 2 entries to create a Complex Cursor Query.');
  }
  const filterList = [];

  for (let i = 0; i < cursor.length; i++) {
    const filterEntry: any = {};

    // add previous fields as equalities
    for (let j = 0; j < i; j++) {
      const { field, value } = cursor[j];
      filterEntry[field] = value;
    }

    const { field, value, order } = cursor[i];
    filterEntry[field] = { [getFilterKey(order)]: value };

    filterList.push(filterEntry);
  }

  return { $or: filterList };
}

function getCursorQuery<T>(cursor: Cursor<T>): FilterQuery<T> {
  switch (cursor.length) {
    case 0: return {};
    case 1: return getSimpleCursorFilterQuery(cursor);
    default: return getComplexCursorFilterQuery(cursor);
  }
}

/** Returns a paginated query based on cursor and limit params */
export function getPaginatedQuery<T>(
  model: Model<T>,
  { cursor, limit }: PaginationInfo<T>,
  filterQuery:FilterQuery<T> = {},
) {
  const filteredCursorArray = cursor.filter((c) => c.value != null);

  const cursorQuery = getCursorQuery(filteredCursorArray);

  const findQuery = { $and: [filterQuery, cursorQuery] };

  // eg, { 'username': 'asc', 'createdAt': 'desc' }
  const sort = cursor
    .map((c) => (c.order === 'desc' ? `-${c.field.toString()}` : c.field.toString()))
    .join(' ');

  return model
    .find(findQuery)
    .limit(limit)
    .sort(sort);
}

export function getPaginationParams(req: Request, defaultLimit: number) {
  const limit = getNumeric(req.query.limit as string) ?? defaultLimit;
  const cursor = req.query.cursor as string | undefined;
  return { limit, cursor };
}

export function getNextLink(url: string, cursor: any, limit: number) {
  return {
    href: `${url}?cursor=${encodeURIComponent(cursor)}&limit=${limit}`,
  };
}

export function getPaginationLinks<T, C>(
  data: T[],
  limit: number,
  url: string,
  getCursor: (lastEntry: T) => C,
): ApiResponseLinks {
  if (data.length !== limit) {
    // if length < limit, we know there's no "next"
    return {};
  }

  const nextCursor = getCursor(data[data.length - 1]);

  return {
    next: getNextLink(url, nextCursor, limit),
  };
}
