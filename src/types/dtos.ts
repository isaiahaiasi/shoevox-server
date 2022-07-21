import { zSchemas } from '@isaiahaiasi/voxelatlas-spec';
import { z } from 'zod';

const {
  Comment, Friendship, Like, Room, User,
} = zSchemas.resources;

const schemaObjects = {
  Comment, Friendship, Like, Room, User,
};

type SchemaObjectName = keyof typeof schemaObjects;

export type Dto = {
  [key in SchemaObjectName]: z.infer<typeof schemaObjects[key]>
};

function getFields<T extends keyof Dto>(name: T) {
  return Object.keys(schemaObjects[name].shape) as (keyof Dto[T])[];
}

// This could map so easily, but I'm not sure how to preserve individual typings.
export const dtoFields = {
  comment: getFields('Comment'),
  friendship: getFields('Friendship'),
  like: getFields('Like'),
  room: getFields('Room'),
  user: getFields('User'),
} as const;
