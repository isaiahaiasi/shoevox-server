import commentController from './commentController';
import friendshipController from './friendshipController';
import likeController from './likeController';
import roomController from './roomController';
import userController from './userController';

export default {
  ...userController,
  ...roomController,
  ...commentController,
  ...likeController,
  ...friendshipController,
};
