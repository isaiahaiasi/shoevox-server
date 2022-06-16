/* eslint-disable no-underscore-dangle */
import { Document } from 'mongoose';

export function filterObject<T>(obj: T, keys: string[]) {
  const entries = Object.entries(obj).filter(([k]) => keys.indexOf(k) !== -1);
  return Object.fromEntries(entries);
}

export function serializeDocument<T>(doc: Document<any, any, T>, includeFields: string[]) {
  const docData = doc.toJSON({ virtuals: true });

  return filterObject(docData, includeFields);
}

export function serializeDocuments<T>(collection: Document<T>[], includeFields: string[]) {
  return collection.map((doc) => serializeDocument(doc, includeFields));
}
