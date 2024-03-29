import { Resource, resourceFields } from '@isaiahaiasi/voxelatlas-spec';
import { HydratedDocument, Query } from 'mongoose';
import FederatedCredential from '../models/FederatedCredential';
import User, { IUser } from '../models/User';
import { OauthCredentialData } from '../utils/auth';
import { getPaginatedQuery, serializeDocument } from '../utils/mongooseHelpers';
import { PaginationInfo, RawPaginationInfo } from '../utils/paginationHelpers';

export function getUserDto(user: HydratedDocument<IUser>) {
  return serializeDocument(user, resourceFields.user) as Resource['User'];
}

function completeQuery<T, Q>(query: Query<T, Q>) {
  return query
    .select(resourceFields.user.join(' '))
    .exec();
}

const getUsers = async ({ limit, cursor }: RawPaginationInfo) => {
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

  return user ? getUserDto(user) : null;
};

// Get user data from oauth provider
// See if federated credentials already exist
// If so, return the associated user
// If not, create new user and federated credentials records and return new user
const createUser = async () => {
  // const oauthUserData = await getOauthUser(provider, token);

  // const initialFedCred = await FederatedCredential.findOne({
  //   oauthId: oauthUserData.oauthId,
  //   provider,
  // });

  // if (initialFedCred) {
  //   const user = await User.findById(initialFedCred.user);
  //   if (!user) {
  //     throw Error('Could not find user associated with OAuth credentials!');
  //   }
  //   return getUserDto(user);
  // }

  // const { displayName, email, oauthId } = oauthUserData;

  // const user = await new User({ username: displayName, email }).save();

  // await new FederatedCredential({
  //   user: user._id.toString(),
  //   oauthId,
  //   provider,
  // }).save();

  // return getUserDto(user);
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

const getOrCreateUserByCredentials = async ({
  oauthId,
  provider,
  displayName,
  email,
}: OauthCredentialData): Promise<Resource['User']> => {
  const existingCredentials = await FederatedCredential.findOne({ provider, oauthId }).exec();

  // If credentials already exist, return the associated user.
  if (existingCredentials != null) {
    const user = await getUserById(existingCredentials.user.toString());

    if (user == null) {
      throw new Error('Could not find user record with associated credentials!');
    }

    return user;
  }

  // Otherwise, create new User and FederatedCredential records and save both.
  const user = await new User({ username: displayName, email }).save();

  new FederatedCredential({ user: user._id, provider, oauthId }).save();

  return getUserDto(user);
};

export default {
  createUser,
  deleteUser,
  getUsers,
  getUserById,
  getOrCreateUserByCredentials,
};
