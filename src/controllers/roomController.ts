import { RequestHandler } from 'express';
import { authenticateUser, authorizeSameUser } from '../middleware/authHandlers';
import roomService from '../services/roomService';
import { paginatedGetByIdentifierQueryHandler, paginatedGetQueryHandler, serviceWithIdentifierQueryHandler } from '../utils/controllerFactories';

const getRooms = paginatedGetQueryHandler(roomService.getRooms);

const getRoomsByUserId: RequestHandler = async (req, res, next) => {
  const relFunctions = {
    creator: roomService.getRoomsByCreator,
    liked: roomService.getRoomsLikedByUser,
    friends: roomService.getRoomsOfFriends,
  };

  // Query string should already be validated by prior middleware
  // TODO: don't like taking it on faith that the validation has run.
  const rel = (req.query.rel?.toString() ?? 'creator') as keyof typeof relFunctions;

  const serviceFn = relFunctions[rel];

  paginatedGetByIdentifierQueryHandler('userid', serviceFn)(req, res, next);
};

const getRoomById = serviceWithIdentifierQueryHandler('roomid', roomService.getRoomById);

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
