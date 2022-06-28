import { FilterQuery, HydratedDocument, Model } from 'mongoose';
import { getNumeric } from './inputHelpers';
import { ApiResponseLinks } from './typeHelpers';

type CursorDescription<T> = {
  field: keyof HydratedDocument<T>;
  value: any;
  order?: 'asc' | 'desc';
}[];

export interface PaginationInfo<T> {
  cursor: CursorDescription<T>;
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
function getSimpleCursorFilterQuery<T>(cursor: CursorDescription<T>): FilterQuery<T> {
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
function getComplexCursorFilterQuery<T>(cursor: CursorDescription<T>): FilterQuery<T> {
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

function getCursorQuery<T>(cursor: CursorDescription<T>): FilterQuery<T> {
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

/** Attempts to extract "limit" and "cursor" from query parameters.
 *  If no cursor param is present, returned cursor is `undefined`.
*/
export function getPaginationParams(req: { query: any }, defaultLimit: number) {
  const limit = getNumeric(req.query.limit as string) ?? defaultLimit;
  const cursor = req.query.cursor as string | undefined;
  return { limit, cursor };
}

export function getNextLink(url: string, cursor: any, limit: number) {
  const cursorStr = cursor ? `cursor=${encodeURIComponent(cursor)}&` : '';
  return {
    href: `${url}?${cursorStr}limit=${limit}`,
    cursor: cursor && encodeURIComponent(cursor),
  };
}

export function getPaginationLinks<T, C>(
  data: T[],
  url: string,
  limit: number,
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

/** Creates a Timestamp cursor as it will be represented in URL.
 *  Accepts the object that will be used as reference to create the cursor.
 *  (*Not* a "deserialized" cursor object!)
 *  This does not URI-encode the result.
 */
export function serializeTimestampCursor(
  refObject: { createdAt: string | number | Date, id: any },
) {
  return [
    new Date(refObject.createdAt).toISOString(),
    refObject.id,
  ] as const;
}

export function deserializeTimestampCursor(
  rawCursor?: string,
): CursorDescription<{ createdAt?: Date, _id: any }> {
  let id;
  let date;

  if (rawCursor) {
    const cursorValues = rawCursor.split(',');
    const [createdAt] = cursorValues;
    [,id] = cursorValues;
    date = new Date(createdAt ?? '');

    if (Number.isNaN(date.valueOf())) {
      throw Error(`Could not parse date in cursor (Parsing "${createdAt}")`);
    }
  }

  return [
    {
      field: 'createdAt',
      value: date,
      order: 'desc',
    },
    { field: '_id', value: id },
  ];
}
