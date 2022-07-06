import { RequestHandler } from 'express';
import { authenticateUser } from '../middleware/authHandlers';
import { validate } from '../middleware/validators';
import commentService from '../services/commentService';
import { getFullRequestUrl } from '../utils/expressHelpers';
import { getPaginationLinks, getPaginationParams, serializeTimestampCursor } from '../utils/paginationHelpers';

const getCommentsByRoomId: RequestHandler = async (req, res) => {
  const { roomid } = req.params;
  const { limit, cursor: rawCursor } = getPaginationParams(req, 5);

  const comments = await commentService.getCommentsByRoomId(roomid, limit, rawCursor);

  const baseUrl = getFullRequestUrl(req, false);
  const links = getPaginationLinks(comments, baseUrl, limit, serializeTimestampCursor);

  res.json({
    count: comments.length,
    data: comments,
    links,
  });
};

const createCommentHandler: RequestHandler = async (req, res) => {
  const commentData = {
    room: req.params.roomid,
    user: res.locals.userId,
    content: req.body.content,
  };

  const comment = await commentService.createComment(commentData);

  res.json({
    data: comment,
  });
};

const createComment: RequestHandler[] = [
  ...validate('CommentBody'),
  authenticateUser,
  createCommentHandler,
];

const deleteCommentHandler: RequestHandler = async (req, res) => {
  const { commentid } = req.params;
  const { userId } = res.locals;

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
