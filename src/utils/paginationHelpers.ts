import { URLSearchParams } from 'url';
import { getNumeric } from './inputHelpers';
import { ApiResponseLinks } from './typeHelpers';

const DEFAULT_PAGINATION_LIMIT = 10;

type TimestampFields = 'createdAt' | 'updatedAt';

export type CursorDescription<T> = {
  field: (keyof T) | TimestampFields | '_id';
  value: Date | string | null;
  order?: 'asc' | 'desc';
}[];

export interface PaginationInfo<T> {
  cursor: CursorDescription<T>;
  limit: number;
}

export interface RawPaginationInfo {
  cursor: string | null;
  limit: number;
}

/** Pagination parameters as represented by `req.query` */
export interface PaginationQuery {
  cursor?: string;
  limit?: string;
}

/** Attempts to extract "limit" and "cursor" from query parameters.
 *  If no cursor param is present, returned cursor is `null`.
*/
export function getPaginationParams(query: PaginationQuery, fallbackLimit?: number) {
  const limit = getNumeric(query.limit) ?? fallbackLimit ?? DEFAULT_PAGINATION_LIMIT;
  const cursor = query.cursor ? decodeURIComponent(query.cursor) : null;
  return { limit, cursor };
}

export function getNextLink(url: string, cursor: string, limit: number) {
  const queryParamData: { limit: string, cursor?: string } = {
    limit: limit.toString(),
  };

  if (cursor) {
    queryParamData.cursor = cursor;
  }

  const params = new URLSearchParams(queryParamData);

  return {
    href: `${url}?${params.toString()}`,
    cursor,
  };
}

export function getPaginationLinks<T>(
  data: T[],
  url: string,
  limit: number,
  getCursor: (lastEntry: T) => string,
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
 */
export function serializeTimestampCursor(
  refObject: { createdAt: string | number | Date, id: string | number },
) {
  return [
    new Date(refObject.createdAt).toISOString(),
    refObject.id.toString(),
  ]
    .map(encodeURIComponent)
    .join(',');
}

export function deserializeTimestampCursor(
  cursorStr: string | null,
): CursorDescription<{ createdAt?: Date, _id: any }> {
  let id = null;
  let date = null;

  if (cursorStr) {
    const cursorValues = cursorStr.split(',');
    const [createdAt] = cursorValues;
    [, id] = cursorValues;
    date = new Date(createdAt ?? '');

    if (Number.isNaN(date.valueOf())) {
      // TODO: proper error handling
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
