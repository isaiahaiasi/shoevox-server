import commentController from './commentController';
import roomController from './roomController';
import userController from './userController';

export default {
  ...userController,
  ...roomController,
  ...commentController,
};
