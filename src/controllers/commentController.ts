import { RequestHandler } from 'express';
import { authenticateUser } from '../middleware/authHandlers';
import { validate } from '../middleware/validators';
import commentService from '../services/commentService';
import { getFullRequestUrl } from '../utils/expressHelpers';
import { getPaginationLinks, getPaginationParams, serializeTimestampCursor } from '../utils/paginationHelpers';

const getCommentsByRoomId: RequestHandler = async (req, res) => {
  const { roomid } = req.params;
  const { limit, cursor: rawCursor } = getPaginationParams(req, 5);

  // get data
  const comments = await commentService.getCommentsByRoomId(roomid, limit, rawCursor);

  // get "next" link
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

const createComment = [
  ...validate('CommentBody'),
  authenticateUser,
  createCommentHandler,
];

export default {
  getCommentsByRoomId,
  createComment,
};
