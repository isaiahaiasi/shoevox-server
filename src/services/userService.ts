import { HydratedDocument, Query } from 'mongoose';
import User, { IUser } from '../models/User';
import spec from '../openapi.json';
import { getSchemaProperties } from '../utils/apiSpecHelpers';
import { getGoogleUser, Provider } from '../utils/authHelpers';
import { serializeDocument } from '../utils/mongooseHelpers';
import { getPaginatedQuery, PaginationInfo } from '../utils/paginationHelpers';

export const userDtoFields = getSchemaProperties(spec.components.schemas.User);

interface UserData {
  username?: string;
  email?: string;
  token: string;
  provider: Provider;
}

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

const createUser = async ({
  username, email, provider, token,
}: UserData) => {
  let oauthUserData;

  switch (provider) {
    case 'google':
      oauthUserData = await getGoogleUser(token);
      break;
    default:
      throw Error('No handled Auth Provider given.');
  }

  // const user = await new User(userData).save();

  return {
    username: username ?? oauthUserData!.name,
    email: email ?? oauthUserData!.email,
    id: oauthUserData!.sub,
    createdAt: new Date(),
  };
};

export default {
  getUsers,
  getUserById,
  createUser,
};
