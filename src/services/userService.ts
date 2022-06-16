import { HydratedDocument, Query } from 'mongoose';
import User, { IUser } from '../models/User';
import { serializeDocument } from '../utils/mongooseHelpers';

export const includeUserFields = ['username', 'createdAt', 'id'];
const PUBLIC_USER_FIELDS = includeUserFields.join(' ');

function getUserDto(user: HydratedDocument<IUser>) {
  return serializeDocument(user, includeUserFields);
}

function completeQuery<T, Q>(query: Query<T, Q>) {
  return query
    .select(PUBLIC_USER_FIELDS)
    .exec();
}

const getUsers = async () => {
  const users = await completeQuery(User.find({}));
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
