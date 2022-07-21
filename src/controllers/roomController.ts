import { RequestHandler } from 'express';
import { authenticateUser, authorizeSameUser } from '../middleware/authHandlers';
import roomService from '../services/roomService';
import { createResourceNotFoundError } from '../utils/errorResponse';
import { getFullRequestUrl } from '../utils/expressHelpers';
import { getPaginationLinks, getPaginationParams, serializeTimestampCursor } from '../utils/paginationHelpers';

const getRooms: RequestHandler = async (req, res) => {
  const { limit, cursor: rawCursor } = getPaginationParams(req, 3);

  const rooms = await roomService.getRooms(limit, rawCursor);

  const baseUrl = getFullRequestUrl(req, false);
  const links = getPaginationLinks(rooms, baseUrl, limit, serializeTimestampCursor);

  res.json({
    data: rooms,
    links,
  });
};

const getRoomsByUserId: RequestHandler = async (req, res) => {
  const { limit, cursor: rawCursor } = getPaginationParams(req, 3);
  const { userid } = req.params;

  const rooms = await roomService.getRoomsByUserId(userid, limit, rawCursor);

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
    res.json(room);
  } else {
    const { originalUrl: fullPath } = req;
    const resource = 'room';
    next(
      createResourceNotFoundError({ resource, identifier: roomid, fullPath }),
    );
  }
};

const createRoomHandler: RequestHandler = async (req, res) => {
  // TODO: Get the multipart form data for the room
  const roomData = {
    creator: res.locals.userId,
    title: req.body.title,
  };

  const room = await roomService.createRoom(roomData);

  res.json({
    data: room,
  });
};

const deleteRoomHandler: RequestHandler = async (req, res) => {
  const { roomid } = req.params;
  const { userId } = res.locals;

  const deletedRoom = await roomService.deleteRoom(roomid, userId);

  res.json({
    data: deletedRoom,
  });
};

const updateRoomHandler: RequestHandler = async (req, res) => {
  const roomData = {
    id: req.params.roomid,
    creator: res.locals.userId,
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
