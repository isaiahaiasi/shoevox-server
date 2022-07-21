import { Dto, dtoFields } from '@isaiahaiasi/voxelatlas-spec';
import { HydratedDocument, Query } from 'mongoose';
import FederatedCredential from '../models/FederatedCredential';
import User, { IUser } from '../models/User';
import { Provider } from '../types/auth';
import { getOauthUser } from '../utils/authHelpers';
import { serializeDocument } from '../utils/mongooseHelpers';
import { getPaginatedQuery, PaginationInfo } from '../utils/paginationHelpers';

interface CreateUserRequestData {
  token: string;
  provider: Provider;
}

function getUserDto(user: HydratedDocument<IUser>) {
  return serializeDocument(user, dtoFields.user) as Dto['User'];
}

function completeQuery<T, Q>(query: Query<T, Q>) {
  return query
    .select(dtoFields.user.join(' '))
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

// Get user data from oauth provider
// See if federated credentials already exist
// If so, return the associated user
// If not, create new user and federated credentials records and return new user
const createUser = async ({ provider, token }: CreateUserRequestData) => {
  const oauthUserData = await getOauthUser(provider, token);

  const initialFedCred = await FederatedCredential.findOne({
    oauthId: oauthUserData.oauthId,
    provider,
  });

  if (initialFedCred) {
    const user = await User.findById(initialFedCred.user);
    if (!user) {
      throw Error('Could not find user associated with OAuth credentials!');
    }
    return getUserDto(user);
  }

  const { displayName, email, oauthId } = oauthUserData;

  const user = await new User({ username: displayName, email }).save();

  await new FederatedCredential({
    // eslint-disable-next-line no-underscore-dangle
    user: user._id.toString(),
    oauthId,
    provider,
  }).save();

  return getUserDto(user);
};

const deleteUser = async (userId: string) => {
  // Need to delete user record AND all associated Federated Credentials
  const [deletedUser, credentialsDeleteResult] = await Promise.all([
    User.findByIdAndDelete(userId).exec(),
    FederatedCredential.deleteMany({ user: userId }).exec(),
  ]);

  if (!deletedUser) {
    throw Error('Could not find user to delete!');
  }

  if (credentialsDeleteResult.deletedCount === 0) {
    console.warn('Could not find any credentials associated with deleted user:', deletedUser);
  }

  return getUserDto(deletedUser);
};

export default {
  createUser,
  deleteUser,
  getUsers,
  getUserById,
};
