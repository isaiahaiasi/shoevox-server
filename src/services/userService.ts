import { HydratedDocument, Query } from 'mongoose';
import User, { IUser } from '../models/User';
import spec from '../openapi.json';
import { getSchemaProperties } from '../utils/apiSpecHelpers';
import { serializeDocument } from '../utils/mongooseHelpers';
import { getPaginatedQuery, PaginationInfo } from '../utils/paginationHelpers';

export const userDtoFields = getSchemaProperties(spec.components.schemas.User);

function getUserDto(user: HydratedDocument<IUser>) {
  return serializeDocument(user, userDtoFields);
}

function completeQuery<T, Q>(query: Query<T, Q>) {
  return query
    .select(userDtoFields.join(' '))
    .exec();
}

const getUsers = async (limit: number, cursor?: string) => {
  const paginationInfo: PaginationInfo<IUser> = {
    limit,
    cursor: [{
      field: 'username',
      value: cursor,
    }],
  };

  const query = getPaginatedQuery(User, paginationInfo);
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
