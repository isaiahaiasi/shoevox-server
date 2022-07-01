import { RequestHandler } from 'express';
import UserService from '../services/userService';
import { Provider } from '../types/auth';
import { getTokenFromHeader } from '../utils/authHelpers';
import { createGenericServerError, createResourceNotFoundError } from '../utils/errorResponse';
import { getFullRequestUrl } from '../utils/expressHelpers';
import { getNextLink, getPaginationParams } from '../utils/paginationHelpers';
import { ApiResponseLinks, MethodUppercase } from '../utils/typeHelpers';

const getUsers: RequestHandler = async (req, res) => {
  const { limit, cursor } = getPaginationParams(req, 5);

  const users = await UserService.getUsers(limit, cursor as string);

  // Get the "next" link
  const links: ApiResponseLinks = {};
  if (users.length === limit) { // (If users < limit, we know there's no next)
    links.next = getNextLink(
      getFullRequestUrl(req, false),
      users[users.length - 1].username,
      limit,
    );
  }

  res.json({
    data: users,
    links,
  });
};

const getUserById: RequestHandler = async (req, res, next) => {
  const { userid } = req.params;

  const user = await UserService.getUserById(userid);

  if (user) {
    res.json(user);
  } else {
    next(createResourceNotFoundError(
      { resource: 'user', identifier: userid, fullPath: req.originalUrl },
    ));
  }
};

// TODO: Replace
const createUserHandler: RequestHandler = async (req, res, next) => {
  // get username, email (optionally), provider, and auth token
  // const { username, email } = req.body;
  const provider = req.query.provider as Provider;
  const token = getTokenFromHeader(req);

  const user = await UserService.createUser({
    provider, token,
  });

  if (user) {
    res.json(user);
  } else {
    next(createGenericServerError(
      { method: req.method as MethodUppercase, resource: 'user' },
    ));
  }
};

// TODO: Might want to find a better place to put these route handler chains?
const createUser = [
  // ...validate('UserBody'),
  createUserHandler,
];

export default {
  getUsers,
  getUserById,
  createUser,
};
