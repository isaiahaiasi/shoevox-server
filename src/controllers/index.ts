import commentController from './commentController';
import likeController from './likeController';
import roomController from './roomController';
import userController from './userController';

export default {
  ...userController,
  ...roomController,
  ...commentController,
  ...likeController,
};
