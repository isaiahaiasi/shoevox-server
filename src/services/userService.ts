import User from '../models/User';
import { serializeDocument, serializeDocuments } from '../utils/mongooseHelpers';

const PUBLIC_USER_FIELDS = 'username createdAt';

const getUsers = async () => {
  const users = await User.find({}).select(PUBLIC_USER_FIELDS).exec();
  return serializeDocuments(users);
};

const getUserById = async (id: string) => {
  const user = await User.findById(id).select(PUBLIC_USER_FIELDS).exec();

  if (!user) {
    return null;
  }

  return serializeDocument(user);
};

const createUser = async (userData: { username: string, password: string }) => {
  const user = await new User(userData).save();
  return serializeDocument(user);
};

export default {
  getUsers,
  getUserById,
  createUser,
};
