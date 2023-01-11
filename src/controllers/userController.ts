import { RequestHandler } from 'express';
import { authenticateUser, authorizeSameUser } from '../middleware/authHandlers';
import userService from '../services/userService';
import { serviceWithIdentifierQueryHandler } from '../utils/controllerFactories';
import { getFullRequestUrl } from '../utils/expressHelpers';
import { getPaginationLinks, getPaginationParams } from '../utils/paginationHelpers';

// TODO: this doesn't use the normal timestamp cursor
// ...so, not sure how to extract to generalizable function...
const getUsers: RequestHandler = async (req, res) => {
  const rawPaginationInfo = getPaginationParams(req.query, 5);

  const users = await userService.getUsers(rawPaginationInfo);

  const links = getPaginationLinks(
    users,
    getFullRequestUrl(req, false),
    rawPaginationInfo.limit,
    (user) => user.username,
  );

  res.json({
    data: users,
    links,
  });
};

const getUserById = serviceWithIdentifierQueryHandler('userid', userService.getUserById);

const deleteUserHandler: RequestHandler = async (req, res) => {
  const { userid } = req.params;

  const deletedUser = await userService.deleteUser(userid);

  res.json({
    data: deletedUser,
  });
};

// TODO: Might want to require a Req Body with password confirm?
const deleteUser: RequestHandler[] = [
  authenticateUser,
  authorizeSameUser((req) => req.params.userid),
  deleteUserHandler,
];

export default {
  deleteUser,
  getUsers,
  getUserById,
};
