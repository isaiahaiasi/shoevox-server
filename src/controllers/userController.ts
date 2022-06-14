import { RequestHandler } from 'express';
import UserService from '../services/userService';

export const getUsers: RequestHandler = async (req, res) => {
  const users = await UserService.getUsers();
  res.json(users);
};

export const getUserById: RequestHandler = async (req, res, next) => {
  const { userid } = req.params;

  const user = await UserService.getUserById(userid);

  if (user) {
    res.json(user);
  } else {
    // TODO: 404 helper. Just not yet sure what the correct abstraction is.
    next({ status: 404, resource: 'user', entity: userid });
  }
};
