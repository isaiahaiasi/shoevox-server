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
  const queryFilterEntries = cursor
    .filter((c) => c.value != null)
    .map((c) => {
      const { field, value, order = 'asc' } = c;
      const filterKey = order === 'asc' ? '$gt' : '$lt';

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
  const sort = Object.fromEntries(cursor.map((c) => ([[c.field], c.order ?? 'asc'])));

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
