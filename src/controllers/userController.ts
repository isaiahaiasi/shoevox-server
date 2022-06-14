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

export const createUser: RequestHandler = async (req, res, next) => {
  const { username, password } = req.body;
  const user = await UserService.createUser({ username, password });

  // TODO: I don't *think* save() actually returns anything other than created user
  // (Pretty sure it throws on every fail scenario)
  if (user) {
    res.json(user);
  } else {
    next({ status: 500, msg: 'Could not create user.' });
  }
};
