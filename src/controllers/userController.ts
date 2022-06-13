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

export const getUserById: RequestHandler = async (req, res) => {
  const { userid } = req.params;

  try {
    const user = await UserService.getUserById(userid);

    if (user) {
      res.json(user);
    } else {
      // TODO: 404 helper
      res.status(404).send('User could not be found.');
    }
  } catch (err) {
    // TODO: Error response handling (fallback error handler)
    res.send(err);
  }
};
