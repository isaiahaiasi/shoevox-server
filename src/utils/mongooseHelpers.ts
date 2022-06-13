/* eslint-disable no-underscore-dangle */
import { Document } from 'mongoose';

export function serializeDocument<T>(doc: Document<T>) {
  const documentData = doc.toJSON();

  // replace '_id' with 'id'
  documentData.id = documentData._id.toString();
  delete documentData._id;

  return documentData;
}

export function serializeDocuments<T>(collection: Document<T>[]) {
  return collection.map((doc) => serializeDocument(doc));
}
