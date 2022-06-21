import { RequestHandler } from 'express';
import { validate } from '../middleware/validators';
import UserService from '../services/userService';
import { createGenericServerError, createResourceNotFoundError } from '../utils/errorResponse';
import { getFullRequestUrl } from '../utils/expressHelpers';
import { getNextLink, getPaginationParams } from '../utils/pagination';
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

const createUserHandler: RequestHandler = async (req, res, next) => {
  const { username, password } = req.body;
  const user = await UserService.createUser({ username, password });

  // TODO: I don't *think* save() actually returns anything other than created user
  // (Pretty sure it throws on every fail scenario)
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
  ...validate('UserBody'),
  createUserHandler,
];

export default {
  getUsers,
  getUserById,
  createUser,
};
