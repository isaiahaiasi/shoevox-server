import { HydratedDocument, Query } from 'mongoose';
import User, { IUser } from '../models/User';
import spec from '../openapi.json';
import { getSchemaProperties } from '../utils/apiSpecHelpers';
import { serializeDocument } from '../utils/mongooseHelpers';

export const userDtoFields = getSchemaProperties(spec.components.schemas.User);
const userDtoString = userDtoFields.join(' ') as typeof userDtoFields[number];

function getUserDto(user: HydratedDocument<IUser>) {
  return serializeDocument(user, userDtoFields);
}

function completeQuery<T, Q>(query: Query<T, Q>) {
  return query
    .select(userDtoString)
    .exec();
}

const getUsers = async (limit: number, cursor?: string) => {
  const filterOpts = cursor ? { username: { $gt: cursor } } : {};
  const query = User.find(filterOpts).sort({ username: 'asc' }).limit(limit);
  const users = await completeQuery(query);
  return users.map(getUserDto);
};

const getUserById = async (id: string) => {
  const user = await completeQuery(User.findById(id));

  if (!user) {
    return null;
  }

  return getUserDto(user);
};

const createUser = async (userData: { username: string, password: string }) => {
  const user = await new User(userData).save();
  return getUserDto(user);
};

export default {
  getUsers,
  getUserById,
  createUser,
};
