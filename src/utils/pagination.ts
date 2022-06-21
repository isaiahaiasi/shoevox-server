import { Request } from 'express';
import { FilterQuery, HydratedDocument, Model } from 'mongoose';
import { getNumeric } from './inputHelpers';

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

/** Returns a paginated query based on cursor and limit params */
export function getPaginatedQuery<T>(
  model: Model<T>,
  { cursor, limit }: PaginationInfo<T>,
  filterQuery:FilterQuery<T> = {},
) {
  const filteredCursorArray = cursor.filter((c) => c.value != null);

  const queryFilterEntries = filteredCursorArray.map((c, i) => {
    const { field, value, order = 'asc' } = c;

    const isLast = i === filteredCursorArray.length - 1;
    const [asc, desc] = isLast ? ['$gt', '$lt'] : ['$gte', '$lte'];
    const filterKey = order === 'asc' ? asc : desc;
    // const filterKey = '$eq';

    // eg, ['username', { '$gt': value }]
    return [field, {
      [filterKey]: value,
    }];
  });

  // eg, { username: { $gt: 'steve }, createdAt: { $lt: '2022-06-13T07:21:24.517Z' }}
  const cursorQueryFilter = Object.fromEntries(queryFilterEntries);

  // TODO: "deep merge" fields
  // so that pagination filter items don't overwrite given filterQuery items
  const findQuery = { ...filterQuery, ...cursorQueryFilter };

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
