/* eslint-disable no-underscore-dangle */
import { Document, FilterQuery, Model } from 'mongoose';
import { CursorDescription, PaginationInfo } from './paginationHelpers';

// no clue why these aren't implemented in the built-in typings...
export interface ITimestamps {
  createdAt: Date;
  updatedAt: Date;
}

// * General helpers

export function filterObject<
  T extends Record<string, any>,
  F extends readonly string[],
>(obj: T, keys: F) {
  const entries = Object.entries(obj).filter(([k]) => keys.indexOf(k) !== -1);
  return Object.fromEntries(entries);
}

export function serializeDocument<T, F extends readonly string[]>(
  doc: Document<any, any, T>,
  includeFields: F,
) {
  const docData = doc.toJSON({ virtuals: true });

  return filterObject(docData, includeFields);
}

export function serializeDocuments<T>(collection: Document<T>[], includeFields: string[]) {
  return collection.map((doc) => serializeDocument(doc, includeFields));
}

// * Mongoose pagination implementation helpers

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

// TODO: what the heck is this doing?
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
  filterQuery: FilterQuery<T> = {},
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
