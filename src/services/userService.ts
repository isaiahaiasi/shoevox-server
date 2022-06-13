import User from '../models/User';
import { serializeDocuments } from '../utils/mongooseHelpers';

const PUBLIC_USER_FIELDS = 'username createdAt';

const UserService = {
  getUsers: async () => {
    const users = await User.find({}).select(PUBLIC_USER_FIELDS).exec();
    return serializeDocuments(users);
  },
};

export default UserService;
