import { Request, RequestHandler } from 'express';
import { authenticateUser } from '../middleware/authHandlers';
import friendshipService, { FriendshipRequestData } from '../services/friendshipService';
import { createErrorResponse } from '../utils/errorResponse';
import { getFullRequestUrl } from '../utils/expressHelpers';
import { getPaginationLinks, getPaginationParams, serializeTimestampCursor } from '../utils/paginationHelpers';

// Doing a weird thing where I've got magic limits all over the place for no reason...
// TODO: Remove magic number limits & extract all limits.
const LOCAL_DEFAULT_LIMIT = 10;

function getFriendshipRequestData(req: Request): FriendshipRequestData {
  const { userid } = req.params;
  const { is, status } = req.query;
  const paginationParams = getPaginationParams(req, LOCAL_DEFAULT_LIMIT);

  return {
    userId: userid,
    userIsRecipient: is == null ? undefined : String(is).toLowerCase() === 'recipient',
    status: status as 'ACCEPTED' | 'PENDING' | 'REJECTED' | undefined,
    paginationParams,
  };
}

const getFriendshipsHandler: RequestHandler = async (req, res) => {
  const requestData = getFriendshipRequestData(req);

  const friendships = await friendshipService.getFriendships(requestData);

  const baseUrl = getFullRequestUrl(req, false);

  const links = getPaginationLinks(
    friendships as any,
    baseUrl,
    requestData.paginationParams.limit,
    serializeTimestampCursor,
  );

  return res.json({
    data: friendships,
    links,
  });
};

// TODO: Certain query params return info that should probably require authentication
// But I'm not sure how to split control based on data not available in path?...
const getFriendships = [
  // authenticateUser,
  // authorizeSameUser((req) => req.params.userid),
  getFriendshipsHandler,
];

const getFriends: RequestHandler = async (req, res) => {
  const requestData = getFriendshipRequestData(req);

  const friends = await friendshipService.getFriends(requestData);

  const baseUrl = getFullRequestUrl(req, false);

  const links = getPaginationLinks(
    friends as any,
    baseUrl,
    requestData.paginationParams.limit,
    serializeTimestampCursor,
  );

  res.json({ data: friends, links });
};

const createFriendshipHandler: RequestHandler = async (req, res, next) => {
  const { userid: recipient } = req.params;

  if (!req.user) {
    // Prior middleware should reject request if req.user doesn't exist.
    throw new Error('User could not be found.');
  }

  const { id: requester } = req.user;

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

  if (!req.user) {
    // Prior middleware should reject request if req.user doesn't exist.
    throw new Error('User could not be found.');
  }

  const userId = req.user.id;

  const requestData = {
    friendshipId: friendshipid,
    userId,
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
  authenticateUser,
  updateFriendshipHandler,
];

export default {
  createFriendship,
  getFriendships,
  getFriends,
  updateFriendship,
  // deleteFriendship,
};
