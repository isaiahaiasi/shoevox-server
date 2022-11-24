import { RequestHandler } from 'express';
import { authenticateUser, authorizeSameUser } from '../middleware/authHandlers';
import roomService from '../services/roomService';
import { createResourceNotFoundError } from '../utils/errorResponse';
import { getFullRequestUrl } from '../utils/expressHelpers';
import { getPaginationLinks, getPaginationParams, serializeTimestampCursor } from '../utils/paginationHelpers';

const getRooms: RequestHandler = async (req, res) => {
  const { limit, cursor } = getPaginationParams(req, 3);

  const rooms = await roomService.getRooms({ limit, cursor });

  const baseUrl = getFullRequestUrl(req, false);
  const links = getPaginationLinks(rooms, baseUrl, limit, serializeTimestampCursor);

  res.json({
    data: rooms,
    links,
  });
};

const getRoomsByUserId: RequestHandler = async (req, res) => {
  const { limit, cursor } = getPaginationParams(req, 3);
  const { userid } = req.params;

  const relFunctions = {
    creator: roomService.getRoomsByCreator,
    liked: roomService.getRoomsLikedByUser,
    friends: roomService.getRoomsOfFriends,
  };

  // Query string should already be validated by prior middleware
  /*
    TODO: should not have to take on faith that the validation has run.
    It should be *confirmed* here, either by:
    - including additional error handling
    - having the validation middleware attach PROPERLY TYPED output to request object
  */
  const rel = (req.query.rel?.toString() ?? 'creator') as keyof typeof relFunctions;

  const serviceFn = relFunctions[rel];

  const rooms = await serviceFn(userid, { limit, cursor });

  const baseUrl = getFullRequestUrl(req, false);
  const links = getPaginationLinks(rooms, baseUrl, limit, serializeTimestampCursor);

  res.json({
    data: rooms,
    links,
  });
};

const getRoomById: RequestHandler = async (req, res, next) => {
  const { roomid } = req.params;
  const room = await roomService.getRoomById(roomid);

  if (room) {
    res.json({ data: room });
  } else {
    const { originalUrl: fullPath } = req;
    const resource = 'room';
    next(
      createResourceNotFoundError({ resource, identifier: roomid, fullPath }),
    );
  }
};

const createRoomHandler: RequestHandler = async (req, res) => {
  if (!req.user) {
    // Prior middleware should reject request if req.user doesn't exist.
    throw new Error('User could not be found.');
  }

  // TODO: Get the multipart form data for the room
  const roomData = {
    creator: req.user.id,
    title: req.body.title,
  };

  const room = await roomService.createRoom(roomData);

  res.json({
    data: room,
  });
};

const deleteRoomHandler: RequestHandler = async (req, res) => {
  if (!req.user) {
    // Prior middleware should reject request if req.user doesn't exist.
    throw new Error('User could not be found.');
  }

  const userId = req.user.id;
  const { roomid } = req.params;

  const deletedRoom = await roomService.deleteRoom(roomid, userId);

  res.json({
    data: deletedRoom,
  });
};

const updateRoomHandler: RequestHandler = async (req, res) => {
  if (!req.user) {
    // Prior middleware should reject request if req.user doesn't exist.
    throw new Error('User could not be found.');
  }

  const roomData = {
    id: req.params.roomid,
    creator: req.user.id,
    title: req.body.title,
  };

  const updatedRoom = roomService.updateRoom(roomData);

  res.json({
    data: updatedRoom,
  });
};

const deleteRoom: RequestHandler[] = [
  authenticateUser,
  deleteRoomHandler,
];

const createRoom = [
  authenticateUser,
  authorizeSameUser((req) => req.params.userid),
  createRoomHandler,
];
const updateRoom: RequestHandler[] = [
  authenticateUser,
  authorizeSameUser((req) => req.body.creator),
  updateRoomHandler,
];

export default {
  createRoom,
  deleteRoom,
  getRooms,
  getRoomById,
  getRoomsByUserId,
  updateRoom,
};
