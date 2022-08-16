import { RequestHandler } from 'express';
import { authenticateUser, authorizeSameUser } from '../middleware/authHandlers';
import userService from '../services/userService';
import { createResourceNotFoundError } from '../utils/errorResponse';
import { getFullRequestUrl } from '../utils/expressHelpers';
import { getPaginationLinks, getPaginationParams } from '../utils/paginationHelpers';

const getUsers: RequestHandler = async (req, res) => {
  const { limit, cursor } = getPaginationParams(req, 5);

  const users = await userService.getUsers(limit, cursor as string);

  const links = getPaginationLinks(
    users,
    getFullRequestUrl(req, false),
    limit,
    (user) => user.username,
  );

  res.json({
    data: users,
    links,
  });
};

const getUserById: RequestHandler = async (req, res, next) => {
  const { userid } = req.params;

  const user = await userService.getUserById(userid);

  if (user) {
    res.json({ data: user });
  } else {
    next(createResourceNotFoundError(
      { resource: 'user', identifier: userid, fullPath: req.originalUrl },
    ));
  }
};

const createUserHandler: RequestHandler = async (req, res, next) => {
  // get username, email (optionally), provider, and auth token
  // const { username, email } = req.body;
  // const provider = req.query.provider as Provider;
  // const token = getTokenFromHeader(req);

  // const user = await userService.createUser({
  //   provider, token,
  // });

  // if (user) {
  //   res.json(user);
  // } else {
  //   next(createGenericServerError(
  //     { method: req.method as MethodUppercase, resource: 'user' },
  //   ));
  // }

  next();
};

const createUser = [
  createUserHandler,
];

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
  createUser,
  deleteUser,
  getUsers,
  getUserById,
};
