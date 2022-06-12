import { RequestHandler } from 'express';

export const getUsers: RequestHandler = (req, res) => {
  res.send('Hello from GET/users!');
};
