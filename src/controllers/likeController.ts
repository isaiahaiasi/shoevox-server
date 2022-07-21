import { RequestHandler } from 'express';
import { authenticateUser } from '../middleware/authHandlers';
import likeService from '../services/likeService';
import { getFullRequestUrl } from '../utils/expressHelpers';
import { getPaginationLinks, getPaginationParams, serializeTimestampCursor } from '../utils/paginationHelpers';

const getLikesByRoomId: RequestHandler = async (req, res) => {
  const { roomid } = req.params;
  const { limit, cursor } = getPaginationParams(req, 3);

  const likes = await likeService.getLikesByRoomId(roomid, limit, cursor);

  const baseUrl = getFullRequestUrl(req, false);
  const links = getPaginationLinks(likes, baseUrl, limit, serializeTimestampCursor);

  res.json({
    data: likes,
    links,
  });
};

const createLikeHandler: RequestHandler = async (req, res) => {
  const likeData = {
    room: req.params.roomid,
    user: res.locals.userId,
  };

  const like = await likeService.createLike(likeData);

  res.json({
    data: like,
  });
};

const createLike: RequestHandler[] = [
  authenticateUser,
  createLikeHandler,
];

const deleteLikeHandler: RequestHandler = async (req, res) => {
  const { likeid } = req.params;
  const { userId } = res.locals;

  const deletedLike = await likeService.deleteLike(likeid, userId);

  return res.json({
    data: deletedLike,
  });
};

const deleteLike = [
  authenticateUser,
  deleteLikeHandler,
];

export default {
  createLike,
  getLikesByRoomId,
  deleteLike,
};
