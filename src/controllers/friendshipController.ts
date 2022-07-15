import { RequestHandler } from 'express';
import { authenticateUser, authorizeSameUser } from '../middleware/authHandlers';
import { validate } from '../middleware/validators';
import friendshipService from '../services/friendshipService';
import { createErrorResponse } from '../utils/errorResponse';
import { getFullRequestUrl } from '../utils/expressHelpers';
import { getPaginationLinks, getPaginationParams, serializeTimestampCursor } from '../utils/paginationHelpers';

const getFriendshipsHandler: RequestHandler = async (req, res) => {
  const { userid } = req.params;
  const { is, status } = req.query;
  const { limit, cursor } = getPaginationParams(req, 5);

  const requestData = {
    userId: userid,
    userIs: is as 'recipient' | 'requester', // validation handled prior
    limit,
    cursor,
    status: status as 'ACCEPTED' | 'PENDING' | 'REJECTED' | undefined,
  };

  const friendships = await friendshipService.getFriendships(requestData);

  const baseUrl = getFullRequestUrl(req, false);
  const links = getPaginationLinks(
    friendships as any,
    baseUrl,
    limit,
    serializeTimestampCursor,
  );

  return res.json({
    data: friendships,
    links,
  });
};

const getFriendships = [
  ...validate('FriendshipQueryRequest'),
  authenticateUser,
  authorizeSameUser((req) => req.params.userid),
  getFriendshipsHandler,
];

const createFriendshipHandler: RequestHandler = async (req, res, next) => {
  const { userid: recipient } = req.params;
  const { userId: requester } = res.locals;

  if (recipient === requester) {
    next(createErrorResponse({
      status: 400,
      msg: 'Cannot request friendship from yourself!',
    }));
    return;
  }

  const friendshipData = { recipient, requester };

  const friendship = await friendshipService.createFriendship(friendshipData);

  res.json({
    data: friendship,
  });
};

const createFriendship = [
  authenticateUser,
  createFriendshipHandler,
];

const updateFriendshipHandler: RequestHandler = async (req, res, next) => {
  const { friendshipid } = req.params;
  const { is, status } = req.body;

  const requestData = {
    friendshipId: friendshipid,
    userId: res.locals.userId,
    userIs: is as 'recipient' | 'requester', // validation handled prior
    status: status as 'ACCEPTED' | 'REJECTED',
  };

  const friendship = await friendshipService.updateFriendship(requestData);

  if (!friendship) {
    next(createErrorResponse({
      msg: 'Could not find record of friendship.',
      status: 404,
    }));
    return;
  }

  res.json({
    data: friendship,
  });
};

const updateFriendship = [
  ...validate('FriendRequestUpdateBody'),
  authenticateUser,
  updateFriendshipHandler,
];

// const deleteFriendship: RequestHandler = (req, res, next) => {

// };

export default {
  createFriendship,
  getFriendships,
  updateFriendship,
  // deleteFriendship,
};
