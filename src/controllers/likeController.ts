import { RequestHandler } from 'express';
import { authenticateUser } from '../middleware/authHandlers';
import likeService from '../services/likeService';
import { paginatedGetByIdentifierQueryHandler } from '../utils/controllerFactories';
import { createErrorResponse } from '../utils/errorResponse';

const getLikesByRoomId = paginatedGetByIdentifierQueryHandler(
  'roomid',
  likeService.getLikesByRoomId,
);

const getLikesByUserId = paginatedGetByIdentifierQueryHandler(
  'userid',
  likeService.getLikesByRoomId,
);

const getLike: RequestHandler = async (req, res) => {
  const { roomid, userid } = req.params;

  const like = await likeService.getLike({ room: roomid, user: userid });

  if (like) {
    return res.json({
      data: like,
    });
  }

  return res.status(404).json(createErrorResponse({ status: 404 }));
};

const createLikeHandler: RequestHandler = async (req, res) => {
  if (!req.user) {
    // Prior middleware should reject request if req.user doesn't exist.
    throw new Error('User could not be found.');
  }

  const likeData = {
    room: req.params.roomid,
    user: req.user.id,
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
  if (!req.user) {
    // Prior middleware should reject request if req.user doesn't exist.
    throw new Error('User could not be found.');
  }

  const userId = req.user.id;

  const { likeid } = req.params;

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
  getLikesByUserId,
  getLike,
  deleteLike,
};
