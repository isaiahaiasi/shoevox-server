import User from '../models/User';
import { serializeDocument, serializeDocuments } from '../utils/mongooseHelpers';

const PUBLIC_USER_FIELDS = 'username createdAt';

const UserService = {
  getUsers: async () => {
    const users = await User.find({}).select(PUBLIC_USER_FIELDS).exec();
    return serializeDocuments(users);
  },

  getUserById: async (id: string) => {
    const user = await User.findById(id).select(PUBLIC_USER_FIELDS).exec();

    if (!user) {
      return null;
    }

    return serializeDocument(user);
  },

  createUser: async (userData: { username: string, password: string }) => new User(userData).save(),
};

export default UserService;
