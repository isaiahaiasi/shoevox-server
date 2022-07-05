import { RequestHandler } from 'express';
import { authenticateUser, authorizeSameUser } from '../middleware/authHandlers';
import { validate } from '../middleware/validators';
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

// TODO: This isn't very DRY... but idk yet how I want to make the generic interface
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

const createRoom = [
  ...validate('RoomBody'),
  authenticateUser,
  authorizeSameUser((req) => req.params.userid),
  createRoomHandler,
];

export default {
  getRooms,
  getRoomById,
  createRoom,
  getRoomsByUserId,
};
