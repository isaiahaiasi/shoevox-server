import { RequestHandler } from 'express';
import { authenticateUser } from '../middleware/authHandlers';
import commentService from '../services/commentService';
import { paginatedGetByIdentifierQueryHandler } from '../utils/controllerFactories';

const getCommentsByRoomId = paginatedGetByIdentifierQueryHandler(
  'roomid',
  commentService.getCommentsByRoomId,
);

const createCommentHandler: RequestHandler = async (req, res) => {
  if (!req.user) {
    // It should not be possible to hit this function without having authenticated the user
    throw new Error('User could not be found.');
  }

  const commentData = {
    room: req.params.roomid,
    user: req.user.id,
    content: req.body.content,
  };

  const comment = await commentService.createComment(commentData);

  res.json({
    data: comment,
  });
};

const createComment: RequestHandler[] = [
  authenticateUser,
  createCommentHandler,
];

const deleteCommentHandler: RequestHandler = async (req, res) => {
  if (!req.user) {
    // Prior middleware should reject request if req.user doesn't exist.
    throw new Error('User could not be found.');
  }

  const userId = req.user.id;

  const { commentid } = req.params;

  const deletedComment = await commentService.deleteComment(commentid, userId);

  return res.json({
    data: deletedComment,
  });
};

const deleteComment: RequestHandler[] = [
  authenticateUser,
  deleteCommentHandler,
];

export default {
  createComment,
  deleteComment,
  getCommentsByRoomId,
};
