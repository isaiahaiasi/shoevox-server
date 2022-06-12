import { RequestHandler } from 'express';

export const getUsers: RequestHandler = (req, res) => {
  // TODO: getUsers service
  res.send('Hello from GET/users!');
};

export const getUserById: RequestHandler = (req, res) => {
  // TODO: getUserById service
  const { userid } = req.params;
  res.send(`Hello, this is user [${userid}]`);
};
