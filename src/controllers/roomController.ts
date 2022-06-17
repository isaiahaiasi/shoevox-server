import { RequestHandler } from 'express';
import roomService from '../services/roomService';
import { createResourceNotFoundError } from '../utils/errorResponse';

const getRooms: RequestHandler = async (req, res) => {
  const rooms = await roomService.getRooms();
  res.json(rooms);
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

export default {
  getRooms,
  getRoomById,
};
