import { RequestHandler } from 'express';
import UserService from '../services/userService';

export const getUsers: RequestHandler = async (req, res) => {
  try {
    const users = await UserService.getUsers();
    res.json(users);
  } catch (err) {
    // TODO: Error response handling
    res.send('ERROR');
  }
};

export const getUserById: RequestHandler = (req, res) => {
  // TODO: getUserById service
  const { userid } = req.params;
  res.send(`Hello, this is user [${userid}]`);
};
